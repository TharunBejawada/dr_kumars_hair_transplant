"use client";

import { FaRegCalendarCheck } from "react-icons/fa6";
import { type ServiceDoctorSection } from "@drkumar/shared";

interface Props {
  section?: ServiceDoctorSection;
}

export default function ServiceDoctorSectionView({ section }: Props) {
  if (!section) return null;

  function handleCtaClick(e: React.MouseEvent, link?: string) {
    if (!link || link === "#appointment" || link === "#contact" || link.startsWith("#")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-consultation-popup"));
    }
  }

  const bioParagraphs =
    section.bioParagraphs && section.bioParagraphs.length > 0
      ? section.bioParagraphs
      : [
          "Dr. Ashok Kumar is an experienced dermatologist specialising in hair loss management, hair transplantation, and scalp conditions.",
          "His expertise includes FUE and DHI hair transplantation, PRP and GFC treatments, and facial hair restoration. He focuses on accurate diagnosis, personalised treatment planning, patient safety, and natural-looking hair restoration.",
          "For individuals searching for a hair transplant specialist in Kondapur, Hyderabad, Dr. Ashok Kumar provides consultation and treatment planning based on hair loss patterns, donor hair availability, and individual restoration goals.",
        ];

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
        {/* Section Tagline / Title */}
        {section.tagline && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-brand tracking-tight">
              {section.tagline}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Doctor Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[440px] flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image || "/images/doctor-specialist.webp"}
                alt={section.imageAlt || section.name || "Dr. Ashok Kumar"}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: Doctor Credentials, Bio & Consultation Action */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Mint Header Box */}
            <div className="rounded-2xl bg-[#edf8f6] p-5 sm:p-6 border border-teal-100/70">
              <h3 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight leading-tight">
                {section.name || "Dr. Ashok Kumar"}
              </h3>

              {section.designation && (
                <p className="text-[14.5px] sm:text-[15.5px] font-bold text-brand mt-1.5">
                  {section.designation}
                </p>
              )}

              {section.experience && (
                <p className="text-[14px] sm:text-[15px] font-bold text-teal-700 mt-1">
                  {section.experience}
                </p>
              )}
            </div>

            {/* Bio Paragraphs */}
            <div className="mt-4 space-y-3 text-[13.5px] sm:text-[14.5px] text-gray-700 leading-relaxed">
              {bioParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Action CTA Button */}
            {section.ctaText && (
              <div className="mt-6 pt-1">
                <a
                  href={section.ctaLink || "#appointment"}
                  onClick={(e) => handleCtaClick(e, section.ctaLink)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-brand bg-white px-6 py-2.5 text-[13.5px] sm:text-[14.5px] font-semibold text-brand shadow-2xs transition-all hover:bg-brand hover:text-white hover:shadow-sm"
                >
                  <FaRegCalendarCheck className="size-4 shrink-0" />
                  <span>{section.ctaText}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

