import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Dr. Kumar's Hair Transplant",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f4f7f7] text-ink">{children}</div>;
}
