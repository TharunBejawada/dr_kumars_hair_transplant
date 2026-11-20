import type { MetadataRoute } from "next";
import { listLiveBlogsCached } from "@/lib/db/blogs";
import { listLiveServicePages } from "@/lib/db/services";
import { listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";

export const dynamic = "force-dynamic";

function safeDate(val: string | null | undefined, fallback: Date): Date {
  if (!val) return fallback;
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d;
}

/**
 * Dynamic sitemap generator compliant with the Sitemaps XML protocol (sitemaps.org).
 * Dynamically includes:
 * 1. Core static pages (Home, About, Services Directory, Blogs)
 * 2. Dynamic clinical departments/categories (/[category]) from DynamoDB
 * 3. Dynamic clinical treatments (/[category]/[slug]) from DynamoDB
 * 4. Dynamic published blog articles (/blogs/[slug]) from DynamoDB
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // 2. Dynamic Services / Departments (/[category])
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const services = await listLiveServicePages();
    const serviceSlugs = new Set<string>();

    for (const s of services) {
      serviceSlugs.add(s.slug);
      servicePages.push({
        url: `${siteUrl}/${s.slug}`,
        lastModified: safeDate(s.modifiedAt, now),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    // Ensure core 4 departments are always indexed if not already present
    const coreDepartmentSlugs = ["hair", "skin-cosmetic", "dermatology", "std"];
    for (const slug of coreDepartmentSlugs) {
      if (!serviceSlugs.has(slug)) {
        servicePages.push({
          url: `${siteUrl}/${slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
    }
  } catch (err) {
    console.warn("Sitemap: Failed to load services from DB:", (err as Error).message);
  }

  // 3. Dynamic Treatments (/[category]/[slug])
  let treatmentPages: MetadataRoute.Sitemap = [];
  try {
    const treatments = await listTreatments();
    const liveTreatments = treatments.filter(isTreatmentLive);
    treatmentPages = liveTreatments.map((t) => ({
      url: `${siteUrl}/${t.serviceCategory}/${t.slug}`,
      lastModified: safeDate(t.modifiedAt || t.createdAt, now),
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch (err) {
    console.warn("Sitemap: Failed to load treatments from DB:", (err as Error).message);
  }

  // 4. Dynamic Blogs (/blogs/[slug])
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await listLiveBlogsCached();
    blogPages = blogs.map((b) => ({
      url: `${siteUrl}/blogs/${b.url}`,
      lastModified: safeDate(b.modifiedAt || b.publishAt, now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.warn("Sitemap: Failed to load blogs from DB:", (err as Error).message);
  }

  // Deduplicate URLs in case of overlaps
  const seen = new Set<string>();
  const sitemapItems: MetadataRoute.Sitemap = [];

  for (const item of [
    ...staticPages,
    ...servicePages,
    ...treatmentPages,
    ...blogPages,
  ]) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      sitemapItems.push(item);
    }
  }

  return sitemapItems;
}
