"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaSquareFacebook,
  FaInstagram,
  FaLocationDot,
  FaPhone,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { clinic } from "@/lib/content";
import { NAV_DEPARTMENTS, cleanTreatmentName, type NavDepartmentMenu } from "@/lib/nav-treatments";

const socialIcon = {
  x: FaXTwitter,
  facebook: FaSquareFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
} as const;

interface FooterProps {
  initialTreatments?: { title: string; slug: string; serviceCategory: string }[];
}

function buildDepartments(
  dbTreatments?: { title: string; slug: string; serviceCategory: string }[]
): NavDepartmentMenu[] {
  return NAV_DEPARTMENTS.map((dept) => {
    const items = (dbTreatments || [])
      .filter((t) => t.serviceCategory === dept.id)
      .map((t) => ({ name: cleanTreatmentName(t.title), href: `/${t.serviceCategory}/${t.slug}` }));
    return { ...dept, treatments: items };
  });
}

function DepartmentColumn({ dept, gap }: { dept: NavDepartmentMenu; gap?: number }) {
  return (
    <div style={{ marginTop: gap ?? 0 }}>
      <Link
        href={dept.departmentHref}
        className="group inline-flex items-center gap-2 hover:text-teal-200 transition-colors"
      >
        <h3 className="text-[24px] font-semibold leading-[37px] group-hover:underline">
          {dept.label}
        </h3>
      </Link>
      <ul className="mt-[10px] text-[17px] sm:text-[18px] font-medium leading-[34px]">
        {dept.treatments.length > 0 ? (
          dept.treatments.map((t) => (
            <li key={t.href} className="flex gap-[10px] before:content-['•'] before:text-[14px]">
              <Link
                href={t.href}
                className="hover:underline hover:text-teal-200 transition-colors line-clamp-1"
              >
                {t.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="flex gap-[10px] before:content-['•'] before:text-[14px]">
            <Link
              href={dept.departmentHref}
              className="text-white/80 hover:underline hover:text-teal-200 transition-colors text-[16px]"
            >
              Explore {dept.label} Treatments →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function Footer({ initialTreatments }: FooterProps) {
  const [departments, setDepartments] = useState<NavDepartmentMenu[]>(() =>
    buildDepartments(initialTreatments)
  );

  useEffect(() => {
    if (initialTreatments && initialTreatments.length > 0) {
      setDepartments(buildDepartments(initialTreatments));
    }
    fetch("/api/treatments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.treatments || !Array.isArray(data.treatments)) return;
        setDepartments(buildDepartments(data.treatments));
      })
      .catch(() => {});
  }, [initialTreatments]);

  const hairDept = departments.find((d) => d.id === "hair") ?? NAV_DEPARTMENTS[0];
  const stdDept = departments.find((d) => d.id === "std") ?? NAV_DEPARTMENTS[3];
  const skinDept = departments.find((d) => d.id === "skin-cosmetic") ?? NAV_DEPARTMENTS[1];
  const dermaDept = departments.find((d) => d.id === "dermatology") ?? NAV_DEPARTMENTS[2];

  return (
    <footer className="relative mt-0 overflow-hidden bg-brand-2 text-white">
      <Image
        src="/images/footerbg.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.16]"
        aria-hidden
      />
      <div className="relative">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 pb-[35px] pt-[45px] md:px-8 lg:grid-cols-[489px_1fr] lg:gap-[87px] xl:pl-[89px] xl:pr-[90px]">
          {/* Left clinic card */}
          <div
            data-reveal="left"
            className="h-fit min-w-0 rounded-[18px] bg-foot-card px-5 sm:px-[45px] pb-[39px] pt-[43px]"
          >
            <div className="flex h-[105px] w-[351px] max-w-full items-center justify-center rounded-[10px] bg-white">
              <Image
                src="/images/logo-footer.webp"
                alt="Dr. Kumar's Hair Transplant"
                width={285}
                height={82}
                className="h-auto w-[285px] max-w-[90%]"
              />
            </div>
            <h3 className="mt-[42px] text-[21px] font-semibold leading-[33px]">Find US</h3>
            <address className="mt-[18px] space-y-[30px] text-[18px] font-medium not-italic leading-[28px] xl:-mr-[29px]">
              <p className="relative pl-[41px]">
                <FaLocationDot className="absolute -left-[3px] top-[5px] size-[24px]" aria-hidden />
                {clinic.address}
              </p>
              <p className="relative pl-[41px]">
                <FaPhone
                  className="absolute -left-[3px] top-[5px] size-[22px] -scale-x-100"
                  aria-hidden
                />
                Phone:<br />
                <a href={clinic.phoneHref} className="hover:underline">
                  {clinic.phone}
                </a>
              </p>
              <p className="relative pl-[41px]">
                <FaEnvelope className="absolute -left-[3px] top-[5px] size-[22px]" aria-hidden />
                Email:<br />
                <a href={`mailto:${clinic.email}`} className="break-all hover:underline">
                  {clinic.email}
                </a>
              </p>
            </address>
            <h3 className="mt-[35px] text-[21px] font-semibold leading-[33px]">Follow Us</h3>
            <ul className="mt-[14px] flex gap-[14px]">
              {clinic.social.map((s) => {
                const Icon = socialIcon[s.icon];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-[30px] items-center justify-center transition-transform duration-300 hover:-translate-y-1 hover:scale-110"
                    >
                      <Icon className="size-[28px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Dynamic Category Columns (mirrors navbar data) */}
          <div data-stagger className="grid min-w-0 sm:grid-cols-2 lg:grid-cols-[360px_1fr] gap-8 sm:gap-6">
            <div className="lg:pt-0 space-y-8">
              <DepartmentColumn dept={hairDept} gap={0} />
              <DepartmentColumn dept={stdDept} gap={24} />
            </div>
            <div className="space-y-8">
              <DepartmentColumn dept={skinDept} gap={0} />
              <DepartmentColumn dept={dermaDept} gap={20} />
            </div>
          </div>
        </div>

        <div className="flex h-[77px] items-center justify-center bg-foot-bar px-4 text-center text-[16px] font-medium tracking-[0.4px] md:text-[21px]">
          Copyright © 2026 . Dr. Kumar’s Hair Transplant
        </div>
      </div>
    </footer>
  );
}
