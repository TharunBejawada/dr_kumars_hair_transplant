import Image from "next/image";
import { conditions } from "@/lib/content";

export default function Conditions() {
  return (
    <section id="dermatology" className="mt-[42px] bg-mint py-[27px] lg:h-[520px]">
      <div className="mx-auto max-w-[1440px] px-5 text-center md:px-8 xl:px-[110px]">
        <h2 data-reveal="up" className="text-[22px] font-semibold leading-[34px] tracking-[0.3px] text-brand md:text-[26px]">Comprehensive Care for Skin &amp; Hair Conditions</h2>
        <p data-reveal="up" className="mx-auto mt-[12px] max-w-[983px] text-[15px] leading-[25px] md:text-[16px]">
          From common concerns to chronic dermatological conditions, our clinic provides assessment and management tailored to individual needs.
        </p>
        <ul data-stagger className="mt-[24px] grid grid-cols-2 gap-4 md:grid-cols-3 lg:flex lg:justify-between lg:gap-0">
          {conditions.map((c, i) => (
            <li
              key={c.title}
              data-reveal="up"
              className={`group mx-auto lg:mx-0 h-[280px] w-full max-w-[190px] overflow-hidden rounded-[15px] border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-[0_10px_25px_rgba(11,147,136,0.18)] ${i === 0 ? "border-brand" : "border-transparent"}`}
            >
              <div className="h-[130px] w-full overflow-hidden rounded-t-[15px]">
                <Image src={`/images/cond${i + 1}.webp`} alt={c.title} width={190} height={130} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="px-[10px] pt-[16px]">
                <h3 className="mx-auto flex min-h-[44px] max-w-[129px] items-start justify-center text-[14px] font-semibold leading-[22px] tracking-[0.1px] text-brand-2">{c.title}</h3>
                <p className="mt-[8px] text-[10px] leading-[15px] tracking-[0.1px]">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <a href="#contact" data-reveal="up" className="mt-[29px] inline-flex h-[40px] items-center rounded-[5px] bg-brand-2 px-[13px] text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg">
          Explore Dermatology Services
        </a>
      </div>
    </section>
  );
}
