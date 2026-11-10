"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Declarative scroll animations driven by data attributes (kept out of the section components):
 *  data-reveal="up|down|left|right|scale|fade"   – animate when scrolled into view
 *  data-stagger                                    – on a parent: children with data-reveal animate in sequence
 *  data-delay="0.2"                                – extra delay (seconds)
 *  data-parallax="0.15"                            – subtle vertical parallax on scroll
 *  data-count="13" (+ data-suffix="+")             – count-up number
 */
export default function Animations() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const from = (dir: string) => {
      switch (dir) {
        case "left": return { x: -60 };
        case "right": return { x: 60 };
        case "down": return { y: -40 };
        case "scale": return { scale: 0.88 };
        case "fade": return {};
        default: return { y: 50 };
      }
    };

    const ctx = gsap.context(() => {
      // Hero intro plays on load, not on scroll.
      const intro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });
      intro
        .from("[data-hero-img]", { x: -120, opacity: 0, duration: 1.2 })
        .from("[data-hero-line]", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.14 }, "-=0.8")
        .from("[data-hero-sub]", { y: 24, opacity: 0, duration: 0.8 }, "-=0.5");

      const staggerParents = new Set<Element>();
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((parent) => {
        staggerParents.add(parent);
        const kids = Array.from(parent.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (!kids.length) return;
        const dir = kids[0].dataset.reveal ?? "up";
        gsap.fromTo(
          kids,
          { opacity: 0, ...from(dir) },
          {
            opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.11,
            scrollTrigger: { trigger: parent, start: "top 82%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.closest("[data-stagger]") && staggerParents.has(el.closest("[data-stagger]")!)) return;
        gsap.fromTo(
          el,
          { opacity: 0, ...from(el.dataset.reveal ?? "up") },
          {
            opacity: 1, x: 0, y: 0, scale: 1, duration: 0.95, ease: "power3.out",
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax) * 100;
        gsap.fromTo(el, { yPercent: -amt }, {
          yPercent: amt, ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end, duration: 1.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
        });
      });

      // Make sure measurements are right once images have loaded.
      ScrollTrigger.refresh();
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return null;
}
