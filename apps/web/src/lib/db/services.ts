import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import {
  isServicePageLive,
  type ServicePage,
  type ServicePageInput,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { db, tableName } from "../dynamo";

const T = () => tableName("SERVICES_TABLE");

export class SlugTakenError extends Error {}

export const DEFAULT_SERVICE_PAGES: ServicePage[] = [
  {
    id: "seed-service-hair",
    serviceCategory: "hair",
    title: "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad",
    slug: "hair",
    subtitle: "Personalised Care for Hair Fall, Thinning Hair & Baldness",
    image: "/images/services-hero-sample.jpg",
    imageAlt: "Advanced Hair Loss & Hair Restoration Treatments - Dr. Kumar's",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 1,
    seoTitle: "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad",
    metaDescription:
      "Personalised care for hair fall, thinning hair, baldness and advanced hair restoration procedures by Dr. Kumar in Kondapur, Hyderabad.",
    concernsSection: {
      tagline: "Understanding Your Hair Concerns",
      heading: "Different Hair Problems Need Different Treatment Approaches",
      description:
        "Hair loss does not always begin with visible baldness. Some people notice excessive hair shedding, while others experience gradual thinning or changes in their hairline.",
      items: [
        { id: "c1", title: "Excessive hair fall", image: "/images/concerns/excessive-hair-fall.webp" },
        { id: "c2", title: "Receding hairline", image: "/images/concerns/receding-hairline.webp" },
        { id: "c3", title: "Male pattern baldness", image: "/images/concerns/male-pattern-baldness.webp" },
        { id: "c4", title: "Female pattern hair loss", image: "/images/concerns/female-pattern-hair-loss.webp" },
        { id: "c5", title: "Thinning hair at the crown", image: "/images/concerns/thinning-hair-crown.webp" },
        { id: "c6", title: "Bald patches", image: "/images/concerns/bald-patches.webp" },
        { id: "c7", title: "Widening hair parting", image: "/images/concerns/widening-hair-parting.webp" },
        { id: "c8", title: "Reduced hair density", image: "/images/concerns/reduced-hair-density.webp" },
      ],
      sideCard: {
        image: "/images/concerns/side-woman.webp",
        text1:
          "Early evaluation can help identify possible causes and determine whether medical treatment, supportive procedures, or hair transplantation may be appropriate.",
        text2:
          "At Dr. Kumar’s Skin & Hair Transplant Center, patients looking for a hair specialist in Kondapur, Hyderabad can receive individualised assessment and guidance for different hair loss concerns.",
        ctaText: "Consult Our Hair Specialist",
        ctaLink: "#appointment",
      },
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-skin",
    serviceCategory: "skin-cosmetic",
    title: "Cosmetic & Skin Rejuvenation Treatments in Kondapur, Hyderabad",
    slug: "skin-cosmetic",
    subtitle: "Personalised Care for Glowing, Radiant & Healthy Skin",
    image: "/images/oval1.webp",
    imageAlt: "Cosmetic & Skin Rejuvenation Treatments",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 2,
    seoTitle: "Cosmetic & Skin Rejuvenation Treatments | Dr. Kumar's",
    metaDescription:
      "Comprehensive aesthetic treatments including HydraFacial, Chemical Peels, MNRF, and skin glow solutions tailored to your unique skin.",
    concernsSection: {
      tagline: "Understanding Your Skin Concerns",
      heading: "Targeted Solutions for Healthier, Rejuvenated Skin",
      description:
        "Every skin type has unique requirements. We address dullness, uneven texture, acne marks, and age-related changes with medical precision.",
      items: [
        { id: "s1", title: "Acne & breakouts", image: "/images/oval1.webp" },
        { id: "s2", title: "Pigmentation & spots", image: "/images/oval2.webp" },
        { id: "s3", title: "Fine lines & wrinkles", image: "/images/oval3.webp" },
        { id: "s4", title: "Dull & tired skin", image: "/images/oval4.webp" },
      ],
      sideCard: {
        image: "/images/oval2.webp",
        text1: "Comprehensive dermatology consultations help create a personalised protocol matching your skin goals.",
        text2: "Consult with Dr. Kumar for clinical facials, peels, and advanced laser therapies in Kondapur, Hyderabad.",
        ctaText: "Consult Our Skin Specialist",
        ctaLink: "#appointment",
      },
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-dermatology",
    serviceCategory: "dermatology",
    title: "Expert Clinical Dermatology & Skin Care in Kondapur, Hyderabad",
    slug: "dermatology",
    subtitle: "Evidence-Based Solutions for Chronic & Complex Skin Conditions",
    image: "/images/oval3.webp",
    imageAlt: "Clinical Dermatology & Skin Care",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 3,
    seoTitle: "Clinical Dermatology & Skin Disease Management | Dr. Kumar's",
    metaDescription:
      "Expert medical diagnosis and management for psoriasis, eczema, acne, vitiligo, and various skin allergies and infections.",
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-std",
    serviceCategory: "std",
    title: "Confidential STI & Sexual Health Consultations in Kondapur, Hyderabad",
    slug: "std",
    subtitle: "Discreet, Compassionate & Non-Judgmental Medical Care",
    image: "/images/oval5.webp",
    imageAlt: "Confidential STI Care",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 4,
    seoTitle: "Confidential STI & Sexual Health Diagnosis & Care | Dr. Kumar's",
    metaDescription:
      "Private and respectful assessment, testing, and comprehensive medical management for sexually transmitted infections.",
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

// In-memory fallback if DynamoDB is unreachable or not yet populated in local environment
let memoryStore: ServicePage[] = [...DEFAULT_SERVICE_PAGES];

export async function getServicePageBySlug(slug: string): Promise<ServicePage | undefined> {
  const normSlug = slug.toLowerCase();
  try {
    const r = await db().send(
      new QueryCommand({
        TableName: T(),
        IndexName: "slug-index",
        KeyConditionExpression: "#s = :s",
        ExpressionAttributeNames: { "#s": "slug" },
        ExpressionAttributeValues: { ":s": normSlug },
        Limit: 1,
      }),
    );
    const item = r.Items?.[0] as ServicePage | undefined;
    if (item) return item;
  } catch (err) {
    // Fall back to memoryStore
    console.warn("DynamoDB getServicePageBySlug query failed, using fallback:", (err as Error).message);
  }
  return memoryStore.find((p) => p.slug.toLowerCase() === normSlug);
}

export async function getServicePage(id: string): Promise<ServicePage | undefined> {
  try {
    const r = await db().send(new GetCommand({ TableName: T(), Key: { id } }));
    const item = r.Item as ServicePage | undefined;
    if (item) return item;
  } catch (err) {
    console.warn("DynamoDB getServicePage failed, using fallback:", (err as Error).message);
  }
  return memoryStore.find((p) => p.id === id);
}

export async function listServicePages(category?: ServiceCategoryId | string): Promise<ServicePage[]> {
  try {
    const items: ServicePage[] = [];
    let key: Record<string, unknown> | undefined;
    do {
      const r = await db().send(new ScanCommand({ TableName: T(), ExclusiveStartKey: key }));
      items.push(...((r.Items ?? []) as ServicePage[]));
      key = r.LastEvaluatedKey;
    } while (key);

    if (items.length > 0) {
      // Sync memoryStore
      memoryStore = items;
    } else {
      // If table is completely empty, seed default pages into DB
      for (const p of DEFAULT_SERVICE_PAGES) {
        try {
          await db().send(new PutCommand({ TableName: T(), Item: p }));
          items.push(p);
        } catch {
          // ignore seed errors
        }
      }
      if (items.length === 0) items.push(...DEFAULT_SERVICE_PAGES);
      memoryStore = items;
    }
  } catch (err) {
    console.warn("DynamoDB listServicePages scan failed, using fallback:", (err as Error).message);
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

export async function createServicePage(input: ServicePageInput): Promise<ServicePage> {
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

  try {
    await db().send(
      new PutCommand({
        TableName: T(),
        Item: page,
        ConditionExpression: "attribute_not_exists(id)",
      }),
    );
  } catch (err) {
    console.warn("DynamoDB createServicePage failed, saving to memory fallback:", (err as Error).message);
  }

  // Update memoryStore
  const idx = memoryStore.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function updateServicePage(id: string, input: ServicePageInput): Promise<ServicePage | null> {
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

  try {
    await db().send(new PutCommand({ TableName: T(), Item: page }));
  } catch (err) {
    console.warn("DynamoDB updateServicePage failed, updating memory fallback:", (err as Error).message);
  }

  const idx = memoryStore.findIndex((p) => p.id === id);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function deleteServicePage(id: string): Promise<void> {
  try {
    await db().send(new DeleteCommand({ TableName: T(), Key: { id } }));
  } catch (err) {
    console.warn("DynamoDB deleteServicePage failed:", (err as Error).message);
  }
  memoryStore = memoryStore.filter((p) => p.id !== id);
}
