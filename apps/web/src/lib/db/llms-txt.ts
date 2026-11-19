import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import fs from "node:fs/promises";
import path from "node:path";
import {
  llmsTxtConfigSchema,
  type LlmsTxtConfig,
  type LlmsTxtConfigInput,
  type LlmsTxtLink,
  type LlmsTxtSection,
  isTreatmentLive,
} from "@drkumar/shared";
import { db } from "../dynamo";
import {
  getDefaultLlmsConfig,
  renderLlmsTxt,
  renderLlmsFullTxt,
} from "../llms-txt/generator";
import { listTreatments } from "./treatments";
import { listLiveServicePages } from "./services";
import { listLiveBlogs } from "./blogs";

const CONFIG_ID = "config-llms-txt";

const getTable = () =>
  process.env.SERVICES_TABLE || process.env.TREATMENTS_TABLE;

// Cache for dynamic configuration
let memoryCache: { config: LlmsTxtConfig; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * The only 4 allowed static pages per requirements:
 * 1. Hospital Home Page (/)
 * 2. About Us (/about)
 * 3. Doctor (/#doctor)
 * 4. Contact Us (/#contact)
 * No other static data is permitted.
 */
const ALLOWED_STATIC_PAGES: {
  id: string;
  url: string;
  title: string;
  description: string;
}[] = [
  {
    id: "lnk-home",
    url: "/",
    title: "Dr. Kumar's Skin & Hair Transplant Center",
    description:
      "Specialized dermatology and advanced hair restoration center in Kondapur, Hyderabad.",
  },
  {
    id: "lnk-about",
    url: "/about",
    title: "About Our Clinic",
    description:
      "Overview of clinic philosophy, doctor credentials, sterile surgical facilities, and patient-first medical standards.",
  },
  {
    id: "lnk-doctor",
    url: "/#doctor",
    title: "Dr. Ashok Kumar (MBBS, DDVL) – Dermatologist & Hair Specialist",
    description:
      "Founder and chief dermatologist with 13+ years of clinical experience in hair transplantation, clinical dermatology, and aesthetic medicine.",
  },
  {
    id: "lnk-contact",
    url: "/#contact",
    title: "Contact Us & Clinic Location",
    description:
      "Clinic address: 301, K1 Promo Building, Above Ratnadeep Super Market, Kondapur, Hyderabad. Phone: +91 99639 32050.",
  },
];

function getPublicDirs(): string[] {
  const cwd = process.cwd();
  if (cwd.endsWith("apps\\web") || cwd.endsWith("apps/web")) {
    return [path.resolve(cwd, "public")];
  }
  return [
    path.resolve(cwd, "apps", "web", "public"),
    path.resolve(cwd, "public"),
  ];
}

/**
 * Safely writes fallback files to public directory on disk so
 * the public route NEVER 500s even if the database is offline.
 */
async function writeDiskFallbacks(config: LlmsTxtConfig) {
  try {
    const llmsTxtContent = renderLlmsTxt(config);
    const llmsFullTxtContent = renderLlmsFullTxt(config);
    const publicDirs = getPublicDirs();

    for (const dir of publicDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        await Promise.all([
          fs.writeFile(path.join(dir, "llms-fallback.txt"), llmsTxtContent, "utf8"),
          fs.writeFile(path.join(dir, "llms-full-fallback.txt"), llmsFullTxtContent, "utf8"),
        ]);
      } catch {
        // Continue to other directory if one fails
      }
    }
  } catch (err) {
    console.warn(
      "Could not write fallback llms.txt to disk:",
      (err as Error).message
    );
  }
}

/**
 * Reads fallback file from public directory on disk if database is unavailable.
 */
async function readDiskFallback(isFull = false): Promise<string | null> {
  const filename = isFull ? "llms-full-fallback.txt" : "llms-fallback.txt";
  const publicDirs = getPublicDirs();
  for (const dir of publicDirs) {
    try {
      const filePath = path.join(dir, filename);
      const content = await fs.readFile(filePath, "utf8");
      if (content) return content;
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Constructs the strictly compliant configuration containing:
 * - Hospital Information (strictly Home, About, Doctor, Contact Us)
 * - Dynamic Services from DB
 * - Dynamic Treatments from DB
 * - Dynamic Blogs from DB
 * Apart from these, absolutely no static data is added.
 */
export async function getDynamicLlmsConfig(
  forceFresh = false
): Promise<LlmsTxtConfig> {
  const now = Date.now();
  if (!forceFresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.config;
  }

  // 1. Get base metadata (either stored from DynamoDB or defaults)
  let baseConfig = getDefaultLlmsConfig();
  const tbl = getTable();
  if (tbl) {
    try {
      const res = await db().send(
        new GetCommand({
          TableName: tbl,
          Key: { id: CONFIG_ID },
        })
      );
      if (res.Item) {
        const parsed = llmsTxtConfigSchema.safeParse(res.Item);
        if (parsed.success) {
          baseConfig = {
            ...baseConfig,
            title: parsed.data.title || baseConfig.title,
            tagline: parsed.data.tagline || baseConfig.tagline,
            summary: parsed.data.summary || baseConfig.summary,
            systemInstructions:
              parsed.data.systemInstructions || baseConfig.systemInstructions,
            baseUrl: parsed.data.baseUrl || baseConfig.baseUrl,
          };
        }
      }
    } catch (err) {
      console.warn("DynamoDB getLlmsConfig failed, using defaults:", (err as Error).message);
    }
  }

  // 2. Static Section: Only the 4 allowed static pages
  const staticHospitalSection: LlmsTxtSection = {
    id: "sec-hospital-info",
    title: "Hospital Information",
    description: "Core clinic details, doctor credentials, and contact channels.",
    isOptional: false,
    links: ALLOWED_STATIC_PAGES.map((page) => ({
      id: page.id,
      title: page.title,
      url: page.url,
      description: page.description,
      inLlmsTxt: true,
      inLlmsFullTxt: true,
      entityType: "page" as const,
    })),
  };

  const sections: LlmsTxtSection[] = [staticHospitalSection];

  // 3. Dynamic Services from DB
  try {
    const liveServices = await listLiveServicePages();
    if (liveServices.length > 0) {
      const serviceLinks: LlmsTxtLink[] = liveServices.map((s) => ({
        id: `sync-dept-${s.id || s.slug}`,
        title: s.title,
        url: `/department/${s.slug}`,
        description:
          s.subtitle ||
          s.metaDescription ||
          `Specialized department services for ${s.title} in Kondapur, Hyderabad.`,
        inLlmsTxt: true,
        inLlmsFullTxt: true,
        isAutoGenerated: true,
        entityType: "service" as const,
      }));

      sections.push({
        id: "sec-services-dynamic",
        title: "Clinical Services & Departments",
        description: "Specialized clinical departments operated by Dr. Ashok Kumar.",
        isOptional: false,
        links: serviceLinks,
      });
    }
  } catch (err) {
    console.warn("Dynamic services fetch failed for llms.txt:", (err as Error).message);
  }

  // 4. Dynamic Treatments from DB
  try {
    const treatments = await listTreatments();
    const liveTreatments = treatments.filter(isTreatmentLive);
    if (liveTreatments.length > 0) {
      const treatmentLinks: LlmsTxtLink[] = liveTreatments.map((t) => ({
        id: `sync-trt-${t.id || t.slug}`,
        title: t.title,
        url: `/service/${t.slug}`,
        description:
          t.summary ||
          t.metaDescription ||
          `Specialized ${t.title} treatment conducted under physician supervision in Kondapur, Hyderabad.`,
        inLlmsTxt: true,
        inLlmsFullTxt: true,
        isAutoGenerated: true,
        entityType: "treatment" as const,
      }));

      sections.push({
        id: "sec-treatments-dynamic",
        title: "Clinical Treatments & Procedures",
        description: "Evidence-based hair restoration, dermatology, and aesthetic procedures.",
        isOptional: false,
        links: treatmentLinks,
      });
    }
  } catch (err) {
    console.warn("Dynamic treatments fetch failed for llms.txt:", (err as Error).message);
  }

  // 5. Dynamic Blogs from DB
  try {
    const blogs = await listLiveBlogs();
    if (blogs.length > 0) {
      const blogLinks: LlmsTxtLink[] = blogs.map((b) => ({
        id: `sync-blog-${b.id || b.url}`,
        title: b.blogTitle,
        url: `/blogs/${b.url}`,
        description:
          b.metaDescription ||
          b.seoTitle ||
          "Evidence-based clinical insights and medical advice by Dr. Ashok Kumar.",
        inLlmsTxt: true,
        inLlmsFullTxt: true,
        isAutoGenerated: true,
        entityType: "blog" as const,
      }));

      sections.push({
        id: "sec-blogs-dynamic",
        title: "Dermatology & Hair Health Articles",
        description: "Doctor-authored clinical guides, procedure insights, and aftercare resources.",
        isOptional: false,
        links: blogLinks,
      });
    }
  } catch (err) {
    console.warn("Dynamic blogs fetch failed for llms.txt:", (err as Error).message);
  }

  const finalConfig: LlmsTxtConfig = {
    ...baseConfig,
    sections,
  };

  memoryCache = { config: finalConfig, timestamp: now };

  // Write disk fallbacks in background
  writeDiskFallbacks(finalConfig).catch(() => {});

  return finalConfig;
}

/**
 * Retrieves the stored or dynamically populated LLMs.txt configuration.
 */
export async function getLlmsConfig(forceFresh = false): Promise<LlmsTxtConfig> {
  return getDynamicLlmsConfig(forceFresh);
}

/**
 * Saves LLMs.txt configuration in DynamoDB and refreshes cache/disk fallbacks.
 */
export async function saveLlmsConfig(
  input: LlmsTxtConfigInput
): Promise<LlmsTxtConfig> {
  const now = new Date().toISOString();
  const parsed = llmsTxtConfigSchema.parse({
    ...input,
    id: CONFIG_ID,
    updatedAt: now,
  });

  const tbl = getTable();
  if (tbl) {
    try {
      await db().send(
        new PutCommand({
          TableName: tbl,
          Item: {
            ...parsed,
            id: CONFIG_ID,
            itemType: "config-llms-txt",
          },
        })
      );
    } catch (err) {
      console.warn(
        "DynamoDB saveLlmsConfig failed, keeping in memory:",
        (err as Error).message
      );
    }
  }

  // Clear memory cache so next read will dynamically re-evaluate
  memoryCache = null;
  const refreshed = await getDynamicLlmsConfig(true);
  await writeDiskFallbacks(refreshed);

  return refreshed;
}

/**
 * Returns rendered markdown for /llms.txt with zero-fail fallback guarantee.
 */
export async function getRenderedLlmsTxt(): Promise<string> {
  try {
    const config = await getDynamicLlmsConfig();
    return renderLlmsTxt(config);
  } catch (err) {
    console.error("Failed to render llms.txt from config:", err);
    const diskFallback = await readDiskFallback(false);
    if (diskFallback) return diskFallback;
    return renderLlmsTxt(getDefaultLlmsConfig());
  }
}

/**
 * Returns rendered markdown for /llms-full.txt with zero-fail fallback guarantee.
 */
export async function getRenderedLlmsFullTxt(): Promise<string> {
  try {
    const config = await getDynamicLlmsConfig();
    return renderLlmsFullTxt(config);
  } catch (err) {
    console.error("Failed to render llms-full.txt from config:", err);
    const diskFallback = await readDiskFallback(true);
    if (diskFallback) return diskFallback;
    return renderLlmsFullTxt(getDefaultLlmsConfig());
  }
}

/**
 * Re-syncs database entities into the configuration, strictly ensuring
 * that no static entries exist other than Home, About Us, Doctor, and Contact Us.
 */
export async function syncEntitiesWithConfig(
  currentConfig: LlmsTxtConfig
): Promise<{ config: LlmsTxtConfig; addedCount: number }> {
  const freshConfig = await getDynamicLlmsConfig(true);
  const currentLinkUrls = new Set(
    currentConfig.sections.flatMap((s) => s.links.map((l) => l.url.toLowerCase()))
  );
  let addedCount = 0;
  for (const s of freshConfig.sections) {
    for (const l of s.links) {
      if (!currentLinkUrls.has(l.url.toLowerCase())) {
        addedCount++;
      }
    }
  }
  return { config: freshConfig, addedCount };
}
