import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicShell from "@/components/PublicShell";
import { listLiveServicePages } from "@/lib/db/services";
import { serviceCategories } from "@drkumar/shared";
import { clinic } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Our Services & Treatments | ${clinic.name}`,
  description:
    "Explore our complete range of specialized services: Hair Restoration, Skin & Cosmetic treatments, Clinical Dermatology, and STD care.",
};

export default async function ServicesHubPage() {
  const pages = await listLiveServicePages();

  return (
    <PublicShell>
      <div className="bg-gradient-to-b from-[#e8f7f5] via-white to-white py-12 md:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px]">
          <div className="max-w-3xl">
            <h1 className="text-[32px] sm:text-[42px] font-bold text-gray-900 leading-tight">
              Our Services & Treatments
            </h1>
            <p className="mt-3 text-[16px] sm:text-[18px] text-gray-600">
              Personalised medical and aesthetic care provided by Dr. Kumar in Kondapur, Hyderabad.
              Browse our services across Hair, Skin & Cosmetic, Dermatology, and STD care.
            </p>
          </div>

          <div className="mt-12 space-y-14">
            {serviceCategories.map((cat) => {
              const catPages = pages.filter((p) => p.serviceCategory === cat.id);
              return (
                <div key={cat.id} className="border-t border-gray-100 pt-8 first:border-0 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900">{cat.label}</h2>
                      <p className="text-[14px] text-gray-500 mt-1">{cat.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {catPages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/department/${page.slug}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                      >
                        <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                          {page.image ? (
                            <Image
                              src={page.image}
                              alt={page.imageAlt || page.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 380px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              {cat.label}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-brand transition line-clamp-2">
                            {page.title}
                          </h3>
                          {page.subtitle && (
                            <p className="mt-2 text-[13px] text-gray-600 line-clamp-2 flex-1">
                              {page.subtitle}
                            </p>
                          )}
                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-[13px] font-semibold text-brand">
                            <span>Explore Details</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {catPages.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 sm:col-span-2 lg:col-span-3">
                        Detail pages for {cat.label} will appear here once published.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

