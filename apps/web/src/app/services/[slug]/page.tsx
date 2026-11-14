import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import ServiceHeroSection from "@/components/services/ServiceHeroSection";
import Appointment from "@/components/Appointment";
import { getServicePageBySlug } from "@/lib/db/services";
import { isServicePageLive } from "@drkumar/shared";
import { siteUrl } from "@/lib/blog-utils";
import { clinic } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function loadPage(slug: string) {
  try {
    const page = await getServicePageBySlug(slug.toLowerCase());
    if (!page || !isServicePageLive(page)) return null;
    return page;
  } catch (err) {
    console.error("service detail page load error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage((await params).slug);
  if (!page) return { title: "Service not found", robots: { index: false } };

  const title = page.seoTitle || page.title;
  const description =
    page.metaDescription ||
    page.subtitle ||
    `Expert ${page.title} treatments at ${clinic.name} in Kondapur, Hyderabad.`;
  const url = `${siteUrl}/services/${page.slug}`;

  return {
    title: `${title} | ${clinic.name}`,
    description,
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

export default async function ServiceDetailPage({ params }: Props) {
  const page = await loadPage((await params).slug);
  if (!page) notFound();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: page.title,
    description: page.subtitle || page.metaDescription,
    url: `${siteUrl}/services/${page.slug}`,
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

  const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(serviceLd)} />

      {/* Section 1: Hero Banner (Title, Subtitle, Image & CTA) */}
      <ServiceHeroSection page={page} />

      {/* Dynamic Placeholder for Subsequent Sections (Sections 2, 3...) */}
      <div id="service-content-sections" className="w-full">
        {/* Further sections provided by the user will be rendered here */}
      </div>

      {/* Integrated Appointment Booking Section */}
      <div id="appointment" className="bg-[#f8fcfb] py-8 border-t border-teal-50">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <Appointment gapAbove={20} gapBelow={20} />
        </div>
      </div>
    </PublicShell>
  );
}

