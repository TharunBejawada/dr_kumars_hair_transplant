import { FaPhone, FaWhatsapp } from "react-icons/fa6";
import { clinic } from "@/lib/content";

/** Fixed WhatsApp / call buttons docked to the right edge (as in the design). */
export default function FloatingContact() {
  const base =
    "flex h-[69px] w-[72px] items-center justify-center bg-[#0f8a80] text-white transition-[width,background-color] duration-300 hover:w-[96px] hover:bg-brand-3 md:w-[96px]";
  return (
    <div className="fixed right-0 top-[353px] z-40 hidden flex-col items-end gap-[8px] sm:flex">
      <a href={clinic.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className={base}>
        <FaWhatsapp className="size-[38px]" />
      </a>
      <a href={clinic.phoneHref} aria-label={`Call ${clinic.phone}`} className={base}>
        <FaPhone className="size-[28px] -scale-x-100" />
      </a>
    </div>
  );
}
