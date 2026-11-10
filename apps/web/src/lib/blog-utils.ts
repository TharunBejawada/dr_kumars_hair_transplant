import type { Blog } from "@drkumar/shared";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.drkumarshairtransplant.com";
export const siteUrl = SITE.replace(/\/$/, "");

const stripTags = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

export function excerpt(b: Pick<Blog, "metaDescription" | "extraFields">, max = 150) {
  const text = b.metaDescription || stripTags(b.extraFields?.[0]?.description ?? "");
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

export const plainText = stripTags;

/** Date shown to readers: the blog's "timeline" date if set, otherwise when it went live. */
export function displayDate(b: Pick<Blog, "timeline" | "publishAt">) {
  const iso = b.timeline || b.publishAt;
  if (!iso) return "";
  const d = new Date(b.timeline ? `${b.timeline}T00:00:00+05:30` : iso);
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Absolute URL for og:image etc. Cover images are stored as site-relative /api/media/... paths. */
export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);
