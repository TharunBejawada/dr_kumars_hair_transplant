import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import ServiceHeroSection from "@/components/services/ServiceHeroSection";
import ServiceConcernsSectionView from "@/components/services/ServiceConcernsSection";
import ServiceTreatmentsSectionView from "@/components/services/ServiceTreatmentsSection";
import ServiceAssessmentSectionView from "@/components/services/ServiceAssessmentSection";
import ServiceDoctorSectionView from "@/components/services/ServiceDoctorSection";
import ServiceFaqSectionView from "@/components/services/ServiceFaqSection";
import Appointment from "@/components/Appointment";
import { getServicePageBySlug } from "@/lib/db/services";
import { isServicePageLive, serviceCategories } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";
import { clinic } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

const RESERVED_ROUTES = new Set([
  "about",
  "admin",
  "api",
  "blogs",
  "department",
  "service",
  "services",
  "llms.txt",
]);

async function loadPage(slug: string) {
  if (RESERVED_ROUTES.has(slug.toLowerCase())) return null;
  try {
    const page = await getServicePageBySlug(slug.toLowerCase());
    if (!page || !isServicePageLive(page)) return null;
    return page;
  } catch (err) {
    console.error("category detail page load error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = await loadPage(category);
  if (!page) return { title: "Page not found", robots: { index: false } };

  const title = page.seoTitle || page.title;
  const description =
    page.metaDescription ||
    page.subtitle ||
    `Expert ${page.title} treatments at ${clinic.name} in Kondapur, Hyderabad.`;
  const keywords = page.metaKeywords
    ? page.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  const url = `${siteUrl}/${page.slug}`;

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
      images: page.image ? [{ url: page.image.startsWith("http") ? page.image : `${siteUrl}${page.image}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryDepartmentPage({ params }: Props) {
  const { category } = await params;
  const page = await loadPage(category);
  if (!page) notFound();

  const catObj = serviceCategories.find((c) => c.id === page.serviceCategory);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: page.title,
    description: page.subtitle || page.metaDescription,
    url: `${siteUrl}/${page.slug}`,
    image: page.image ? (page.image.startsWith("http") ? page.image : `${siteUrl}${page.image}`) : undefined,
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

  const faqLd =
    page.faqSection?.items && page.faqSection.items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqSection.items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(serviceLd)} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />}

      {/* Section 1: Hero Banner (Title, Subtitle, Image & CTA) */}
      <ServiceHeroSection page={page} />

      {/* Section 2: Concerns & Treatment Approaches */}
      {page.concernsSection && (
        <ServiceConcernsSectionView
          section={page.concernsSection}
          categoryLabel={catObj?.label || "Hair"}
        />
      )}

      {/* Section 3: Treatments / Services Range Grid */}
      {page.treatmentsSection && (
        <ServiceTreatmentsSectionView
          treatmentsSection={page.treatmentsSection}
          serviceCategory={page.serviceCategory}
        />
      )}

      {/* Section 4: Treatment Selection & Clinical Factors */}
      {page.assessmentSection && (
        <ServiceAssessmentSectionView section={page.assessmentSection} />
      )}

      {/* Section 5: Specialist / Doctor Profile */}
      {page.doctorSection && (
        <ServiceDoctorSectionView section={page.doctorSection} />
      )}

      {/* Section 6: Frequently Asked Questions (FAQ) */}
      {page.faqSection && (
        <ServiceFaqSectionView section={page.faqSection} />
      )}

      {/* Slot for subsequent sections */}
      <div id="service-content-sections" className="w-full" />

      {/* Integrated Appointment Booking Section */}
      <div id="appointment" className="bg-[#f8fcfb] py-8 border-t border-teal-50">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <Appointment gapAbove={20} gapBelow={20} />
        </div>
      </div>
    </PublicShell>
  );
}
