import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import Appointment from "@/components/Appointment";
import TreatmentHeroCta from "@/components/treatments/TreatmentHeroCta";
import { getTreatmentBySlug, listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive, serviceCategories, type ServiceCategoryId } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";
import { clinic } from "@/lib/content";
import { FaCircleCheck, FaChevronRight, FaHospital, FaNotesMedical, FaUserDoctor } from "react-icons/fa6";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const categoryDepartmentMap: Record<ServiceCategoryId, string> = {
  hair: "/department/hair",
  "skin-cosmetic": "/department/skin-cosmetic",
  dermatology: "/department/dermatology",
  std: "/department/std",
};

const categoryBadgeClasses: Record<ServiceCategoryId, string> = {
  hair: "bg-teal-50 text-teal-800 ring-1 ring-teal-600/25 border-teal-200",
  "skin-cosmetic": "bg-pink-50 text-pink-800 ring-1 ring-pink-600/25 border-pink-200",
  dermatology: "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-600/25 border-cyan-200",
  std: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/25 border-amber-200",
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
  const badgeClass =
    categoryBadgeClasses[treatment.serviceCategory] || "bg-teal-50 text-teal-800 border-teal-200";

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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f8f5] via-[#f4fbf9] to-white border-b border-teal-100/60 pt-8 pb-12 md:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-gray-500">
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
            {/* Left Column: Identification & CTA */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-bold border ${badgeClass}`}
                >
                  {catObj?.label || treatment.serviceCategory}
                </span>
                <span className="text-[12px] font-medium text-gray-500">
                  Clinical Treatment
                </span>
              </div>

              <h1 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold leading-[1.2] text-[#111827] tracking-tight">
                {treatment.title}
              </h1>

              {treatment.summary && (
                <p className="text-[15px] sm:text-[17px] leading-relaxed text-gray-600 max-w-2xl font-normal">
                  {treatment.summary}
                </p>
              )}

              <TreatmentHeroCta title={treatment.title} />

              {/* Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-[12.5px] text-gray-600 border-t border-teal-100/60">
                <div className="flex items-center gap-1.5">
                  <FaUserDoctor className="size-3.5 text-brand" />
                  <span>Led by Dr. Kumar (MD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaHospital className="size-3.5 text-brand" />
                  <span>Modern Kondapur Clinic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCircleCheck className="size-3.5 text-emerald-600" />
                  <span>US FDA Approved Protocols</span>
                </div>
              </div>
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
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 8 Cols: Dynamic Content Sections */}
            <div className="lg:col-span-8 space-y-10">
              {sections.length > 0 ? (
                sections.map((section, idx) => (
                  <article
                    key={section.id || idx}
                    className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-[13px] font-bold text-brand">
                        {idx + 1}
                      </span>
                      <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 tracking-tight">
                        {section.title}
                      </h2>
                    </div>

                    <div
                      className="blog-content prose prose-teal max-w-none text-gray-700 leading-relaxed text-[15px]"
                      dangerouslySetInnerHTML={{ __html: section.data }}
                    />
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 border-b border-gray-100 pb-3">
                    Treatment Overview
                  </h2>
                  <p className="text-[15px] leading-relaxed text-gray-700">
                    {treatment.summary ||
                      `${treatment.title} is an advanced clinical procedure tailored to your specific requirements at Dr. Kumar's Hair Transplant in Kondapur, Hyderabad.`}
                  </p>
                  <p className="text-[14px] text-gray-500 italic">
                    Detailed clinical sections for this treatment will be updated shortly by our medical team.
                  </p>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Sidebar (Related Treatments & Booking Assistance) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Related Treatments in this Category */}
              {relatedTreatments.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                  <h3 className="text-[16px] font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
                    <span>Other {catObj?.label} Treatments</span>
                    <Link
                      href={departmentHref}
                      className="text-[12px] font-semibold text-brand hover:underline"
                    >
                      View All
                    </Link>
                  </h3>

                  <ul className="divide-y divide-gray-100 mt-3">
                    {relatedTreatments.map((item) => (
                      <li key={item.id} className="py-3 first:pt-1 last:pb-1">
                        <Link
                          href={`/service/${item.slug}`}
                          className="group flex items-center justify-between gap-3 text-gray-700 hover:text-brand transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image ? (
                              <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                            ) : (
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand">
                                <FaNotesMedical className="size-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-gray-900 group-hover:text-brand truncate">
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

              {/* Clinic Assistance Card */}
              <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 p-6 shadow-xs space-y-4">
                <h3 className="text-[17px] font-bold text-gray-900">Need Clinical Guidance?</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Every patient’s condition is unique. Dr. Kumar conducts a one-on-one diagnostic
                  evaluation before suggesting any procedure.
                </p>
                <div className="space-y-2.5 pt-2">
                  <a
                    href={clinic.phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-brand-2 transition"
                  >
                    <span>Call {clinic.phone}</span>
                  </a>
                  <Link
                    href={departmentHref}
                    className="flex w-full items-center justify-center rounded-xl border border-teal-200 bg-white py-2 text-[13px] font-semibold text-teal-800 hover:bg-teal-50 transition"
                  >
                    Back to {catObj?.label || "Department"}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section id="appointment" className="bg-[#f7fbfb] border-t border-teal-100/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-[26px] sm:text-[32px] font-bold text-gray-900">
              Schedule Your Consultation
            </h2>
            <p className="mt-2 text-[15px] text-gray-600">
              Fill in your details below to book an in-person assessment for {treatment.title}.
            </p>
          </div>
          <Appointment gapAbove={0} gapBelow={0} />
        </div>
      </section>
    </PublicShell>
  );
}
