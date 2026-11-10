import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="mt-[19px] overflow-hidden bg-brand">
      <div className="relative mx-auto flex min-h-[431px] max-w-[1440px] flex-col justify-center px-5 py-12 md:px-8 lg:block lg:py-0">
        <div data-hero-img className="pointer-events-none absolute bottom-0 left-0 hidden w-[630px] lg:block">
          <Image src="/images/hero.webp" alt="Doctor marking the hairline of a patient before a hair transplant procedure" width={630} height={420} priority sizes="630px" className="h-auto w-full" />
        </div>
        <div className="relative z-10 lg:absolute lg:left-[603px] lg:top-[88px] lg:w-[615px]">
          <h1 className="text-[34px] font-bold leading-[1.3] tracking-[0.5px] text-white md:text-[48px] md:leading-[62px]">
            <span className="block overflow-hidden"><span data-hero-line className="block">Healthier Skin.</span></span>
            <span className="block overflow-hidden"><span data-hero-line className="block">Fuller Hair.</span></span>
            <span className="block overflow-hidden"><span data-hero-line className="block">Greater Confidence.</span></span>
          </h1>
          <p data-hero-sub className="mt-[11px] max-w-[615px] text-[16px] font-medium leading-[28px] text-white md:text-[18px]">
            Experience personalised dermatology, advanced hair restoration, and aesthetic treatments.
          </p>
        </div>
      </div>
    </section>
  );
}
