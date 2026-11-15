import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import {
  isTreatmentLive,
  type Treatment,
  type TreatmentInput,
  type TreatmentContentSection,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { cleanHtml } from "../sanitize";
import { db } from "../dynamo";

const T = () => process.env.TREATMENTS_TABLE || process.env.SERVICES_TABLE;

export class TreatmentSlugTakenError extends Error {}

/** No static data - all treatments are created and managed dynamically through the admin dashboard screen */
export const DEFAULT_TREATMENTS: Treatment[] = [];

let memoryTreatments: Treatment[] = [];

export async function getTreatmentBySlug(slug: string): Promise<Treatment | undefined> {
  const normSlug = slug.toLowerCase();
  const tbl = T();
  if (tbl) {
    try {
      const r = await db().send(
        new QueryCommand({
          TableName: tbl,
          IndexName: "slug-index",
          KeyConditionExpression: "#s = :s",
          ExpressionAttributeNames: { "#s": "slug" },
          ExpressionAttributeValues: { ":s": normSlug },
          Limit: 10,
        }),
      );
      const items = (r.Items ?? []) as (Treatment & { concernsSection?: unknown; itemType?: string })[];
      const match = items.find((item) => item.id?.startsWith("trt-") || item.itemType === "treatment" || !item.concernsSection);
      if (match) return match;
    } catch (err) {
      console.warn("DynamoDB getTreatmentBySlug failed, using fallback:", (err as Error).message);
    }
  }
  return memoryTreatments.find((t) => t.slug.toLowerCase() === normSlug);
}

export async function getTreatment(id: string): Promise<Treatment | undefined> {
  const tbl = T();
  if (tbl) {
    try {
      const r = await db().send(new GetCommand({ TableName: tbl, Key: { id } }));
      const item = r.Item as (Treatment & { concernsSection?: unknown; itemType?: string }) | undefined;
      if (item && (item.id?.startsWith("trt-") || item.itemType === "treatment" || !item.concernsSection)) {
        return item;
      }
    } catch (err) {
      console.warn("DynamoDB getTreatment failed, using fallback:", (err as Error).message);
    }
  }
  return memoryTreatments.find((t) => t.id === id);
}

export async function listTreatments(serviceCategory?: ServiceCategoryId | string): Promise<Treatment[]> {
  const tbl = T();
  if (tbl) {
    try {
      const items: Treatment[] = [];
      let key: Record<string, unknown> | undefined;
      do {
        const r = await db().send(new ScanCommand({ TableName: tbl, ExclusiveStartKey: key }));
        const scanned = (r.Items ?? []) as (Treatment & { concernsSection?: unknown; itemType?: string })[];
        const filtered = scanned.filter((it) => it.id?.startsWith("trt-") || it.itemType === "treatment");
        items.push(...filtered);
        key = r.LastEvaluatedKey;
      } while (key);

      memoryTreatments = items;
    } catch (err) {
      console.warn("DynamoDB listTreatments failed, using memory store:", (err as Error).message);
    }
  }

  let res = [...memoryTreatments];
  if (serviceCategory && serviceCategory !== "all") {
    res = res.filter((t) => t.serviceCategory === serviceCategory);
  }
  return res.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function createTreatment(input: TreatmentInput): Promise<Treatment> {
  const normSlug = input.slug.toLowerCase();
  const existing = await getTreatmentBySlug(normSlug);
  if (existing) {
    throw new TreatmentSlugTakenError(`A treatment with slug "${normSlug}" already exists.`);
  }

  const sanitizedContentSections: TreatmentContentSection[] = (input.contentSections ?? []).map((s) => ({
    id: s.id || `sec-${randomUUID().slice(0, 8)}`,
    title: (s.title ?? "").trim(),
    data: cleanHtml(s.data ?? ""),
  }));

  const now = new Date().toISOString();
  const treatment: Treatment = {
    ...input,
    id: `trt-${randomUUID()}`,
    slug: normSlug,
    contentSections: sanitizedContentSections,
    sections: sanitizedContentSections,
    createdAt: now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    try {
      await db().send(new PutCommand({ TableName: tbl, Item: { ...treatment, itemType: "treatment" } }));
    } catch (err) {
      console.warn("DynamoDB createTreatment put failed, updating memory:", (err as Error).message);
    }
  }

  memoryTreatments.push(treatment);
  return treatment;
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<Treatment | undefined> {
  const existing = await getTreatment(id);
  if (!existing) return undefined;

  if (input.slug && input.slug.toLowerCase() !== existing.slug) {
    const slugOwner = await getTreatmentBySlug(input.slug.toLowerCase());
    if (slugOwner && slugOwner.id !== id) {
      throw new TreatmentSlugTakenError(`A treatment with slug "${input.slug}" already exists.`);
    }
  }

  const sanitizedContentSections: TreatmentContentSection[] | undefined = input.contentSections
    ? input.contentSections.map((s) => ({
      id: s.id || `sec-${randomUUID().slice(0, 8)}`,
      title: (s.title ?? "").trim(),
      data: cleanHtml(s.data ?? ""),
    }))
    : undefined;

  const updated: Treatment = {
    ...existing,
    ...input,
    slug: (input.slug ?? existing.slug).toLowerCase(),
    ...(sanitizedContentSections
      ? { contentSections: sanitizedContentSections, sections: sanitizedContentSections }
      : {}),
    modifiedAt: new Date().toISOString(),
  };

  const tbl = T();
  if (tbl) {
    try {
      await db().send(new PutCommand({ TableName: tbl, Item: { ...updated, itemType: "treatment" } }));
    } catch (err) {
      console.warn("DynamoDB updateTreatment put failed, updating memory:", (err as Error).message);
    }
  }

  const idx = memoryTreatments.findIndex((t) => t.id === id);
  if (idx >= 0) memoryTreatments[idx] = updated;
  else memoryTreatments.push(updated);

  return updated;
}

export async function deleteTreatment(id: string): Promise<boolean> {
  const tbl = T();
  if (tbl) {
    try {
      await db().send(new DeleteCommand({ TableName: tbl, Key: { id } }));
    } catch (err) {
      console.warn("DynamoDB deleteTreatment failed, updating memory:", (err as Error).message);
    }
  }

  const before = memoryTreatments.length;
  memoryTreatments = memoryTreatments.filter((t) => t.id !== id);
  return memoryTreatments.length < before;
}
