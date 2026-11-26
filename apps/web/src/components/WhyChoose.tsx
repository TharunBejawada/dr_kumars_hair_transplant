import { whyChoose } from "@/lib/content";

export default function WhyChoose() {
  return (
    <section id="why-us" className="mx-auto max-w-[1440px] px-5 pt-[42px] text-center md:px-8 xl:px-[120px]">
      <h2 data-reveal="up" className="text-[22px] font-semibold uppercase leading-[34px] tracking-[0.3px] text-brand md:text-[26px]">Why choose us?</h2>
      <p data-reveal="up" className="mx-auto mt-[13px] max-w-[983px] text-[15px] leading-[25px] md:text-[16px]">
        At Dr. Kumar&apos;s Skin &amp; Hair Transplant Center, our approach combines medical knowledge, individual attention, and clear communication to support informed treatment decisions.
      </p>
      <ul data-stagger className="mt-[33px] grid gap-x-[33px] gap-y-[22px] text-left md:grid-cols-2 xl:w-[1209px]">
        {whyChoose.map((w) => (
          <li
            key={w.title}
            data-reveal="up"
            className="group h-auto rounded-[8px] border border-brand bg-white px-[40px] py-[25px] transition-all duration-300 hover:-translate-y-1 hover:border-brand-3 hover:bg-brand-3 hover:text-white hover:shadow-[0_10px_25px_rgba(11,147,136,0.2)] md:h-[132px]"
          >
            <h3 className="text-[18px] font-semibold leading-[28px] text-brand transition-colors duration-300 group-hover:text-white">{w.title}</h3>
            <p className="mt-[3px] max-w-[492px] text-[16px] leading-[25px] transition-colors duration-300 group-hover:text-white">{w.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
