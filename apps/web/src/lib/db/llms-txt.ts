import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import fs from "node:fs/promises";
import path from "node:path";
import {
  llmsTxtConfigSchema,
  type LlmsTxtConfig,
  type LlmsTxtConfigInput,
  type LlmsTxtLink,
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

// In-memory cache for ultra-fast serving
let memoryCache: { config: LlmsTxtConfig; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Safely writes fallback files to public directory on disk so
 * the public route NEVER 500s even if the database is offline.
 */
async function writeDiskFallbacks(config: LlmsTxtConfig) {
  try {
    const publicDir = path.resolve(process.cwd(), "public");
    const llmsTxtContent = renderLlmsTxt(config);
    const llmsFullTxtContent = renderLlmsFullTxt(config);

    // Note: Do NOT write to public/llms.txt or public/llms-full.txt because Next.js
    // disallows simultaneous public/ files and app/ route handlers with the same path.
    await Promise.all([
      fs.writeFile(path.join(publicDir, "llms-fallback.txt"), llmsTxtContent, "utf8"),
      fs.writeFile(path.join(publicDir, "llms-full-fallback.txt"), llmsFullTxtContent, "utf8"),
    ]);
  } catch (err) {
    // Non-fatal if filesystem is read-only (e.g. AWS Lambda without /tmp)
    console.warn("Could not write fallback llms.txt to disk:", (err as Error).message);
  }
}

/**
 * Reads fallback file from public directory on disk if database is unavailable.
 */
async function readDiskFallback(isFull = false): Promise<string | null> {
  try {
    const filename = isFull ? "llms-full-fallback.txt" : "llms-fallback.txt";
    const filePath = path.resolve(process.cwd(), "public", filename);
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * Retrieves the stored LLMs.txt configuration from DynamoDB,
 * with multi-tier in-memory cache and static fallback.
 */
export async function getLlmsConfig(forceFresh = false): Promise<LlmsTxtConfig> {
  const now = Date.now();
  if (!forceFresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.config;
  }

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
          memoryCache = { config: parsed.data, timestamp: now };
          return parsed.data;
        }
        console.warn("Invalid stored LLMs.txt config in DynamoDB, using defaults.");
      }
    } catch (err) {
      console.warn("DynamoDB getLlmsConfig query failed:", (err as Error).message);
    }
  }

  // Fallback to default
  const defaultConfig = getDefaultLlmsConfig();
  memoryCache = { config: defaultConfig, timestamp: now };
  return defaultConfig;
}

/**
 * Saves and validates LLMs.txt configuration in DynamoDB,
 * updating the memory cache and writing static disk fallbacks.
 */
export async function saveLlmsConfig(input: LlmsTxtConfigInput): Promise<LlmsTxtConfig> {
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
      console.warn("DynamoDB saveLlmsConfig failed, keeping in memory:", (err as Error).message);
    }
  }

  memoryCache = { config: parsed, timestamp: Date.now() };

  // Write disk fallbacks asynchronously
  await writeDiskFallbacks(parsed);

  return parsed;
}

/**
 * Returns rendered markdown for /llms.txt with zero-fail fallback guarantee.
 */
export async function getRenderedLlmsTxt(): Promise<string> {
  try {
    const config = await getLlmsConfig();
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
    const config = await getLlmsConfig();
    return renderLlmsFullTxt(config);
  } catch (err) {
    console.error("Failed to render llms-full.txt from config:", err);
    const diskFallback = await readDiskFallback(true);
    if (diskFallback) return diskFallback;
    return renderLlmsFullTxt(getDefaultLlmsConfig());
  }
}

/**
 * Dynamically pulls public entities (Treatments, Services/Departments, Blogs)
 * from the app's database and intelligently merges them into the sections.
 */
export async function syncEntitiesWithConfig(
  currentConfig: LlmsTxtConfig
): Promise<{ config: LlmsTxtConfig; addedCount: number }> {
  let addedCount = 0;
  const config = JSON.parse(JSON.stringify(currentConfig)) as LlmsTxtConfig;

  // Build a set of all known URLs/slugs already present in sections
  const existingUrls = new Set<string>();
  for (const section of config.sections) {
    for (const link of section.links) {
      existingUrls.add(link.url.toLowerCase());
      if (link.url.startsWith("/")) {
        existingUrls.add(link.url.slice(1).toLowerCase());
      }
    }
  }

  // 1. Fetch live treatments
  try {
    const treatments = await listTreatments();
    const liveTreatments = treatments.filter(isTreatmentLive);

    // Locate or create Treatments section
    let trtSection = config.sections.find(
      (s) =>
        s.id === "sec-hair-transplant" ||
        s.title.toLowerCase().includes("treatment")
    );
    if (!trtSection) {
      trtSection = {
        id: `sec-treatments-${Date.now()}`,
        title: "Clinical Treatments & Procedures",
        description: "Medical and surgical treatments available at the clinic.",
        isOptional: false,
        links: [],
      };
      config.sections.push(trtSection);
    }

    for (const t of liveTreatments) {
      const url = `/service/${t.slug}`;
      if (!existingUrls.has(url.toLowerCase()) && !existingUrls.has(`service/${t.slug}`)) {
        const newLink: LlmsTxtLink = {
          id: `sync-trt-${t.id || t.slug}`,
          title: t.title,
          url,
          description:
            t.summary ||
            t.metaDescription ||
            `Specialized ${t.title} treatment conducted under physician supervision in Kondapur, Hyderabad.`,
          inLlmsTxt: true,
          inLlmsFullTxt: true,
          isAutoGenerated: true,
          entityType: "treatment",
        };
        trtSection.links.push(newLink);
        existingUrls.add(url.toLowerCase());
        addedCount++;
      }
    }
  } catch (err) {
    console.warn("Auto-sync treatments failed:", (err as Error).message);
  }

  // 2. Fetch live service pages / departments
  try {
    const services = await listLiveServicePages();
    let deptSection = config.sections.find(
      (s) =>
        s.id === "sec-core-departments" ||
        s.title.toLowerCase().includes("department")
    );
    if (!deptSection) {
      deptSection = {
        id: `sec-departments-${Date.now()}`,
        title: "Clinical Departments",
        description: "Specialized clinical departments operated by the clinic.",
        isOptional: false,
        links: [],
      };
      config.sections.unshift(deptSection);
    }

    for (const s of services) {
      const url = `/department/${s.slug}`;
      if (!existingUrls.has(url.toLowerCase()) && !existingUrls.has(`department/${s.slug}`)) {
        const newLink: LlmsTxtLink = {
          id: `sync-dept-${s.id || s.slug}`,
          title: s.title,
          url,
          description:
            s.subtitle ||
            s.metaDescription ||
            `Specialized department services for ${s.title} in Kondapur, Hyderabad.`,
          inLlmsTxt: true,
          inLlmsFullTxt: true,
          isAutoGenerated: true,
          entityType: "service",
        };
        deptSection.links.push(newLink);
        existingUrls.add(url.toLowerCase());
        addedCount++;
      }
    }
  } catch (err) {
    console.warn("Auto-sync services failed:", (err as Error).message);
  }

  // 3. Fetch published blogs
  try {
    const blogs = await listLiveBlogs();
    if (blogs.length > 0) {
      let blogSection = config.sections.find(
        (s) =>
          s.id === "sec-blogs" ||
          s.title.toLowerCase().includes("blog") ||
          s.title.toLowerCase().includes("patient resources")
      );
      if (!blogSection) {
        blogSection = {
          id: `sec-blogs-${Date.now()}`,
          title: "Dermatology & Hair Health Articles",
          description: "Doctor-authored clinical guides and educational resources.",
          isOptional: false,
          links: [],
        };
        config.sections.push(blogSection);
      }

      for (const b of blogs) {
        const url = `/blogs/${b.url}`;
        if (!existingUrls.has(url.toLowerCase()) && !existingUrls.has(`blogs/${b.url}`)) {
          const newLink: LlmsTxtLink = {
            id: `sync-blog-${b.id || b.url}`,
            title: b.blogTitle,
            url,
            description:
              b.metaDescription ||
              b.seoTitle ||
              "Evidence-based clinical insights and advice by Dr. Ashok Kumar.",
            inLlmsTxt: false, // Core stays concise; full gets all blogs
            inLlmsFullTxt: true,
            isAutoGenerated: true,
            entityType: "blog",
          };
          blogSection.links.push(newLink);
          existingUrls.add(url.toLowerCase());
          addedCount++;
        }
      }
    }
  } catch (err) {
    console.warn("Auto-sync blogs failed:", (err as Error).message);
  }

  return { config, addedCount };
}
