"use client";

import type { ComponentProps } from "react";
import { scrollToHash } from "@/lib/scroll";

type Props = ComponentProps<"a"> & { href: string; onNavigate?: () => void };

/** Anchor that smooth-scrolls to in-page `#sections`; regular links pass through untouched. */
export default function ScrollLink({ href, onNavigate, onClick, ...rest }: Props) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !href.startsWith("#")) return;
        if (scrollToHash(href)) {
          e.preventDefault();
          onNavigate?.();
        }
      }}
    />
  );
}
