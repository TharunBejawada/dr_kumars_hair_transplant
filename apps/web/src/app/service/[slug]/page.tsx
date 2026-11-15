import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import TreatmentHeroCta from "@/components/treatments/TreatmentHeroCta";
import TreatmentStickyForm from "@/components/treatments/TreatmentStickyForm";
import TreatmentFaqAccordion from "@/components/treatments/TreatmentFaqAccordion";
import { getTreatmentBySlug, listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive, serviceCategories, type ServiceCategoryId } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";
import { clinic } from "@/lib/content";
import { FaChevronRight, FaNotesMedical } from "react-icons/fa6";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const categoryDepartmentMap: Record<ServiceCategoryId, string> = {
  hair: "/department/hair",
  "skin-cosmetic": "/department/skin-cosmetic",
  dermatology: "/department/dermatology",
  std: "/department/std",
};

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
  const { slug } = await params;
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
  const url = `${siteUrl}/service/${treatment.slug}`;

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

export default async function TreatmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const treatment = await loadTreatment(slug);
  if (!treatment) notFound();

  const catObj = serviceCategories.find((c) => c.id === treatment.serviceCategory);
  const departmentHref = categoryDepartmentMap[treatment.serviceCategory] || "/department";

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
    url: `${siteUrl}/service/${treatment.slug}`,
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

  const sections = treatment.contentSections ?? treatment.sections ?? [];

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureLd) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f8f5] via-[#f4fbf9] to-white border-b border-teal-100/60 pt-8 pb-10 md:py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-gray-500">
            <Link href="/" className="hover:text-brand transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/department" className="hover:text-brand transition">
              Department
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
                <div className="relative overflow-hidden rounded-[28px] border-4 border-white shadow-xl bg-white aspect-[4/3] sm:aspect-[16/11]">
                  {treatment.image ? (
                    <Image
                      src={treatment.image}
                      alt={treatment.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-teal-50/50 p-6 text-center text-teal-800">
                      <FaNotesMedical className="size-12 text-teal-400 mb-2" />
                      <span className="font-bold text-[16px]">{treatment.title}</span>
                      <span className="text-[12px] text-teal-600 mt-1">{catObj?.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left 8 Cols: Continuous, Natural Flow Content (No Card Boxes, No Numbers) */}
            <div className="lg:col-span-8 space-y-10">
              {sections.length > 0 ? (
                sections.map((section, idx) => {
                  const isFaq = /faq|frequently\s+asked\s+questions/i.test(section.title);

                  if (isFaq) {
                    return (
                      <div key={section.id || idx} className="pt-2">
                        <TreatmentFaqAccordion
                          title={section.title}
                          data={section.data}
                        />
                      </div>
                    );
                  }

                  return (
                    <section key={section.id || idx} className="space-y-3.5">
                      <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight">
                        {section.title}
                      </h2>

                      <div
                        className="blog-content prose prose-teal max-w-none text-gray-700 leading-relaxed text-[15px]"
                        dangerouslySetInnerHTML={{ __html: section.data }}
                      />
                    </section>
                  );
                })
              ) : (
                <div className="space-y-4">
                  <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight">
                    Treatment Overview
                  </h2>
                  <p className="text-[15.5px] leading-relaxed text-gray-700">
                    {treatment.summary ||
                      `${treatment.title} is an advanced clinical procedure tailored to your specific requirements at Dr. Kumar's Hair Transplant in Kondapur, Hyderabad.`}
                  </p>
                  <p className="text-[14px] text-gray-500 italic">
                    Detailed clinical sections for this treatment will be updated shortly by our medical team.
                  </p>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Sticky Appointment Form on Top + Related Treatments */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              {/* Sticky Appointment Form Matching Uploaded Design */}
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
                          href={`/service/${item.slug}`}
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
