import Image from "next/image";
import { FaEnvelope, FaSquareFacebook, FaInstagram, FaLocationDot, FaPhone, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { clinic, footerColumns } from "@/lib/content";

const socialIcon = {
  x: FaXTwitter,
  facebook: FaSquareFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
} as const;

function Column({ title, items, gap }: { title: string; items: readonly string[]; gap?: number }) {
  return (
    <div style={{ marginTop: gap ?? 0 }}>
      <h3 className="text-[24px] font-semibold leading-[37px]">{title}</h3>
      <ul className="mt-[10px] text-[18px] font-medium leading-[35px]">
        {items.map((i) => (
          <li key={i} className="flex gap-[10px] before:content-['•'] before:text-[14px]">{i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-0 overflow-hidden bg-brand-2 text-white">
      <Image src="/images/footerbg.webp" alt="" fill sizes="100vw" className="object-cover opacity-[0.16]" aria-hidden />
      <div className="relative">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 pb-[35px] pt-[45px] md:px-8 lg:grid-cols-[489px_1fr] lg:gap-[87px] xl:pl-[89px] xl:pr-[90px]">
          <div data-reveal="left" className="h-fit min-w-0 rounded-[18px] bg-foot-card px-5 sm:px-[45px] pb-[39px] pt-[43px]">
            <div className="flex h-[105px] w-[351px] max-w-full items-center justify-center rounded-[10px] bg-white">
              <Image src="/images/logo-footer.webp" alt="Dr. Kumar's Hair Transplant" width={285} height={82} className="h-auto w-[285px] max-w-[90%]" />
            </div>
            <h3 className="mt-[42px] text-[21px] font-semibold leading-[33px]">Find US</h3>
            <address className="mt-[18px] space-y-[30px] text-[18px] font-medium not-italic leading-[28px] xl:-mr-[29px]">
              <p className="relative pl-[41px]"><FaLocationDot className="absolute -left-[3px] top-[5px] size-[24px]" aria-hidden />{clinic.address}</p>
              <p className="relative pl-[41px]"><FaPhone className="absolute -left-[3px] top-[5px] size-[22px] -scale-x-100" aria-hidden />Phone:<br /><a href={clinic.phoneHref} className="hover:underline">{clinic.phone}</a></p>
              <p className="relative pl-[41px]"><FaEnvelope className="absolute -left-[3px] top-[5px] size-[22px]" aria-hidden />Email:<br /><a href={`mailto:${clinic.email}`} className="break-all hover:underline">{clinic.email}</a></p>
            </address>
            <h3 className="mt-[35px] text-[21px] font-semibold leading-[33px]">Follow Us</h3>
            <ul className="mt-[14px] flex gap-[14px]">
              {clinic.social.map((s) => {
                const Icon = socialIcon[s.icon];
                return (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex size-[30px] items-center justify-center transition-transform duration-300 hover:-translate-y-1 hover:scale-110">
                      <Icon className="size-[28px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div data-stagger className="grid min-w-0 sm:grid-cols-2 lg:grid-cols-[360px_1fr]">
            <div className="lg:pt-0">
              {footerColumns.left.map((c, i) => <Column key={c.title} title={c.title} items={c.items} gap={[0, 20, 25][i]} />)}
            </div>
            <div>
              {footerColumns.right.map((c, i) => <Column key={c.title} title={c.title} items={c.items} gap={[0, 14][i]} />)}
            </div>
          </div>
        </div>
        <div className="flex h-[77px] items-center justify-center bg-foot-bar px-4 text-center text-[16px] font-medium tracking-[0.4px] md:text-[21px]">
          Copyright © 2026 . Dr. Kumar’s Hair Transplant
        </div>
      </div>
    </footer>
  );
}
