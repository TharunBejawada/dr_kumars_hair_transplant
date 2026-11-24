import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  isServicePageLive,
  type ServicePage,
  type ServicePageInput,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { cleanHtml } from "../sanitize";
import { db } from "../dynamo";

function getTableName(): string | undefined {
  if (process.env.SERVICES_TABLE) return process.env.SERVICES_TABLE;

  try {
    const candidates = [
      path.join(process.cwd(), "amplify_outputs.json"),
      path.join(process.cwd(), "apps/web/amplify_outputs.json"),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (parsed?.custom?.servicesTable) return parsed.custom.servicesTable;
      }
    }
  } catch {}

  return undefined;
}

const T = () => getTableName();

export function isServiceItem(item: unknown): item is ServicePage {
  if (!item || typeof item !== "object") return false;
  const p = item as Record<string, unknown>;
  if (p.id === "config-llms-txt") return false;
  if (typeof p.id === "string" && p.id.startsWith("trt-")) return false;
  if (p.itemType === "treatment") return false;
  return Boolean(p.slug || p.serviceCategory);
}

export class SlugTakenError extends Error {}

/** No static data - all service pages are created and managed dynamically through the admin dashboard screen */
export const DEFAULT_SERVICE_PAGES: ServicePage[] = [];

// In-memory fallback if DynamoDB is unreachable or not yet populated in local environment
let memoryStore: ServicePage[] = [];

export async function getServicePageBySlug(slug: string): Promise<ServicePage | undefined> {
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
      const items = (r.Items ?? []) as (ServicePage & { itemType?: string })[];
      const item = items.find(isServiceItem);
      if (item) return item;
    } catch (err) {
      console.warn("DynamoDB getServicePageBySlug query failed, using fallback:", (err as Error).message);
    }
  }
  return memoryStore.find((p) => p.slug.toLowerCase() === normSlug);
}

export async function getServicePage(id: string): Promise<ServicePage | undefined> {
  const tbl = T();
  if (tbl) {
    try {
      const r = await db().send(new GetCommand({ TableName: tbl, Key: { id }, ConsistentRead: true }));
      const item = r.Item as (ServicePage & { itemType?: string }) | undefined;
      if (item && isServiceItem(item)) return item;
    } catch (err) {
      console.warn("DynamoDB getServicePage failed, using fallback:", (err as Error).message);
    }
  }
  return memoryStore.find((p) => p.id === id);
}

export async function listServicePages(category?: ServiceCategoryId | string): Promise<ServicePage[]> {
  const tbl = T();
  if (tbl) {
    try {
      const items: ServicePage[] = [];
      let key: Record<string, unknown> | undefined;
      do {
        const r = await db().send(new ScanCommand({ TableName: tbl, ExclusiveStartKey: key }));
        const scanned = (r.Items ?? []) as (ServicePage & { itemType?: string })[];
        const serviceOnly = scanned.filter(isServiceItem);
        items.push(...serviceOnly);
        key = r.LastEvaluatedKey;
      } while (key);

      memoryStore = items;
    } catch (err) {
      console.warn("DynamoDB listServicePages scan failed, using fallback:", (err as Error).message);
    }
  }

  let result = [...memoryStore];
  if (category) {
    result = result.filter((p) => p.serviceCategory === category);
  }
  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.modifiedAt.localeCompare(a.modifiedAt));
}

export async function listLiveServicePages(category?: ServiceCategoryId | string): Promise<ServicePage[]> {
  const all = await listServicePages(category);
  return all.filter((p) => isServicePageLive(p));
}

function sanitizeServicePageInput(input: ServicePageInput): ServicePageInput {
  return {
    ...input,
    concernsSection: input.concernsSection
      ? { ...input.concernsSection, description: cleanHtml(input.concernsSection.description) }
      : undefined,
    treatmentsSection: input.treatmentsSection
      ? { ...input.treatmentsSection, description: cleanHtml(input.treatmentsSection.description) }
      : undefined,
    assessmentSection: input.assessmentSection
      ? { ...input.assessmentSection, description: cleanHtml(input.assessmentSection.description) }
      : undefined,
  };
}

export async function createServicePage(rawInput: ServicePageInput): Promise<ServicePage> {
  const input = sanitizeServicePageInput(rawInput);
  const normSlug = input.slug.toLowerCase();
  const existing = await getServicePageBySlug(normSlug);
  if (existing) throw new SlugTakenError("This URL slug is already taken by another service page");

  const now = new Date().toISOString();
  const page: ServicePage = {
    ...input,
    id: randomUUID(),
    slug: normSlug,
    createdAt: now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    await db().send(
      new PutCommand({
        TableName: tbl,
        Item: page,
        ConditionExpression: "attribute_not_exists(id)",
      }),
    );
  }

  // Update memoryStore
  const idx = memoryStore.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function updateServicePage(id: string, rawInput: ServicePageInput): Promise<ServicePage | null> {
  const input = sanitizeServicePageInput(rawInput);
  const current = await getServicePage(id);
  if (!current) return null;

  const normSlug = input.slug.toLowerCase();
  const clash = await getServicePageBySlug(normSlug);
  if (clash && clash.id !== id) {
    throw new SlugTakenError("This URL slug is already taken by another service page");
  }

  const now = new Date().toISOString();
  const page: ServicePage = {
    ...input,
    id,
    slug: normSlug,
    createdAt: current.createdAt || now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    await db().send(new PutCommand({ TableName: tbl, Item: page }));
  }

  const idx = memoryStore.findIndex((p) => p.id === id);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function deleteServicePage(id: string): Promise<void> {
  const tbl = T();
  if (tbl) {
    await db().send(new DeleteCommand({ TableName: tbl, Key: { id } }));
  }
  memoryStore = memoryStore.filter((p) => p.id !== id);
}
