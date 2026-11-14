"use client";

import Image from "next/image";
import { type ServiceConcernsSection } from "@drkumar/shared";

export default function ServiceConcernsSectionView({
  section,
  categoryLabel = "Hair",
}: {
  section?: ServiceConcernsSection;
  categoryLabel?: string;
}) {
  if (!section) return null;

  const { tagline, heading, description, items, sideCard } = section;

  function handleConsultClick(e: React.MouseEvent) {
    if (!sideCard?.ctaLink || sideCard.ctaLink === "#appointment" || sideCard.ctaLink === "#contact") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-consultation-popup"));
    }
  }

  return (
    <section className="bg-white py-12 md:py-16 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-stretch">
          {/* Left Column: Heading, Description & 8 Concern Items (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {tagline && (
                <h2 className="text-[20px] sm:text-[24px] font-bold text-brand tracking-tight">
                  {tagline}
                </h2>
              )}

              {heading && (
                <h3 className="mt-2 text-[22px] sm:text-[26px] md:text-[28px] font-bold text-[#111827] leading-[1.3]">
                  {heading}
                </h3>
              )}

              {description && (
                <p className="mt-3.5 text-[15px] sm:text-[16px] text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Grid of Concerns / Problems (Circle items) */}
            {items && items.length > 0 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-7">
                {items.map((item) => (
                  <div key={item.id || item.title} className="group flex flex-col items-center text-center">
                    <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-2 border-teal-100 bg-[#eef8f7] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-brand group-hover:shadow-md">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-brand font-semibold px-2">
                          {item.title}
                        </div>
                      )}
                    </div>
                    <span className="mt-2.5 text-[13px] sm:text-[14px] font-semibold text-gray-900 leading-snug line-clamp-2 max-w-[130px]">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Side Consultation Card Box (5 cols) */}
          <div className="lg:col-span-5">
            <div className="h-full rounded-[24px] bg-[#ecfaf7] border border-[#cbece6] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                {/* Top Card Image */}
                {sideCard?.image && (
                  <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-white shadow-inner mb-5">
                    <Image
                      src={sideCard.image}
                      alt="Consultation Specialist"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 420px"
                    />
                  </div>
                )}

                {/* Paragraphs */}
                <div className="space-y-3 text-[14px] sm:text-[14.5px] text-gray-700 leading-relaxed">
                  {sideCard?.text1 && <p>{sideCard.text1}</p>}
                  {sideCard?.text2 && (
                    <p>
                      {sideCard.text2.includes("Dr. Kumar") ? (
                        <>
                          <span className="font-semibold text-brand">
                            At Dr. Kumar’s Skin &amp; Hair Transplant Center
                          </span>
                          , patients looking for a{" "}
                          <span className="font-semibold text-brand">
                            {categoryLabel.toLowerCase()} specialist in Kondapur, Hyderabad
                          </span>{" "}
                          can receive individualised assessment and guidance for different hair loss concerns.
                        </>
                      ) : (
                        sideCard.text2
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <a
                  href={sideCard?.ctaLink || "#appointment"}
                  onClick={handleConsultClick}
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14.5px] sm:text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-2 hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  {sideCard?.ctaText || "Consult Our Specialist"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

