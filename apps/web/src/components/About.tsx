import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-[1440px] px-5 pt-14 md:px-8 lg:pt-[116px] xl:px-[110px]">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-[41px]">
        <div data-reveal="left" className="shrink-0 lg:w-[433px]">
          <Image src="/images/intro.webp" alt="Patient receiving a scalp treatment at Dr. Kumar's clinic" width={433} height={365} sizes="(min-width:1024px) 433px, 100vw" className="h-auto w-full" />
        </div>
        <div data-stagger className="flex-1 lg:pt-0">
          <h2 data-reveal="up" className="text-[22px] font-semibold leading-[34px] tracking-[0.3px] text-brand-2 md:text-[26px]">
            Expert Skin &amp; Hair Care in Kondapur, Hyderabad
          </h2>
          <div className="mt-[22px] max-w-[723px] space-y-[14px] text-[16px] leading-[28px] md:text-[18px]">
            <p data-reveal="up">At Dr. Kumar&apos;s Skin &amp; Hair Transplant Center, we believe that healthy skin and hair begin with understanding your individual needs. Our clinic provides dermatology, hair restoration, and aesthetic treatments tailored to different concerns.</p>
            <p data-reveal="up">Led by Dr. Ashok Kumar, our team offers care for hair loss, skin conditions, pigmentation concerns, and cosmetic improvements. From medical consultations and non-surgical therapies to hair transplantation and aesthetic procedures, every treatment plan begins with a careful assessment.</p>
            <p data-reveal="up">Our goal is to provide personalised care, clear treatment guidance, and a comfortable consultation experience.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
