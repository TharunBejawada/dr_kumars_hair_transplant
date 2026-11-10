import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import Appointment from "@/components/Appointment";
import { clinic } from "@/lib/content";
import { siteUrl } from "@/lib/blog-utils";

export const metadata: Metadata = {
  title: "About Us | Dr. Kumar's Skin & Hair Transplant Centre, Kondapur",
  description:
    "Meet Dr. Ashok Kumar, an experienced dermatologist and hair transplant specialist in Kondapur, Hyderabad. Personalised dermatology, hair restoration and aesthetic care.",
  alternates: { canonical: `${siteUrl}/about` },
};

const stats = [
  { img: "/images/about/stat-1.webp", text: "13+ Years\nof Experience", w: 128 },
  { img: "/images/about/stat-2.webp", text: "Personalised Care", w: 128 },
  { img: "/images/about/stat-3.webp", text: "Advanced Treatment Options", w: 178 },
];

const steps = [
  { n: "01", img: "/images/about/step-1.webp", w: 107, title: "Listen & understand", text: "Discuss your concerns, medical history, and treatment expectations." },
  { n: "02", img: "/images/about/step-2.webp", w: 99, title: "Evaluate & diagnose", text: "Assess your condition and identify whether further investigations are needed." },
  { n: "03", img: "/images/about/step-3.webp", w: 99, title: "Plan your treatment", text: "Explore suitable treatments, expected benefits, and precautions." },
  { n: "04", img: "/images/about/step-4.webp", w: 99, title: "Support your recovery", text: "Receive aftercare guidance and follow-up recommendations." },
];

const pad = "mx-auto w-full max-w-[1440px] px-5 md:px-8 xl:pl-[124px] xl:pr-[110px]";
const btn = "inline-flex items-center rounded-[5px] bg-brand-2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg";

export default function AboutPage() {
  return (
    <PublicShell>
      {/* Banner */}
      <section className="relative mt-[19px] overflow-hidden bg-[#fefaf3] lg:h-[458px]">
        <Image src="/images/about/banner.webp" alt="" fill priority sizes="100vw" className="object-cover object-[75%_center]" aria-hidden />
        <div className={`${pad} relative flex h-full flex-col justify-center py-10 lg:block lg:py-0`}>
          <h1 className="max-w-[445px] text-[30px] font-semibold leading-[40px] tracking-[0.4px] text-brand-2 md:text-[38px] md:leading-[54px] lg:absolute lg:left-[124px] lg:top-[82px]">
            Expert Dermatology &amp; Hair Restoration Care You Can Trust
          </h1>
          <ul data-stagger className="mt-8 flex flex-wrap gap-x-10 gap-y-5 lg:absolute lg:left-[124px] lg:top-[270px] lg:mt-0 lg:gap-x-0">
            {stats.map((s) => (
              <li key={s.text} data-reveal="up" className="flex items-center gap-[10px] lg:w-[219px]">
                <Image src={s.img} alt="" width={64} height={67} className="h-auto w-[56px] md:w-[64px]" aria-hidden />
                <span className="whitespace-pre-line text-[16px] font-medium leading-[23px] md:text-[18px]" style={{ maxWidth: s.w }}>{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Doctor */}
      <section id="doctor" className="mx-auto max-w-[1440px] px-5 pt-12 md:px-8 lg:pt-[50px] xl:px-0">
        <div className="relative flex flex-col gap-8 lg:block lg:min-h-[730px]">
          <div data-reveal="left" className="overflow-hidden rounded-[14px] lg:absolute lg:left-[105px] lg:top-[83px] lg:h-[647px] lg:w-[521px]">
            <Image src="/images/doctor.webp" alt="Dr. Ashok Kumar, dermatologist and hair transplant specialist" width={521} height={647} sizes="(min-width:1024px) 521px, 100vw" className="h-full w-full object-cover" />
          </div>
          <div data-stagger className="lg:ml-[643px] lg:w-[686px]">
            <p data-reveal="up" className="text-[15px] font-medium leading-[23px] tracking-[2.3px] text-brand-2 md:text-[18px]">Meet Dr. Ashok Kumar</p>
            <h2 data-reveal="up" className="mt-[9px] text-[24px] font-semibold leading-[34px] tracking-[0.3px] md:text-[32px] md:leading-[50px]">Experienced Dermatologist &amp; Hair Transplant Specialist in Hyderabad</h2>
            <div data-reveal="up" className="mt-[13px] rounded-[10px] bg-[#eefffe] px-[30px] py-[18px] lg:w-[526px]">
              <p className="text-[30px] font-bold leading-[49px] tracking-[0.4px] md:text-[38px]">Dr. Ashok Kumar</p>
              <p className="text-[16px] font-semibold leading-[27px] text-brand md:text-[21px]">Dermatologist | Hair Transplant Specialist</p>
            </div>
            <div className="mt-[17px] space-y-[10px] text-[16px] leading-[25px]">
              <p data-reveal="up">With over 13 years of experience in dermatology and hair restoration, Dr. Ashok Kumar is dedicated to helping patients manage skin conditions, address hair loss, and explore suitable aesthetic treatments.</p>
              <p data-reveal="up">His clinical expertise covers the diagnosis and management of various skin and scalp conditions, medical hair loss treatments, hair transplantation, and cosmetic dermatology procedures.</p>
              <p data-reveal="up">Dr. Ashok Kumar specialises in hair transplantation techniques, including Follicular Unit Extraction (FUE) and Direct Hair Implantation (DHI), along with non-surgical hair restoration procedures such as PRP and GFC therapy.</p>
              <p data-reveal="up">Beyond hair restoration, he provides dermatological care for acne, pigmentation, eczema, psoriasis, skin infections, and other common skin conditions. He also offers cosmetic dermatology procedures and confidential consultations for sexually transmitted infections (STIs). His treatment philosophy centres on accurate diagnosis, ethical medical practice, patient safety, and personalised care.</p>
            </div>
            <Link href="/#contact" data-reveal="up" className={`${btn} mt-[19px] h-[57px] gap-[10px] px-[31px] text-[18px] font-semibold md:text-[21px]`}>
              <Image src="/images/about/icon-calendar.webp" alt="" width={47} height={45} className="h-auto w-[40px] md:w-[47px]" aria-hidden />
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* About the clinic */}
      <section id="clinic" className="mt-12 bg-[#eefffe] py-12 lg:mt-[55px] lg:h-[630px] lg:py-0">
        <div className={`${pad} flex flex-col gap-10 lg:relative lg:block lg:h-full`}>
          <div data-stagger className="lg:absolute lg:left-[124px] lg:top-[35px] lg:w-[686px]">
            <p data-reveal="up" className="text-[15px] font-medium leading-[23px] tracking-[2.3px] text-brand-2 md:text-[18px]">About</p>
            <h2 data-reveal="up" className="mt-[7px] text-[28px] font-bold leading-[40px] tracking-[0.4px] md:text-[38px] md:leading-[51px]">Dr. Kumar&apos;s Skin &amp; Hair Transplant&nbsp;Centre</h2>
            <p data-reveal="up" className="mt-[13px] text-[17px] font-semibold leading-[31px] text-brand md:text-[21px]">Dedicated to Healthier Skin, Stronger Hair &amp; Better Confidence</p>
            <div className="mt-[17px] space-y-[14px] text-[16px] leading-[25px]">
              <p data-reveal="up">At&nbsp;Dr. Kumar&apos;s Skin &amp; Hair Transplant&nbsp;Centre, we believe that every skin and hair concern deserves individual attention and appropriate medical care.</p>
              <p data-reveal="up">Located in&nbsp;Kondapur, Hyderabad, our clinic offers comprehensive dermatology, hair restoration, and aesthetic treatments in a comfortable and patient-friendly environment.</p>
              <p data-reveal="up">Under the guidance of&nbsp;Dr. Ashok Kumar, we provide&nbsp;services including surgical and non-surgical hair restoration, medical dermatology, laser treatments, cosmetic procedures, and confidential STI consultations.</p>
              <p data-reveal="up">We focus on understanding each patient&apos;s concerns, explaining treatment options clearly, and developing individualised care plans.</p>
            </div>
          </div>
          <div data-stagger className="grid grid-cols-2 gap-[16px] lg:absolute lg:left-[826px] lg:top-[66px] lg:w-[504px] lg:gap-[16px]">
            <div data-reveal="scale" className="col-span-2 overflow-hidden rounded-[8px]"><Image src="/images/about/collage-1.webp" alt="Reception and waiting area at Dr. Kumar's clinic" width={504} height={249} className="h-auto w-full transition-transform duration-500 hover:scale-105" /></div>
            <div data-reveal="scale" className="overflow-hidden rounded-[8px]"><Image src="/images/about/collage-2.webp" alt="Clinic reception desk" width={245} height={249} className="h-auto w-full transition-transform duration-500 hover:scale-105" /></div>
            <div data-reveal="scale" className="overflow-hidden rounded-[8px]"><Image src="/images/about/collage-3.webp" alt="Patient seating area" width={245} height={249} className="h-auto w-full transition-transform duration-500 hover:scale-105" /></div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="mx-auto max-w-[1440px] px-5 pt-12 md:px-8 lg:pt-[46px] xl:px-[117px]">
        <h2 data-reveal="up" className="text-center text-[22px] font-semibold leading-[34px] tracking-[0.3px] text-brand md:text-[26px]">Our Approach to Patient Care</h2>
        <ul data-stagger className="mt-[39px] grid gap-[28px] sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} data-reveal="up" className="group relative mx-auto h-[281px] w-full max-w-[280px] rounded-[8px] bg-white shadow-[0_1px_4px_rgba(3,132,122,0.48)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(11,147,136,0.3)]">
              <span className="absolute left-[37px] top-[32px] size-[100px] rounded-full bg-[#e1f7f5] transition-transform duration-300 group-hover:scale-105" />
              <Image src={s.img} alt="" width={s.w} height={135} className="absolute left-[30px] top-[14px] h-[135px] w-auto transition-transform duration-300 group-hover:scale-105" aria-hidden />
              <span className="absolute right-[26px] top-[45px] text-[46px] font-bold leading-[62px] tracking-[0.5px] text-[#6cc9c1]/50">{s.n}</span>
              <h3 className="absolute left-[28px] right-[20px] top-[150px] text-[16px] font-semibold leading-[24px] text-brand">{s.title}</h3>
              <p className="absolute left-[28px] top-[182px] w-[221px] text-[14px] leading-[21px] tracking-[0.1px]">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="relative mt-[44px] overflow-hidden bg-brand-2 lg:h-[517px]">
        <Image src="/images/about/girl.webp" alt="" fill sizes="100vw" className="hidden object-cover object-right-bottom lg:block" aria-hidden />
        <div className={`${pad} relative py-12 text-white lg:py-0`}>
          <div data-stagger className="lg:absolute lg:left-[124px] lg:top-[69px] lg:w-[671px]">
            <h2 data-reveal="up" className="text-[28px] font-semibold leading-[40px] tracking-[0.4px] md:text-[38px] md:leading-[58px]">Your Journey Towards Healthier Skin &amp; Hair Starts Here</h2>
            <p data-reveal="up" className="mt-[17px] text-[16px] leading-[29px] md:text-[18px]">Whether you need treatment for hair loss, support for a skin condition, or advice about an aesthetic procedure, our team is here to help you make informed decisions about your care.</p>
            <p data-reveal="up" className="mt-[18px] text-[17px] font-semibold leading-[33px] md:text-[21px]">Book a consultation with Dr. Ashok Kumar at Dr. Kumar&apos;s Skin &amp; Hair Transplant Center, Kondapur, Hyderabad.</p>
            <div data-reveal="up" className="mt-[9px] flex flex-wrap gap-[24px]">
              <Link href="/#contact" className="inline-flex h-[61px] items-center gap-[10px] rounded-[6px] border border-white bg-white px-[14px] pr-[18px] text-[18px] font-semibold text-brand shadow-[0_4px_4px_#0b9388] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.25)] md:text-[21px]">
                <Image src="/images/about/icon-calendar.webp" alt="" width={47} height={45} className="h-auto w-[40px] md:w-[47px]" aria-hidden />Book Your Consultation
              </Link>
              <a href={clinic.phoneHref} className="inline-flex h-[61px] items-center gap-[10px] rounded-[6px] bg-[#0eac9f] px-[14px] pr-[18px] text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:shadow-[0_8px_16px_rgba(0,0,0,0.25)] md:text-[21px]">
                <Image src="/images/about/icon-phone.webp" alt="" width={49} height={47} className="h-auto w-[40px] md:w-[49px]" aria-hidden />{clinic.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Appointment gapAbove={34} gapBelow={41} />
    </PublicShell>
  );
}
