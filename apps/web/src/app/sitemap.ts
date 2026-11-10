import type { MetadataRoute } from "next";
import { listLiveBlogsCached } from "@/lib/db/blogs";
import { siteUrl } from "@/lib/blog-utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];
  try {
    const blogs = await listLiveBlogsCached();
    return [...base, ...blogs.map((b) => ({ url: `${siteUrl}/blogs/${b.url}`, lastModified: new Date(b.modifiedAt), changeFrequency: "monthly" as const, priority: 0.6 }))];
  } catch {
    return base; // never fail the sitemap because of a data error
  }
}
