import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Smooth scroll to a `#hash` target (accounts for the sticky nav); falls back to native scrolling. */
export function scrollToHash(hash: string, offset = -50) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
  history.replaceState(null, "", hash);
  return true;
}
