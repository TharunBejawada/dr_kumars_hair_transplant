import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import ShareLinks from "@/components/ShareLinks";
import { getLiveBlogByUrl, listLiveBlogsCached } from "@/lib/db/blogs";
import { absoluteUrl, displayDate, excerpt, plainText, siteUrl } from "@/lib/blog-utils";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getLiveBlogByUrl(slug);
  } catch (e) {
    console.error("blog page: failed to load", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await load((await params).slug);
  if (!blog) return { title: "Blog not found", robots: { index: false } };
  const title = blog.seoTitle || blog.blogTitle;
  const description = blog.metaDescription || excerpt(blog, 160);
  const url = `${siteUrl}/blogs/${blog.url}`;
  return {
    title: `${title} | Dr. Kumar's Hair Transplant`,
    description,
    keywords: blog.metaKeywords || undefined,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, publishedTime: blog.publishAt ?? undefined, authors: blog.author ? [blog.author] : undefined, images: blog.blogImage ? [{ url: absoluteUrl(blog.blogImage) }] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPage({ params }: Props) {
  const blog = await load((await params).slug);
  if (!blog) notFound();

  const url = `${siteUrl}/blogs/${blog.url}`;
  const related = await listLiveBlogsCached()
    .then((all) => all.filter((b) => b.id !== blog.id && b.categories.some((c) => blog.categories.includes(c))).slice(0, 3))
    .catch(() => []);
  const faqs = blog.faqs.filter((f) => f.question && f.answer);

  const articleLd = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: blog.blogTitle, description: blog.metaDescription || excerpt(blog, 160),
    image: blog.blogImage ? [absoluteUrl(blog.blogImage)] : undefined, datePublished: blog.publishAt ?? undefined, dateModified: blog.modifiedAt,
    author: blog.author ? { "@type": "Person", name: blog.author } : { "@type": "Organization", name: "Dr. Kumar's Hair Transplant" },
    publisher: { "@type": "Organization", name: "Dr. Kumar's Hair Transplant" }, mainEntityOfPage: url,
  };
  const faqLd = faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: plainText(f.answer) } })) }
    : null;
  // Escape "<" so content can never close the script tag.
  const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(articleLd)} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />}

      <article className="mx-auto max-w-[900px] px-5 pb-12 pt-10 md:px-8 md:pt-[60px]">
        <nav aria-label="Breadcrumb" className="text-[14px] text-gray-500">
          <Link href="/" className="hover:text-brand">Home</Link> / <Link href="/blogs" className="hover:text-brand">Blog</Link>
        </nav>
        {blog.categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">{blog.categories.map((c) => <span key={c} className="rounded-full bg-brand/10 px-3 py-0.5 text-[12px] font-semibold text-brand">{c}</span>)}</div>
        )}
        <h1 className="mt-3 text-[28px] font-bold leading-[1.3] tracking-[0.3px] md:text-[38px]">{blog.blogTitle}</h1>
        <p className="mt-3 text-[14px] text-gray-500">{[displayDate(blog), blog.author && `By ${blog.author}`].filter(Boolean).join(" · ")}</p>

        {blog.blogImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blog.blogImage} alt={blog.blogTitle} className="mt-7 aspect-[16/9] w-full rounded-[14px] object-cover" />
        )}

        <div className="mt-8 space-y-8">
          {blog.extraFields.map((s, i) => (
            <section key={i}>
              {s.heading && <h2 className="text-[22px] font-semibold text-brand md:text-[26px]">{s.heading}</h2>}
              {/* HTML is sanitised with an allow-list when saved (see lib/sanitize.ts) */}
              <div className="blog-content text-[16px] md:text-[17px]" dangerouslySetInnerHTML={{ __html: s.description }} />
            </section>
          ))}
        </div>

        {faqs.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-[22px] font-semibold text-brand md:text-[26px]">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-[8px] border border-brand bg-white px-5 py-4 open:bg-mint">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-brand">{f.question}<span className="text-[22px] transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                  <div className="blog-content mt-3 text-[16px]" dangerouslySetInnerHTML={{ __html: f.answer }} />
                </details>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 rounded-[8px] bg-mint p-4 text-[13px] leading-[22px] text-gray-600">
          The information in this article is for general health awareness and education only and is not a substitute for professional medical advice, diagnosis or treatment. It may not apply to your individual condition. Please consult a qualified doctor before making any treatment decisions.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t pt-6">
          <ShareLinks url={url} title={blog.blogTitle} />
          <Link href="/#contact" className="inline-flex h-[40px] items-center rounded-[5px] bg-brand-2 px-[28px] text-[18px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg">Book an Appointment</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-mint py-12">
          <div className="mx-auto max-w-[1100px] px-5 md:px-8">
            <h2 className="text-[22px] font-semibold text-brand md:text-[26px]">Related articles</h2>
            <ul className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className="rounded-[12px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(11,147,136,0.25)]">
                  <Link href={`/blogs/${r.url}`} className="block"><h3 className="text-[17px] font-semibold leading-[25px] hover:text-brand">{r.blogTitle}</h3><p className="mt-2 text-[13px] text-gray-500">{displayDate(r)}</p></Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
