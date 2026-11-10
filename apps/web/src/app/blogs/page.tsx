import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import BlogsExplorer, { type BlogCard } from "@/components/BlogsExplorer";
import { listLiveBlogsCached } from "@/lib/db/blogs";
import { displayDate, excerpt, siteUrl } from "@/lib/blog-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Dr. Kumar's Hair Transplant",
  description: "Articles on hair transplantation, hair loss, skin care and dermatology from Dr. Ashok Kumar's clinic in Kondapur, Hyderabad.",
  alternates: { canonical: `${siteUrl}/blogs` },
};

export default async function BlogsPage() {
  let cards: BlogCard[] = [];
  try {
    cards = (await listLiveBlogsCached()).map((b) => ({
      url: b.url, title: b.blogTitle, image: b.blogImage, categories: b.categories, author: b.author, date: displayDate(b), excerpt: excerpt(b),
    }));
  } catch (e) {
    console.error("blogs page: failed to load", e); // degrade to the empty state instead of a 500
  }
  return (
    <PublicShell>
      <section className="mt-[19px] bg-brand">
        <div className="mx-auto max-w-[1440px] px-5 py-12 text-white md:px-8 md:py-[60px] xl:px-[110px]">
          <p className="text-[15px] font-medium uppercase tracking-[2.3px] md:text-[18px]">Dr. Kumar&apos;s Blog</p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.25] tracking-[0.5px] md:text-[44px]">Hair &amp; Skin Health Articles</h1>
          <p className="mt-3 max-w-[700px] text-[16px] leading-[28px] md:text-[18px]">Advice, guides and answers from our dermatology and hair restoration team.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 md:py-[60px] xl:px-[110px]">
        <BlogsExplorer blogs={cards} />
      </section>
    </PublicShell>
  );
}
