"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaPhone } from "react-icons/fa6";
import { clinic, nav } from "@/lib/content";
import ScrollLink from "./ScrollLink";

export default function Header() {
  const [open, setOpen] = useState(false);
  const onHome = usePathname() === "/";
  // On inner pages, in-page anchors point back to the home page sections.
  const link = (href: string) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  const pick = (tab?: string) => {
    if (tab) window.dispatchEvent(new CustomEvent("select-treatment-tab", { detail: tab }));
    setOpen(false);
  };

  return (
    <>
      <div className="mx-auto flex h-[142px] w-full max-w-[1440px] items-start justify-between px-5 pt-[34px] md:px-8 xl:px-[110px]">
        <a href="/" aria-label="Dr. Kumar's Hair Transplant – home" className="shrink-0">
          <Image src="/images/logo.webp" alt="Dr. Kumar's Hair Transplant – Advanced Hair Transplantation Centre" width={268} height={77} priority className="h-auto w-[200px] md:w-[268px]" />
        </a>
        <a
          href={clinic.phoneHref}
          className="group mt-[12px] flex items-center"
          aria-label={`Call ${clinic.phone}`}
        >
          <span className="relative z-10 flex size-[53px] items-center justify-center rounded-full bg-brand text-white ring-0 transition-transform duration-300 group-hover:scale-105">
            <span className="flex size-[47px] items-center justify-center rounded-full border-2 border-white/90">
              <FaPhone className="size-[18px] -scale-x-100" />
            </span>
          </span>
          <span className="-ml-4 hidden h-[40px] items-center rounded-r-[18px] bg-brand pl-7 pr-3 text-[18px] font-medium text-white transition-colors duration-300 group-hover:bg-brand-2 sm:flex">
            {clinic.phone}
          </span>
        </a>
      </div>

      <nav aria-label="Primary" className="sticky top-0 z-50 h-[50px] bg-brand text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-8 lg:justify-center">
          <span className="text-[18px] font-medium lg:hidden">Menu</span>
          <button
            type="button"
            className="flex size-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`h-[2px] w-6 bg-white transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-[2px] w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-6 bg-white transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
          <ul className="hidden items-center gap-[44px] lg:flex">
            {nav.map((item) => (
              <li key={item.label} className="[&:last-child]:-ml-[11px]">
                <ScrollLink
                  href={link(item.href)}
                  onNavigate={() => pick("tab" in item ? item.tab : undefined)}
                  className="relative block py-[11px] text-[18px] font-medium leading-[27px] after:absolute after:inset-x-0 after:bottom-[8px] after:h-[2px] after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {item.label}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </div>
        {open && (
          <ul className="absolute inset-x-0 top-[50px] bg-brand px-5 pb-4 shadow-lg lg:hidden">
            {nav.map((item) => (
              <li key={item.label} className="border-t border-white/20">
                <ScrollLink href={link(item.href)} onNavigate={() => pick("tab" in item ? item.tab : undefined)} className="block py-3 text-[17px] font-medium">
                  {item.label}
                </ScrollLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
}
