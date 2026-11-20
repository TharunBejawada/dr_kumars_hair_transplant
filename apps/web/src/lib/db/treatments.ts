import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import {
  isTreatmentLive,
  type Treatment,
  type TreatmentInput,
  type TreatmentContentSection,
  type TreatmentFaqSection,
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
const recentlyDeletedIds = new Set<string>();

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
      const r = await db().send(new GetCommand({ TableName: tbl, Key: { id }, ConsistentRead: true }));
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
        const r = await db().send(
          new ScanCommand({
            TableName: tbl,
            ExclusiveStartKey: key,
            ConsistentRead: true,
          })
        );
        const scanned = (r.Items ?? []) as (Treatment & { concernsSection?: unknown; itemType?: string })[];
        const filtered = scanned.filter((it) => it.id?.startsWith("trt-") || it.itemType === "treatment");
        items.push(...filtered);
        key = r.LastEvaluatedKey;
      } while (key);

      const scannedIds = new Set(items.map((it) => it.id));
      for (const m of memoryTreatments) {
        if (!scannedIds.has(m.id) && !recentlyDeletedIds.has(m.id)) {
          items.push(m);
        }
      }
      memoryTreatments = items.filter((it) => !recentlyDeletedIds.has(it.id));
    } catch (err) {
      console.warn("DynamoDB listTreatments failed, using memory store:", (err as Error).message);
    }
  }

  let res = [...memoryTreatments];
  if (serviceCategory && serviceCategory !== "all") {
    res = res.filter((t) => t.serviceCategory === serviceCategory);
  }
  return res.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.title.localeCompare(b.title));
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

  const sanitizedFaqSection: TreatmentFaqSection | undefined = input.faqSection
    ? {
        heading: (input.faqSection.heading ?? "Frequently Asked Questions").trim(),
        items: (input.faqSection.items ?? [])
          .map((item) => ({
            id: item.id || `faq-${randomUUID().slice(0, 8)}`,
            question: (item.question ?? "").trim(),
            answer: cleanHtml((item.answer ?? "").trim()),
          }))
          .filter((item) => item.question.length > 0 || item.answer.length > 0),
      }
    : undefined;

  const now = new Date().toISOString();
  const treatment: Treatment = {
    ...input,
    id: `trt-${randomUUID()}`,
    slug: normSlug,
    order: Number(input.order) || 1,
    contentSections: sanitizedContentSections,
    sections: sanitizedContentSections,
    faqSection: sanitizedFaqSection,
    faqs: sanitizedFaqSection?.items ?? [],
    createdAt: now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    await db().send(new PutCommand({ TableName: tbl, Item: { ...treatment, itemType: "treatment" } }));
  }

  const existingIdx = memoryTreatments.findIndex((t) => t.id === treatment.id);
  if (existingIdx >= 0) {
    memoryTreatments[existingIdx] = treatment;
  } else {
    memoryTreatments.unshift(treatment);
  }
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

  const sanitizedFaqSection: TreatmentFaqSection | undefined = input.faqSection !== undefined
    ? {
        heading: (input.faqSection?.heading ?? "Frequently Asked Questions").trim(),
        items: (input.faqSection?.items ?? [])
          .map((item) => ({
            id: item.id || `faq-${randomUUID().slice(0, 8)}`,
            question: (item.question ?? "").trim(),
            answer: cleanHtml((item.answer ?? "").trim()),
          }))
          .filter((item) => item.question.length > 0 || item.answer.length > 0),
      }
    : undefined;

  const updated: Treatment = {
    ...existing,
    ...input,
    slug: (input.slug ?? existing.slug).toLowerCase(),
    order: input.order !== undefined ? Number(input.order) || 1 : existing.order,
    ...(sanitizedContentSections
      ? { contentSections: sanitizedContentSections, sections: sanitizedContentSections }
      : {}),
    ...(input.faqSection !== undefined
      ? { faqSection: sanitizedFaqSection, faqs: sanitizedFaqSection?.items ?? [] }
      : {}),
    modifiedAt: new Date().toISOString(),
  };

  const tbl = T();
  if (tbl) {
    await db().send(new PutCommand({ TableName: tbl, Item: { ...updated, itemType: "treatment" } }));
  }

  const idx = memoryTreatments.findIndex((t) => t.id === id);
  if (idx >= 0) memoryTreatments[idx] = updated;
  else memoryTreatments.push(updated);

  return updated;
}

export async function deleteTreatment(id: string): Promise<boolean> {
  recentlyDeletedIds.add(id);
  const tbl = T();
  if (tbl) {
    await db().send(new DeleteCommand({ TableName: tbl, Key: { id } }));
  }

  const before = memoryTreatments.length;
  memoryTreatments = memoryTreatments.filter((t) => t.id !== id);
  return memoryTreatments.length < before;
}
