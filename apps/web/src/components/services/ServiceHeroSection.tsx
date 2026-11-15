"use client";

import Image from "next/image";
import Link from "next/link";
import { FaCalendarDays } from "react-icons/fa6";
import { type ServicePage, serviceCategories } from "@drkumar/shared";

export default function ServiceHeroSection({ page }: { page: ServicePage }) {
  const catObj = serviceCategories.find((c) => c.id === page.serviceCategory);

  function handleCtaClick(e: React.MouseEvent) {
    if (!page.ctaLink || page.ctaLink === "#appointment" || page.ctaLink === "#contact") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-consultation-popup"));
    }
  }

  return (
    <section className="relative overflow-hidden min-h-[340px] md:min-h-[380px] lg:min-h-[420px] flex items-center bg-[#d8f5f1] border-b border-teal-100/60">
      {/* Hero Background Image (Crisp, High-Clarity) */}
      {page.image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={page.image}
            alt={page.imageAlt || page.title}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right md:object-[right_center]"
          />
        </div>
      )}

      {/* Mobile-only soft contrast overlay (hidden on sm/md/lg so the photo has 100% pristine clarity) */}
      <div
        className="sm:hidden absolute inset-0 z-10 bg-gradient-to-r from-[#d8f5f1]/95 via-[#d8f5f1]/80 to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Content Container (z-20) */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:px-[110px] py-10 md:py-14">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumbs" className="mb-4 sm:mb-6 flex items-center gap-2 text-[13px] text-gray-600">
          <Link href="/" className="hover:text-brand transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-brand transition">
            Services
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{catObj?.label || page.serviceCategory}</span>
        </nav>

        {/* Text & Action on the Left */}
        <div className="max-w-xl lg:max-w-2xl space-y-4 md:space-y-5">
          <h1 className="text-[26px] sm:text-[34px] md:text-[40px] lg:text-[44px] font-bold leading-[1.2] text-[#111827] tracking-tight">
            {page.title}
          </h1>

          {page.subtitle && (
            <p className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-brand leading-relaxed max-w-xl">
              {page.subtitle}
            </p>
          )}

          <div className="pt-2">
            <a
              href={page.ctaLink || "#appointment"}
              onClick={handleCtaClick}
              className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-[15px] sm:text-[16px] font-semibold text-white shadow-md shadow-brand/20 transition-all duration-300 hover:bg-brand-2 hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center rounded-full bg-white/20 p-1 group-hover:scale-110 transition-transform">
                <FaCalendarDays className="size-4 text-white" />
              </span>
              <span>{page.ctaText || "Book a Consultation"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

