import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import TreatmentHeroCta from "@/components/treatments/TreatmentHeroCta";
import TreatmentStickyForm from "@/components/treatments/TreatmentStickyForm";
import TreatmentFaqAccordion from "@/components/treatments/TreatmentFaqAccordion";
import { getTreatmentBySlug, listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive, serviceCategories } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";
import { clinic } from "@/lib/content";
import { FaChevronRight, FaNotesMedical } from "react-icons/fa6";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string; slug: string }> };

async function loadTreatment(slug: string) {
  try {
    const treatment = await getTreatmentBySlug(slug.toLowerCase());
    if (!treatment || !isTreatmentLive(treatment)) return null;
    return treatment;
  } catch (err) {
    console.error("treatment detail page load error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const treatment = await loadTreatment(slug);
  if (!treatment) return { title: "Treatment not found", robots: { index: false } };

  const title = treatment.seoTitle || treatment.title;
  const description =
    treatment.metaDescription ||
    treatment.summary ||
    `Expert ${treatment.title} clinical care by Dr. Kumar in Kondapur, Hyderabad.`;
  const keywords = treatment.metaKeywords
    ? treatment.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  const url = `${siteUrl}/${treatment.serviceCategory}/${treatment.slug}`;

  return {
    title: `${title} | ${clinic.name}`,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: treatment.image
        ? [{ url: treatment.image.startsWith("http") ? treatment.image : `${siteUrl}${treatment.image}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryTreatmentDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const treatment = await loadTreatment(slug);
  if (!treatment) redirect("/");

  // If accessed with wrong department prefix, permanently redirect to canonical URL
  if (treatment.serviceCategory.toLowerCase() !== category.toLowerCase()) {
    permanentRedirect(`/${treatment.serviceCategory}/${treatment.slug}`);
  }

  const catObj = serviceCategories.find((c) => c.id === treatment.serviceCategory);
  const departmentHref = `/${treatment.serviceCategory}`;

  // Load related treatments from the same service category
  const allInCategory = await listTreatments(treatment.serviceCategory).catch(() => []);
  const relatedTreatments = allInCategory
    .filter((t) => t.id !== treatment.id && isTreatmentLive(t))
    .slice(0, 5);

  const procedureLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatment.title,
    description: treatment.summary,
    url: `${siteUrl}/${treatment.serviceCategory}/${treatment.slug}`,
    image: treatment.image
      ? treatment.image.startsWith("http")
        ? treatment.image
        : `${siteUrl}${treatment.image}`
      : undefined,
    provider: {
      "@type": "MedicalClinic",
      name: clinic.name,
      telephone: clinic.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address,
      },
    },
  };

  const structuredFaqs =
    treatment.faqSection?.items && treatment.faqSection.items.length > 0
      ? treatment.faqSection.items
      : Array.isArray(treatment.faqs) && treatment.faqs.length > 0
      ? treatment.faqs
      : [];
  const hasStructuredFaqs = structuredFaqs.length > 0;
  const faqHeading = treatment.faqSection?.heading || "Frequently Asked Questions";

  const faqLd = hasStructuredFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: structuredFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer.replace(/<[^>]+>/g, " ").trim(),
          },
        })),
      }
    : null;

  const rawSections = treatment.contentSections ?? treatment.sections ?? [];
  // Avoid duplicate FAQ rendering if structured FAQs exist
  const sections = hasStructuredFaqs
    ? rawSections.filter((s) => !/faq|frequently\s+asked\s+questions/i.test(s.title))
    : rawSections;

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f8f5] via-[#f4fbf9] to-white border-b border-teal-100/60 pt-8 pb-10 md:py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          {/* Breadcrumbs: Clean route with no 'department' or 'treatments' prefix */}
          <nav aria-label="Breadcrumbs" className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-gray-500">
            <Link href="/" className="hover:text-brand transition">
              Home
            </Link>
            <span>/</span>
            <Link href={departmentHref} className="hover:text-brand transition">
              {catObj?.label || treatment.serviceCategory}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-xs sm:max-w-md">
              {treatment.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Summary & CTA */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold leading-[1.2] text-[#111827] tracking-tight">
                {treatment.title}
              </h1>

              {treatment.summary && (
                <p className="text-[15px] sm:text-[17px] leading-relaxed text-gray-600 max-w-2xl font-normal">
                  {treatment.summary}
                </p>
              )}

              <TreatmentHeroCta title={treatment.title} />
            </div>

            {/* Right Column: Featured Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[480px]">
                <div
                  className="absolute inset-0 -rotate-2 scale-105 rounded-[32px] bg-gradient-to-tr from-teal-200/50 to-emerald-100/40 blur-sm"
                  aria-hidden
                />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border-4 border-white bg-gray-100 shadow-xl">
                  {treatment.image ? (
                    <Image
                      src={treatment.image}
                      alt={treatment.imageAlt || treatment.title}
                      fill
                      priority
                      unoptimized
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 480px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      No treatment photo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Left 8 cols Content Sections + Right 4 cols Sticky Form */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left 8 Cols: Dynamic Content Sections */}
            <div className="lg:col-span-8 space-y-8">
              {sections.length > 0 ? (
                sections.map((section, idx) => (
                  <article
                    key={section.id || idx}
                    className="rounded-2xl border border-teal-100/70 bg-gradient-to-b from-[#f9fdfc] to-white p-6 sm:p-8 shadow-xs"
                  >
                    {section.title && (
                      <h2 className="text-[20px] sm:text-[24px] font-bold text-[#111827] tracking-tight pb-3 border-b border-teal-100/80 mb-4">
                        {section.title}
                      </h2>
                    )}
                    {section.data && (
                      <div
                        className="blog-content text-[15px] sm:text-[16px] text-gray-700 leading-relaxed space-y-3 font-normal"
                        dangerouslySetInnerHTML={{ __html: section.data }}
                      />
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-gray-500">
                  <p className="text-[15px] font-medium">
                    Detailed clinical sections for this treatment will be updated shortly by our medical team.
                  </p>
                </div>
              )}

              {/* Dedicated Structured FAQ Section */}
              {hasStructuredFaqs && (
                <div className="pt-2">
                  <TreatmentFaqAccordion
                    title={faqHeading}
                    items={structuredFaqs}
                  />
                </div>
              )}
            </div>

            {/* Right 4 Cols: Sticky Appointment Form on Top + Related Treatments */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              {/* Sticky Appointment Form */}
              <TreatmentStickyForm treatmentTitle={treatment.title} />

              {/* Related Treatments in this Category */}
              {relatedTreatments.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
                  <h3 className="text-[15px] font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
                    <span>Other {catObj?.label} Treatments</span>
                    <Link
                      href={departmentHref}
                      className="text-[12px] font-semibold text-brand hover:underline"
                    >
                      View All
                    </Link>
                  </h3>

                  <ul className="divide-y divide-gray-100 mt-2.5">
                    {relatedTreatments.map((item) => (
                      <li key={item.id} className="py-2.5 first:pt-1 last:pb-0">
                        <Link
                          href={`/${item.serviceCategory}/${item.slug}`}
                          className="group flex items-center justify-between gap-3 text-gray-700 hover:text-brand transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image ? (
                              <div className="relative size-9 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              </div>
                            ) : (
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand">
                                <FaNotesMedical className="size-3.5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-gray-900 group-hover:text-brand truncate">
                                {item.title}
                              </p>
                              {item.summary && (
                                <p className="text-[11px] text-gray-500 truncate">{item.summary}</p>
                              )}
                            </div>
                          </div>
                          <FaChevronRight className="size-3 text-gray-400 group-hover:text-brand group-hover:translate-x-0.5 transition shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
