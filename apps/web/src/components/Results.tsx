import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";
import { results } from "@/lib/content";

export default function Results() {
  return (
    <section id="results" className="pt-[56px]">
      <div className="mx-auto max-w-[1440px] px-5 text-center md:px-8">
        <h2 data-reveal="scale" className="mx-auto flex h-[48px] w-[351px] max-w-full items-center justify-center rounded-[8px] bg-brand-2 text-[20px] font-semibold uppercase text-white md:text-[24px]">Before &amp; After Results</h2>
        <p data-reveal="up" className="mt-[24px] text-[16px] font-semibold uppercase leading-[28px] tracking-[2px] text-[#000b0a] md:text-[18px]">Real Patient Journeys</p>
        <h3 data-reveal="up" className="mt-[11px] text-[18px] font-semibold leading-[27px] text-brand md:text-[21px]">Explore Our Patient Treatment Results</h3>
        <p data-reveal="up" className="mx-auto mt-[11px] max-w-[983px] text-[15px] leading-[25px] md:text-[16px]">
          Every patient&apos;s skin and hair concerns are different. Explore authentic before-and-after photographs from selected treatments performed at our clinic.
        </p>
      </div>
      <div className="mt-[16px] bg-mint py-[18px] pb-[22px]">
        <div className="mx-auto max-w-[1440px] px-5 text-center md:px-8 xl:pl-[134px] xl:pr-[101px]">
          <ul data-stagger className="grid gap-5 md:grid-cols-3 md:gap-[17px]">
            {results.map((r) => (
              <li key={r.title} data-reveal="up" className="group mx-auto h-[231px] w-full max-w-[390px] rounded-[12px] bg-white p-[15px] pt-[22px] shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(11,147,136,0.25)]">
                <div className="flex justify-between gap-[10px]">
                  {r.images.map((src) => (
                    <Image key={src} src={src} alt={`${r.title} – before and after`} width={175} height={130} className="h-auto w-[calc(50%-5px)] transition-transform duration-500 group-hover:scale-[1.02]" />
                  ))}
                </div>
                <div className="mt-[27px] flex items-center justify-center gap-[6px]">
                  <span className="text-[18px] leading-[28px]">{r.title}</span>
                  <span className="flex size-[33px] items-center justify-center rounded-full border-2 border-white bg-brand-2 text-white transition-transform duration-300 group-hover:translate-x-1">
                    <FaArrowRight className="size-[13px]" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <a href="#contact" data-reveal="up" className="mt-[32px] xl:relative xl:-left-[17px] inline-flex h-[40px] w-[250px] items-center justify-center rounded-[5px] bg-brand-2 text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg">
            View Patient Results
          </a>
        </div>
      </div>
    </section>
  );
}
