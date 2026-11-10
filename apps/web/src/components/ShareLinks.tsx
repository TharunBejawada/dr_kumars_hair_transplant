import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const items = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FaFacebookF },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: FaXTwitter },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: FaLinkedinIn },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: FaWhatsapp },
  ];
  return (
    <div className="flex items-center gap-3">
      <span className="text-[15px] font-semibold">Share this</span>
      {items.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}
          className="flex size-[38px] items-center justify-center rounded-full bg-brand-2 text-white transition-all hover:-translate-y-1 hover:bg-brand"><Icon className="size-[16px]" /></a>
      ))}
    </div>
  );
}
