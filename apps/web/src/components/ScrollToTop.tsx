"use client";

import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa6";
import { scrollToTop } from "@/lib/scroll";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (totalScroll > 0) {
        const progress = Math.min(
          Math.max((currentScroll / totalScroll) * 100, 0),
          100
        );
        setScrollProgress(progress);
      }

      setVisible(currentScroll > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      title="Scroll to top"
      className={`group fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-all duration-300 hover:bg-brand-2 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
          : "opacity-0 translate-y-4 pointer-events-none scale-90"
      }`}
    >
      {/* Circular progress track & fill */}
      <svg
        className="absolute inset-0 size-full -rotate-90 pointer-events-none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2.5"
        />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeDasharray={2 * Math.PI * 21}
          strokeDashoffset={2 * Math.PI * 21 * (1 - scrollProgress / 100)}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      {/* Upward Chevron Icon */}
      <FaChevronUp className="relative size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
