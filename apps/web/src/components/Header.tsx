"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaPhone } from "react-icons/fa6";
import { clinic, nav } from "@/lib/content";
import ScrollLink from "./ScrollLink";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHome = usePathname() === "/";
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

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.1)]" : ""}`}>
      {/* Top logo & phone bar */}
      <div className="bg-white">
        <div className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 md:px-8 xl:px-[110px] transition-all duration-300 ${scrolled ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[85px] sm:h-[95px] md:h-[115px]"}`}>
          <a href="/" aria-label="Dr. Kumar's Hair Transplant – home" className="shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Dr. Kumar's Hair Transplant – Advanced Hair Transplantation Centre"
              width={268}
              height={77}
              priority
              className={`h-auto transition-all duration-300 ${scrolled ? "w-[170px] sm:w-[200px] md:w-[230px]" : "w-[190px] sm:w-[220px] md:w-[268px]"}`}
            />
          </a>
          <a
            href={clinic.phoneHref}
            className="group flex items-center"
            aria-label={`Call ${clinic.phone}`}
          >
            <span className={`relative z-10 flex items-center justify-center rounded-full bg-brand text-white ring-0 transition-all duration-300 group-hover:scale-105 ${scrolled ? "size-[44px] md:size-[48px]" : "size-[48px] md:size-[53px]"}`}>
              <span className={`flex items-center justify-center rounded-full border-2 border-white/90 ${scrolled ? "size-[38px] md:size-[42px]" : "size-[42px] md:size-[47px]"}`}>
                <FaPhone className="size-[16px] md:size-[18px] -scale-x-100" />
              </span>
            </span>
            <span className={`-ml-4 hidden items-center rounded-r-[18px] bg-brand text-white transition-all duration-300 group-hover:bg-brand-2 sm:flex ${scrolled ? "h-[36px] md:h-[38px] pl-6 pr-3 text-[16px] font-medium" : "h-[40px] pl-7 pr-3 text-[18px] font-medium"}`}>
              {clinic.phone}
            </span>
          </a>
        </div>
      </div>

      {/* Navigation bar */}
      <nav aria-label="Primary" className="h-[50px] bg-brand text-white">
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
    </header>
  );
}
