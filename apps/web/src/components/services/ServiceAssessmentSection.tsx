"use client";

import Image from "next/image";
import { type ServiceAssessmentSection } from "@drkumar/shared";

interface Props {
  section?: ServiceAssessmentSection;
}

export default function ServiceAssessmentSectionView({ section }: Props) {
  if (!section) return null;

  function handleCtaClick(e: React.MouseEvent, link?: string) {
    if (!link || link === "#appointment" || link === "#contact" || link.startsWith("#")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-consultation-popup"));
    }
  }

  // Highlight key terms in the note if present
  function renderFormattedNote(text: string) {
    if (!text) return null;

    // Split text with highlights for clinic name and keywords
    const parts = text.split(/(Dr\. Kumar[’']s Skin & Hair Transplant Center|best doctor for hair loss treatment in Kondapur, Hyderabad|Dr\. Ashok Kumar)/g);

    return parts.map((part, i) => {
      if (
        part === "Dr. Kumar’s Skin & Hair Transplant Center" ||
        part === "Dr. Kumar's Skin & Hair Transplant Center" ||
        part === "best doctor for hair loss treatment in Kondapur, Hyderabad" ||
        part === "Dr. Ashok Kumar"
      ) {
        return (
          <strong key={i} className="font-bold text-gray-900">
            {part}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <section className="bg-[#f0faf9] py-12 md:py-16 lg:py-20 border-b border-teal-100/50">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Scalp / Clinical Examination Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-[4/3.8] sm:aspect-[4/3.6] lg:aspect-[4/4] rounded-2xl md:rounded-3xl overflow-hidden border border-white/70 shadow-md bg-white">
              {section.image ? (
                <Image
                  src={section.image}
                  alt={section.imageAlt || section.heading || "Scalp evaluation"}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                  No image provided
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Content & Factors Checklist */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {section.tagline && (
              <span className="text-[14px] sm:text-[16px] font-bold text-brand tracking-wide">
                {section.tagline}
              </span>
            )}

            <h2 className="text-[22px] sm:text-[28px] md:text-[32px] font-bold text-[#111827] mt-1 leading-snug tracking-tight">
              {section.heading || "The Right Solution Begins With Understanding Your Hair Loss"}
            </h2>

            {section.description && (
              <p className="text-[13.5px] sm:text-[14.5px] text-gray-600 mt-2.5 leading-relaxed">
                {section.description}
              </p>
            )}

            {section.factorsLead && (
              <p className="text-[13px] sm:text-[14px] font-semibold text-gray-700 mt-3.5">
                {section.factorsLead}
              </p>
            )}

            {/* Factors List Pills */}
            {section.factors && section.factors.length > 0 && (
              <div className="space-y-2 mt-3">
                {section.factors.map((factor, idx) => (
                  <div
                    key={factor.id || idx}
                    className="flex items-center gap-3 rounded-full bg-white/95 border border-teal-100/90 px-4 py-2 shadow-2xs transition-all hover:border-brand/40 hover:bg-white"
                  >
                    <span className="h-3.5 w-1 rounded-full bg-brand shrink-0" />
                    <span className="text-[13px] sm:text-[13.5px] font-medium text-teal-900/90 leading-tight">
                      {factor.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Closing Clinical Recommendation / Doctor Note */}
            {section.note && (
              <p className="text-[12.5px] sm:text-[13px] text-gray-600 mt-4 leading-relaxed pt-2">
                {renderFormattedNote(section.note)}
              </p>
            )}

            {/* Optional CTA Button */}
            {section.ctaText && (
              <div className="mt-5">
                <a
                  href={section.ctaLink || "#appointment"}
                  onClick={(e) => handleCtaClick(e, section.ctaLink)}
                  className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-2.5 text-[13px] sm:text-[14px] font-semibold text-white shadow-xs transition hover:bg-brand-2 hover:shadow-sm"
                >
                  {section.ctaText}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

