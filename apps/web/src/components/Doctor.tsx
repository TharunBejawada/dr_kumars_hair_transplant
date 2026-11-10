import Image from "next/image";

export default function Doctor() {
  return (
    <section id="doctor" className="mx-auto max-w-[1440px] px-5 pt-14 md:px-8 lg:pt-[54px] xl:px-[110px]">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-[52px]">
        <div data-reveal="left" className="shrink-0 overflow-hidden lg:w-[489px]">
          <Image src="/images/doctor.webp" alt="Dr. Ashok Kumar examining a patient's scalp" width={489} height={452} sizes="(min-width:1024px) 489px, 100vw" className="h-auto w-full" />
        </div>
        <div data-stagger className="flex-1">
          <p data-reveal="up" className="text-[15px] font-medium uppercase leading-[23px] tracking-[2.3px] text-brand-2 md:text-[18px]">Meet our dermatologist</p>
          <h2 data-reveal="up" className="mt-[11px] text-[30px] font-bold leading-[49px] tracking-[0.4px] text-[#010101] md:text-[38px]">Dr. Ashok Kumar</h2>
          <p data-reveal="up" className="mt-[11px] text-[17px] font-semibold leading-[27px] text-[#010101] md:text-[21px]">
            MBBS, DDVL | Dermatologist &amp; Hair Transplant Specialist
          </p>
          <p data-reveal="up" className="mt-[15px] flex h-[47px] items-baseline gap-2 font-semibold text-brand">
            <span data-count="13" data-suffix="+" className="text-[34px] leading-[47px] md:text-[40px]">13+</span>
            <span className="text-[17px] md:text-[21px]">Years of Experience</span>
          </p>
          <div className="mt-[16px] space-y-[10px] text-[16px] leading-[25px]">
            <p data-reveal="up">Dr. Ashok Kumar is a dermatologist and hair transplant specialist with over 13 years of experience in managing skin and hair concerns.</p>
            <p data-reveal="up">His areas of practice include hair transplantation, hair loss management, clinical dermatology, and aesthetic treatments.</p>
            <p data-reveal="up">He believes that every patient deserves individual attention and a clear understanding of their treatment options. His approach focuses on detailed consultations, appropriate procedures, and personalised guidance.</p>
          </div>
          <a href="#contact" data-reveal="up" className="mt-[16px] inline-flex h-[40px] items-center rounded-[5px] bg-brand-2 px-[24.5px] text-[16px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg md:text-[18px]">
            Know More About Dr. Ashok Kumar
          </a>
        </div>
      </div>
    </section>
  );
}
