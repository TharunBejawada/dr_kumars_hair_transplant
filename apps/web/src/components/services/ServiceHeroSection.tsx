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
    <section className="relative overflow-hidden bg-gradient-to-r from-[#dff5f2] via-[#eef9f8] to-[#ffffff] border-b border-teal-100/60">
      {/* Decorative background curve */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-brand/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px] py-10 md:py-14 lg:py-16">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumbs" className="mb-6 flex items-center gap-2 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-brand transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-brand transition">
            Services
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{catObj?.label || page.serviceCategory}</span>
        </nav>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Subtitle & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-[28px] sm:text-[34px] md:text-[42px] lg:text-[46px] font-bold leading-[1.2] text-[#111827] tracking-tight">
              {page.title}
            </h1>

            {page.subtitle && (
              <p className="text-[17px] sm:text-[19px] md:text-[21px] font-semibold text-brand leading-relaxed max-w-2xl">
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

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px]">
              {/* Organic backdrop shape behind the image */}
              <div
                className="absolute inset-0 -rotate-2 scale-105 rounded-[32px] bg-gradient-to-tr from-teal-200/40 to-emerald-100/30 blur-sm"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[28px] border-4 border-white shadow-xl bg-white aspect-[4/3] sm:aspect-[16/11]">
                {page.image ? (
                  <Image
                    src={page.image}
                    alt={page.imageAlt || page.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                    No image provided
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

