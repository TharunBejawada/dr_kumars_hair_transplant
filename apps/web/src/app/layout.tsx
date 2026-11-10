import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.drkumarshairtransplant.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dr. Kumar's Hair Transplant | Skin & Hair Care in Kondapur, Hyderabad",
  description:
    "Personalised dermatology, advanced hair restoration and aesthetic treatments in Kondapur, Hyderabad. Led by Dr. Ashok Kumar (MBBS, DDVL).",
  openGraph: {
    type: "website",
    title: "Dr. Kumar's Hair Transplant – Skin & Hair Care in Kondapur, Hyderabad",
    description: "Healthier Skin. Fuller Hair. Greater Confidence.",
    url: siteUrl,
    siteName: "Dr. Kumar's Hair Transplant",
    images: [{ url: "/images/hero.webp", width: 1262, height: 841 }],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0b9388", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* Enable reveal animations only when JS is on and motion is allowed. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
