"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaChevronRight, FaPhone } from "react-icons/fa6";
import { clinic } from "@/lib/content";
import { NAV_DEPARTMENTS, type NavDepartmentMenu } from "@/lib/nav-treatments";
import ScrollLink from "./ScrollLink";

interface HeaderProps {
  initialTreatments?: { title: string; slug: string; serviceCategory: string }[];
}

function buildDepartments(
  dbTreatments?: { title: string; slug: string; serviceCategory: string }[]
): NavDepartmentMenu[] {
  return NAV_DEPARTMENTS.map((dept) => {
    const items = (dbTreatments || [])
      .filter((t) => t.serviceCategory === dept.id)
      .map((t) => ({ name: t.title, href: `/${t.serviceCategory}/${t.slug}` }));
    return { ...dept, treatments: items };
  });
}

export default function Header({ initialTreatments }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [departments, setDepartments] = useState<NavDepartmentMenu[]>(() =>
    buildDepartments(initialTreatments)
  );
  const pathname = usePathname();
  const onHome = pathname === "/";

  // On inner pages, in-page anchors point back to the home page sections.
  const link = (href: string) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  const pick = (tab?: string) => {
    if (tab) window.dispatchEvent(new CustomEvent("select-treatment-tab", { detail: tab }));
    setOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch live treatments dynamically from DynamoDB to ensure data is always fresh
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

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      {/* Top logo & phone bar */}
      <div className="bg-white">
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 md:px-8 xl:px-[110px] transition-all duration-300 ${
            scrolled
              ? "h-[70px] sm:h-[78px] md:h-[84px]"
              : "h-[85px] sm:h-[95px] md:h-[115px]"
          }`}
        >
          <a href="/" aria-label="Dr. Kumar's Hair Transplant – home" className="shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Dr. Kumar's Hair Transplant – Advanced Hair Transplantation Centre"
              width={268}
              height={77}
              priority
              className={`h-auto transition-all duration-300 ${
                scrolled
                  ? "w-[170px] sm:w-[200px] md:w-[225px]"
                  : "w-[190px] sm:w-[220px] md:w-[268px]"
              }`}
            />
          </a>
          <a
            href={clinic.phoneHref}
            className="group flex items-center"
            aria-label={`Call ${clinic.phone}`}
          >
            <span
              className={`relative z-10 flex items-center justify-center rounded-full bg-brand text-white ring-0 transition-all duration-300 group-hover:scale-105 ${
                scrolled
                  ? "size-[42px] md:size-[46px]"
                  : "size-[48px] md:size-[53px]"
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-full border-2 border-white/90 ${
                  scrolled
                    ? "size-[36px] md:size-[40px]"
                    : "size-[42px] md:size-[47px]"
                }`}
              >
                <FaPhone className="size-[15px] md:size-[17px] -scale-x-100" />
              </span>
            </span>
            <span
              className={`-ml-4 hidden items-center rounded-r-[18px] bg-brand text-white transition-all duration-300 group-hover:bg-brand-2 sm:flex ${
                scrolled
                  ? "h-[34px] md:h-[36px] pl-6 pr-3 text-[15px] font-medium"
                  : "h-[40px] pl-7 pr-3 text-[18px] font-medium"
              }`}
            >
              {clinic.phone}
            </span>
          </a>
        </div>
      </div>

      {/* Navigation bar */}
      <nav aria-label="Primary" className="h-[50px] bg-brand text-white relative">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-8 xl:px-[110px] lg:justify-center">
          <span className="text-[17px] font-semibold lg:hidden">Menu</span>
          <button
            type="button"
            className="flex size-10 flex-col items-center justify-center gap-[5px] lg:hidden cursor-pointer"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`h-[2px] w-6 bg-white transition-transform ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 bg-white transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 bg-white transition-transform ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-[22px] xl:gap-[32px] 2xl:gap-[38px] lg:flex">
            {/* 1. Home */}
            <li>
              <ScrollLink
                href={link("#home")}
                className="relative block py-[11px] text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Home
              </ScrollLink>
            </li>

            {/* 2. About Us */}
            <li>
              <Link
                href="/about"
                className="relative block py-[11px] text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                About Us
              </Link>
            </li>

            {/* 3–6. Departments with Dynamic Hover Dropdown Menus from DB */}
            {departments.map((dept) => (
              <li key={dept.id} className="relative group py-[11px]">
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <Link
                    href={dept.departmentHref}
                    onClick={() => pick(dept.tab)}
                    className="relative block text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 group-hover:after:scale-x-100"
                  >
                    {dept.label}
                  </Link>
                  <FaChevronDown className="size-2.5 text-white/80 transition-transform duration-200 group-hover:rotate-180 group-hover:text-white" />
                </div>

                {/* Dropdown Menu on Hover */}
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 absolute top-full left-0 z-50 pt-0.5 pointer-events-none group-hover:pointer-events-auto">
                  <div className="min-w-[210px] w-max max-w-[290px] bg-[#08322e] shadow-2xl border border-[#0d4d46] overflow-hidden">
                    <ul>
                      {dept.treatments.length > 0 ? (
                        <>
                          {dept.treatments.map((t, idx) => (
                            <li
                              key={t.href}
                              className={idx < dept.treatments.length - 1 ? "border-b border-white/30" : ""}
                            >
                              <Link
                                href={t.href}
                                className="block px-4 py-2.5 text-[14.5px] font-normal text-white hover:bg-black/25 hover:text-teal-200 transition-colors"
                              >
                                {t.name}
                              </Link>
                            </li>
                          ))}
                          <li className="border-t border-white/20 bg-black/25">
                            <Link
                              href={dept.departmentHref}
                              onClick={() => pick(dept.tab)}
                              className="flex items-center justify-between px-4 py-2 text-[12.5px] font-semibold text-teal-300 hover:text-white transition-colors"
                            >
                              <span>Explore {dept.label} Department</span>
                              <FaChevronRight className="size-2.5" />
                            </Link>
                          </li>
                        </>
                      ) : (
                        <li>
                          <Link
                            href={dept.departmentHref}
                            onClick={() => pick(dept.tab)}
                            className="flex items-center justify-between px-4 py-3 text-[13.5px] font-medium text-white/95 hover:bg-black/20 hover:text-teal-200 transition-colors"
                          >
                            <span>Explore {dept.label} Department</span>
                            <FaChevronRight className="size-2.5" />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </li>
            ))}

            {/* 7. Blog */}
            <li>
              <Link
                href="/blogs"
                className="relative block py-[11px] text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Blog
              </Link>
            </li>

            {/* 8. Gallery */}
            <li>
              <ScrollLink
                href={link("#results")}
                className="relative block py-[11px] text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Gallery
              </ScrollLink>
            </li>

            {/* 9. Contact Us */}
            <li>
              <ScrollLink
                href={link("#contact")}
                className="relative block py-[11px] text-[16px] xl:text-[17px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[6px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Contact Us
              </ScrollLink>
            </li>
          </ul>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <ul className="absolute inset-x-0 top-[50px] bg-[#072d29] px-5 py-3 shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto divide-y divide-white/10 z-50">
            <li>
              <ScrollLink
                href={link("#home")}
                onNavigate={() => setOpen(false)}
                className="block py-2.5 text-[16px] font-medium text-white"
              >
                Home
              </ScrollLink>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block py-2.5 text-[16px] font-medium text-white"
              >
                About Us
              </Link>
            </li>

            {/* Departments with Expandable Submenus on Mobile */}
            {departments.map((dept) => {
              const isExpanded = mobileExpandedCat === dept.id;
              return (
                <li key={dept.id} className="py-1">
                  <div className="flex items-center justify-between py-2">
                    <Link
                      href={dept.departmentHref}
                      onClick={() => {
                        pick(dept.tab);
                        setOpen(false);
                      }}
                      className="text-[16px] font-semibold text-white"
                    >
                      {dept.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedCat(isExpanded ? null : dept.id)
                      }
                      className="p-2 text-white/80 hover:text-white cursor-pointer"
                      aria-label={`Toggle ${dept.label} treatments`}
                    >
                      <FaChevronDown
                        className={`size-3 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <ul className="pl-4 pb-2 space-y-1.5 border-l-2 border-brand/50 ml-2">
                      {dept.treatments.length > 0 ? (
                        <>
                          {dept.treatments.map((t) => (
                            <li key={t.name}>
                              <Link
                                href={t.href}
                                onClick={() => setOpen(false)}
                                className="block py-1 text-[13.5px] text-teal-100 hover:text-white"
                              >
                                {t.name}
                              </Link>
                            </li>
                          ))}
                          <li className="pt-1">
                            <Link
                              href={dept.departmentHref}
                              onClick={() => setOpen(false)}
                              className="block text-[12px] font-bold text-teal-300"
                            >
                              Explore {dept.label} Department →
                            </Link>
                          </li>
                        </>
                      ) : (
                        <li>
                          <Link
                            href={dept.departmentHref}
                            onClick={() => setOpen(false)}
                            className="block text-[12.5px] font-bold text-teal-300 py-1"
                          >
                            Explore {dept.label} Department →
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}

            <li>
              <Link
                href="/blogs"
                onClick={() => setOpen(false)}
                className="block py-2.5 text-[16px] font-medium text-white"
              >
                Blog
              </Link>
            </li>
            <li>
              <ScrollLink
                href={link("#results")}
                onNavigate={() => setOpen(false)}
                className="block py-2.5 text-[16px] font-medium text-white"
              >
                Gallery
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                href={link("#contact")}
                onNavigate={() => setOpen(false)}
                className="block py-2.5 text-[16px] font-medium text-white"
              >
                Contact Us
              </ScrollLink>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
