"use client";

import { useState } from "react";
import { type ServiceFaqSection } from "@drkumar/shared";

interface Props {
  section?: ServiceFaqSection;
}

export default function ServiceFaqSectionView({ section }: Props) {
  // CRITICAL REQUIREMENT: "Initially all questions should be close"
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  if (!section || !section.items || section.items.length === 0) {
    return null;
  }

  function toggleFaq(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section className="bg-[#f0faf9] py-12 md:py-16 lg:py-20 border-b border-teal-100/60">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
        {/* Section Heading: "Frequently Asked Questions" */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-[26px] sm:text-[32px] md:text-[38px] font-bold text-brand tracking-tight">
            Frequently <span className="text-[#111827]">Asked</span> Questions
          </h2>
        </div>

        {/* 2-Column Responsive FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
          {section.items.map((item, idx) => {
            const itemId = item.id || `faq-${idx}`;
            const isOpen = openIds.has(itemId);

            return (
              <div
                key={itemId}
                onClick={() => toggleFaq(itemId)}
                className={`transition-all duration-200 rounded-2xl cursor-pointer p-4 sm:p-5 ${
                  isOpen
                    ? "bg-brand text-white border border-brand shadow-md"
                    : "bg-white text-gray-900 border border-teal-500/80 hover:border-brand shadow-2xs hover:shadow-xs"
                }`}
              >
                {/* Header row: Question + Toggle indicator (+ / -) */}
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-[14px] sm:text-[15px] font-bold leading-snug select-none ${
                      isOpen ? "text-white" : "text-[#0f766e]"
                    }`}
                  >
                    {item.question}
                  </h3>

                  <span
                    className={`text-[22px] font-bold leading-none shrink-0 select-none ${
                      isOpen ? "text-white" : "text-brand"
                    }`}
                    aria-label={isOpen ? "Collapse question" : "Expand question"}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </div>

                {/* Answer body: Rendered smoothly when expanded */}
                {isOpen && (
                  <div className="mt-3 pt-2.5 border-t border-teal-600/70 text-[12.5px] sm:text-[13.5px] text-teal-50/95 leading-relaxed font-normal">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

