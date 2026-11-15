"use client";

import { FaCalendarDays, FaPhone } from "react-icons/fa6";
import { clinic } from "@/lib/content";

export default function TreatmentHeroCta({ title }: { title: string }) {
  function openConsultation(e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("open-consultation-popup", {
        detail: { treatment: title },
      }),
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <button
        type="button"
        onClick={openConsultation}
        className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-6 sm:px-7 py-3 text-[14px] sm:text-[15px] font-semibold text-white shadow-md shadow-brand/20 transition-all duration-300 hover:bg-brand-2 hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="flex items-center justify-center rounded-full bg-white/20 p-1 group-hover:scale-110 transition-transform">
          <FaCalendarDays className="size-3.5 sm:size-4 text-white" />
        </span>
        <span>Book Consultation</span>
      </button>

      <a
        href={clinic.phoneHref}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 sm:px-6 py-3 text-[14px] sm:text-[15px] font-semibold text-gray-700 shadow-2xs transition hover:border-brand hover:text-brand hover:bg-teal-50/50"
      >
        <FaPhone className="size-3.5 text-brand" />
        <span>{clinic.phone}</span>
      </a>
    </div>
  );
}

