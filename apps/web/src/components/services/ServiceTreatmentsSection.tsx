"use client";

import Link from "next/link";
import { type ServiceTreatmentsSection, type Treatment } from "@drkumar/shared";

interface Props {
  treatmentsSection?: ServiceTreatmentsSection;
  serviceCategory?: string;
  dynamicTreatments?: Treatment[];
}

export default function ServiceTreatmentsSectionView({
  treatmentsSection,
  serviceCategory,
  dynamicTreatments,
}: Props) {
  const dynamicCards = (dynamicTreatments && dynamicTreatments.length > 0)
    ? dynamicTreatments.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.summary,
        image: t.image,
        ctaText: "Know More",
        ctaLink: `/${t.serviceCategory}/${t.slug}`,
      }))
    : [];

  const dynamicTitles = new Set(dynamicCards.map((c) => c.title.toLowerCase().trim()));
  const remainingSeedItems = (treatmentsSection?.items ?? []).filter(
    (item) => !dynamicTitles.has(item.title.toLowerCase().trim())
  );

  const items = dynamicCards.length > 0 ? [...dynamicCards, ...remainingSeedItems] : (treatmentsSection?.items ?? []);

  if (items.length === 0) {
    return null;
  }

  function handleCtaClick(e: React.MouseEvent, link?: string) {
    if (!link || link === "#appointment" || link === "#contact" || link.startsWith("#")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-consultation-popup"));
    }
  }

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          {treatmentsSection?.tagline && (
            <span className="text-[14px] sm:text-[16px] font-bold text-brand tracking-wide">
              {treatmentsSection.tagline}
            </span>
          )}

          <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mt-1.5 leading-tight">
            {treatmentsSection?.heading || "Explore Our Range of Services"}
          </h2>

          {treatmentsSection?.description && (
            <div
              className="blog-content text-[13.5px] sm:text-[15px] text-gray-600 mt-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: treatmentsSection.description }}
            />
          )}
        </div>

        {/* Treatment Cards Grid: 4 columns x 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-10 md:mt-12">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-teal-200/60 bg-white shadow-xs transition-all duration-300 hover:shadow-lg hover:border-brand/40 hover:-translate-y-1"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[12px] text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between">
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-brand leading-snug group-hover:text-brand-2 transition-colors">
                    {item.ctaLink && item.ctaLink.startsWith("/") ? (
                      <Link href={item.ctaLink}>{item.title}</Link>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {item.description && (
                    <p className="text-[12.5px] sm:text-[13px] text-gray-600 mt-2 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2">
                  {item.ctaLink && item.ctaLink.startsWith("/") ? (
                    <Link
                      href={item.ctaLink}
                      className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-brand-2 hover:shadow-sm"
                    >
                      {item.ctaText || "Know More"}
                    </Link>
                  ) : (
                    <a
                      href={item.ctaLink || "#appointment"}
                      onClick={(e) => handleCtaClick(e, item.ctaLink)}
                      className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-brand-2 hover:shadow-sm"
                    >
                      {item.ctaText || "Know More"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section Action: View More */}
        {treatmentsSection?.viewMoreText && (
          <div className="mt-10 md:mt-12 text-center">
            <a
              href={treatmentsSection.viewMoreLink || "#appointment"}
              onClick={(e) => handleCtaClick(e, treatmentsSection.viewMoreLink)}
              className="inline-flex items-center justify-center rounded-lg bg-brand px-8 py-3 text-[14.5px] sm:text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-2 hover:shadow-md hover:-translate-y-0.5"
            >
              {treatmentsSection.viewMoreText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

