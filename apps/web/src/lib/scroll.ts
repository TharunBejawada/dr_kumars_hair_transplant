import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Smooth scroll to a `#hash` target (accounts for the sticky header); falls back to native scrolling. */
export function scrollToHash(hash: string, offset?: number) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return false;
  const header = document.querySelector<HTMLElement>("header");
  const actualOffset = offset ?? (header ? -header.offsetHeight : -140);
  if (lenis) lenis.scrollTo(el, { offset: actualOffset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + actualOffset, behavior: "smooth" });
  history.replaceState(null, "", hash);
  return true;
}

/** Freeze page scrolling (modals): stops Lenis and the native scrollbar. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Smoothly scrolls the window back to the top of the page. */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
