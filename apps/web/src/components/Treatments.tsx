"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FaArrowRight } from "react-icons/fa6";
import { treatmentTabs, type TreatmentTab } from "@/lib/content";

const tabs = Object.keys(treatmentTabs) as TreatmentTab[];

export default function Treatments() {
  const [active, setActive] = useState<TreatmentTab>("Skin");
  const gridRef = useRef<HTMLUListElement>(null);
  const first = useRef(true);
  const data = treatmentTabs[active];

  // Header nav ("Hair", "STD"…) can switch the tab.
  useEffect(() => {
    const on = (e: Event) => {
      const tab = (e as CustomEvent<string>).detail as TreatmentTab;
      if (tab in treatmentTabs) setActive(tab);
    };
    window.addEventListener("select-treatment-tab", on);
    return () => window.removeEventListener("select-treatment-tab", on);
  }, []);

  // Animate cards in whenever the tab changes (initial reveal is handled by <Animations/>).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !gridRef.current) return;
    gsap.fromTo(gridRef.current.children, { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" });
  }, [active]);

  return (
    <section id="treatments" className="mx-auto max-w-[1440px] px-5 pt-14 md:px-8 lg:pt-[57px] xl:px-[110px]">
      <div className="text-center">
        <h2 data-reveal="scale" className="mx-auto flex h-[42px] w-[269px] items-center justify-center rounded-[5px] bg-brand-2 text-[22px] font-semibold tracking-[0.3px] text-white md:text-[26px]">
          Our Treatments
        </h2>
        <h3 data-reveal="up" className="mt-[24px] text-[18px] font-medium leading-[27px] text-[#010101] md:text-[21px]">
          Treatments for Your Skin, Hair &amp; Overall Well-Being
        </h3>
        <p data-reveal="up" className="mx-auto mt-[14px] max-w-[1063px] text-[15px] leading-[25px] md:text-[16px]">
          At Dr. Kumar&apos;s Skin &amp; Hair Transplant Center, we provide a range of dermatology, hair restoration, cosmetic, and STI care services. Explore our treatments to learn about available options for your concerns.
        </p>

        <div role="tablist" aria-label="Treatment categories" data-reveal="up" className="mt-[25px] flex flex-wrap justify-center gap-[10px] md:gap-[22px]">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={active === t}
              onClick={() => setActive(t)}
              className={`h-[38px] w-[112px] rounded-[5px] text-[18px] font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                active === t ? "bg-brand-2 text-white shadow-md" : "bg-chip text-black hover:bg-brand-light/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p data-reveal="up" className="mx-auto mt-[27px] max-w-[1156px] text-[15px] leading-[25px] md:text-[16px]" aria-live="polite">
          {data.intro}
        </p>
      </div>

      <ul ref={gridRef} data-stagger className="mt-[36px] flex flex-wrap justify-center gap-x-5 gap-y-10 lg:justify-between">
        {data.items.map((item, i) => (
          <li key={`${active}-${item.name}`} data-reveal="up" className="group w-[215px] text-center">
            <a href="#contact" className="relative block h-[307px] w-[215px] cursor-pointer" aria-label={`Enquire about ${item.name}`}>
              {item.image ? (
                <Image src={item.image} alt={item.name} width={215} height={307} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[120px] bg-gradient-to-b from-brand-light/60 to-brand-2 p-6 text-[20px] font-semibold text-white transition-transform duration-500 group-hover:scale-[1.03]">
                  {item.name}
                </div>
              )}
              <span
                className={`absolute -bottom-[14px] left-1/2 flex size-[41px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-white text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-2 ${
                  i === 0 ? "bg-brand-2" : "bg-brand-light"
                }`}
              >
                <FaArrowRight className="size-[16px]" />
              </span>
            </a>
            <p className="mt-[38px] text-[16px] leading-[25px]">{item.name}</p>
          </li>
        ))}
      </ul>

      <div className="mt-[39px] text-center">
        <a href="#contact" data-reveal="up" className="inline-flex h-[40px] items-center justify-center rounded-[5px] bg-brand-2 px-[28px] text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg">
          {data.cta}
        </a>
      </div>
    </section>
  );
}
