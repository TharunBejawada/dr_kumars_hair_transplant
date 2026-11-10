"use client";

import Image from "next/image";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { appointmentFormSchema } from "@drkumar/shared";
import { clinic } from "@/lib/content";

type Status = "idle" | "sending" | "done" | "error";
const field =
  "h-[38px] w-full rounded-[7px] border border-ink bg-white px-[20px] text-[12px] outline-none transition-shadow placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]";

export default function Appointment({ gapAbove = 31, gapBelow = 23 }: { gapAbove?: number; gapBelow?: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = appointmentFormSchema.safeParse(raw);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[String(i.path[0])] ??= i.message));
      setErrors(map);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, source: "home" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please call us instead.");
      setStatus("done");
      form.reset();
    } catch (err) {
      setServerMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const err = (k: string) => errors[k] && <span role="alert" className="mt-1 block text-[11px] text-red-600">{errors[k]}</span>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section id="contact" style={{ marginTop: gapAbove, marginBottom: gapBelow }} className="bg-mint-2 pb-[37px] pt-[27px]">
      <div className="mx-auto grid max-w-[1440px] gap-[9px] px-5 md:px-8 lg:grid-cols-2 xl:pl-[134px] xl:pr-[101px]">
        <div data-reveal="left" className="rounded-[16px] bg-white px-[25px] py-[33px] lg:h-[438px]">
          <p className="text-[14px] font-medium uppercase leading-[21px] tracking-[3.2px] text-brand-2 md:text-[16px]">Book an Appointment</p>
          <h2 className="mt-[4px] text-[24px] font-semibold leading-[41px] md:text-[26px]">Consult Our Hair &amp; Skin Experts</h2>
          <p className="mt-[2px] text-[15px] leading-[25px] md:text-[16px]">Get personalised care for your skin, hair, and aesthetic concerns.</p>

          <form onSubmit={onSubmit} noValidate className="mt-[22px]">
            {/* honeypot – hidden from people, bots fill it */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-0 opacity-0" />
            <div className="grid gap-x-[29px] gap-y-[21px] sm:grid-cols-2">
              <label><span className="sr-only">Your name</span><input name="name" placeholder="Your Name*" autoComplete="name" className={field} aria-invalid={!!errors.name} />{err("name")}</label>
              <label><span className="sr-only">Your email</span><input name="email" type="email" placeholder="Your Email*" autoComplete="email" className={field} aria-invalid={!!errors.email} />{err("email")}</label>
              <label><span className="sr-only">Phone number</span><input name="phone" type="tel" placeholder="Phone Number*" autoComplete="tel" className={field} aria-invalid={!!errors.phone} />{err("phone")}</label>
              <label><span className="sr-only">Preferred date</span><input name="preferredDate" type="text" min={today} placeholder="Preferred Date*" aria-label="Preferred Date" className={field} aria-invalid={!!errors.preferredDate} onFocus={(e) => { e.currentTarget.type = "date"; try { e.currentTarget.showPicker?.(); } catch {} }} onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }} />{err("preferredDate")}</label>
            </div>
            <label className="mt-[18px] block"><span className="sr-only">Your message</span>
              <textarea name="message" placeholder="Your Message (Optional)" className="h-[80px] w-full resize-none rounded-[7px] border border-ink bg-white px-[20px] py-[9px] text-[12px] outline-none transition-shadow placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]" />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="group mt-[15px] flex h-[48px] w-full items-center justify-center gap-[9px] rounded-[7px] bg-brand text-[18px] font-semibold text-white transition-all duration-300 hover:bg-brand-2 hover:shadow-lg disabled:opacity-70"
            >
              {status === "sending" ? "Sending…" : "Book an Appointment"}
              <FaArrowRight className="size-[20px] transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
            <div aria-live="polite" className="mt-2 min-h-[18px] text-[13px]">
              {status === "done" && <p className="text-brand">Thank you! We have received your request and will call you shortly.</p>}
              {status === "error" && <p className="text-red-600">{serverMsg}</p>}
            </div>
          </form>
        </div>

        <a
          data-reveal="right"
          href={clinic.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Dr. Kumar's clinic location in Google Maps"
          className="block overflow-hidden rounded-[16px] border-4 border-white bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)] lg:h-[438px]"
        >
          <Image src="/images/map.webp" alt="Map showing Dr. Kumar's Skin & Hair Transplant Center, Kondapur, Hyderabad" width={598} height={438} className="h-full w-full object-cover" />
        </a>
      </div>
    </section>
  );
}
