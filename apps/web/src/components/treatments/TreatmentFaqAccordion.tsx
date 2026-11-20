"use client";

import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";

interface FaqItem {
  question: string;
  answerHtml: string;
}

function parseFaqsFromHtml(rawHtml: string): FaqItem[] {
  if (!rawHtml) return [];

  // Match pattern: <p><strong>(Question)</strong></p>(Answer...)
  // or <h3><strong>(Question)</strong></h3>
  const regex = /<(?:p|h[2-4])><strong>\s*(?:(\d+)\.\s*)?([^<]+)<\/strong><\/(?:p|h[2-4])>/gi;
  const items: FaqItem[] = [];

  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let currentQuestion = "";
  let currentNum: string | undefined;

  while ((match = regex.exec(rawHtml)) !== null) {
    if (currentQuestion) {
      const answer = rawHtml.substring(lastIndex, match.index).trim();
      items.push({
        question: currentNum ? `${currentNum}. ${currentQuestion}` : currentQuestion,
        answerHtml: answer,
      });
    }
    currentNum = match[1];
    currentQuestion = match[2].trim();
    lastIndex = regex.lastIndex;
  }

  if (currentQuestion) {
    const answer = rawHtml.substring(lastIndex).trim();
    items.push({
      question: currentNum ? `${currentNum}. ${currentQuestion}` : currentQuestion,
      answerHtml: answer,
    });
  }

  return items;
}

interface Props {
  title?: string;
  items?: { question: string; answer: string; id?: string }[];
  data?: string;
}

export default function TreatmentFaqAccordion({ title = "Frequently Asked Questions", items, data }: Props) {
  // CRITICAL REQUIREMENT: All FAQs start closed initially. User clicks to expand.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = useMemo<FaqItem[]>(() => {
    if (items && items.length > 0) {
      return items.map((it) => {
        const answerRaw = it.answer.trim();
        const answerHtml =
          answerRaw.startsWith("<p") || answerRaw.startsWith("<div")
            ? answerRaw
            : answerRaw
                .split(/\n\s*\n/)
                .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
                .join("");
        return {
          question: it.question.trim(),
          answerHtml,
        };
      });
    }
    if (data) {
      return parseFaqsFromHtml(data);
    }
    return [];
  }, [items, data]);

  function toggle(idx: number) {
    setOpenIndex((curr) => (curr === idx ? null : idx));
  }

  // Fallback: If no structured questions detected, render standard rich text if data exists
  if (faqItems.length === 0) {
    if (!data) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <div
          className="blog-content prose prose-teal max-w-none text-gray-700 leading-relaxed text-[15px]"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight">
        {title}
      </h2>

      <div className="space-y-2.5">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="overflow-hidden transition-all duration-200 border border-teal-100/80 rounded-xl shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className={`w-full flex items-center justify-between gap-4 p-4 text-left transition-colors cursor-pointer select-none ${
                  isOpen
                    ? "bg-[#00695c] text-white"
                    : "bg-[#e8f7f5] text-gray-900 hover:bg-[#d8f2ee]"
                }`}
                aria-expanded={isOpen}
              >
                <span className="text-[14.5px] sm:text-[15.5px] font-bold leading-snug">
                  {item.question}
                </span>
                <FaChevronRight
                  className={`size-3.5 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90 text-white" : "text-teal-700"
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  className="bg-white p-4.5 sm:p-5 text-gray-700 text-[14.5px] leading-relaxed border-t border-teal-100/60"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
