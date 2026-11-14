"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowRight, FaXmark } from "react-icons/fa6";
import { appointmentConcerns, popupFormSchema } from "@drkumar/shared";
import { setScrollLocked } from "@/lib/scroll";

const KEY_DISMISSED = "dk_consult_popup_dismissed";
const KEY_START = "dk_consult_popup_start";
const DELAY_MS = 5000;

const read = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* private mode: popup may show again, acceptable */ } };

const labelPos = [
  { left: "13.5%", text: "Hair Loss &\nThinning" },
  { left: "36.8%", text: "Acne & Skin\nProblems" },
  { left: "61.4%", text: "Pigmentation\n& Dark Spots" },
  { left: "85.5%", text: "Anti-Ageing\n& Aesthetic Care" },
];

const trustBadges = [
  { icon: "/images/about/popup-icon-1.webp", title: "Consult an", subtitle: "Experienced Dermatologist" },
  { icon: "/images/about/popup-icon-2.webp", title: "Convenient", subtitle: "Appointment Scheduling" },
  { icon: "/images/about/popup-icon-3.webp", title: "Your Information Is", subtitle: "Confidential" },
];

const box = "h-[36px] sm:h-[38px] w-full rounded-[7px] border border-[#747474]/60 bg-white px-[16px] text-[12px] outline-none transition-shadow placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]";

/**
 * Appears DELAY_MS after the visitor lands on any public page (the timer survives page navigation).
 * Once closed (X, Esc, backdrop) or submitted it stays hidden for the whole browser-tab session.
 */
export default function ConsultationPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState("");
  const closeBtn = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    write(KEY_DISMISSED, "1");
    setOpen(false);
  }, []);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-consultation-popup", handleOpen);
    return () => window.removeEventListener("open-consultation-popup", handleOpen);
  }, []);

  useEffect(() => {
    if (read(KEY_DISMISSED)) return;
    const start = Number(read(KEY_START)) || Date.now();
    write(KEY_START, String(start));
    const t = setTimeout(() => setOpen(true), Math.max(0, DELAY_MS - (Date.now() - start)));
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); setScrollLocked(false); };
  }, [open, dismiss]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = popupFormSchema.safeParse({ ...raw, concern: raw.concern || undefined });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[String(i.path[0])] ??= i.message));
      return setErrors(map);
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, source: "popup" }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please call us instead.");
      write(KEY_DISMISSED, "1"); // they've booked – never show again this session
      setStatus("done");
    } catch (err) {
      setServerMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (!open) return null;
  const err = (k: string) => errors[k] && <span role="alert" className="mt-1 block text-[11px] text-red-600">{errors[k]}</span>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-black/60 p-3 sm:p-4 md:p-6 backdrop-blur-[2px] thin-scrollbar"
      onClick={dismiss}
      style={{ animation: "popup-fade .35s ease-out" }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-title"
          data-lenis-prevent
          onClick={(e) => e.stopPropagation()}
          className="relative my-auto flex w-full max-w-[960px] flex-col overflow-hidden rounded-[16px] bg-[#fafdff] shadow-[0_20px_60px_rgba(0,0,0,0.25)] lg:h-[min(630px,90vh)] lg:flex-row xl:max-w-[1000px]"
          style={{ animation: "popup-pop .45s cubic-bezier(.2,.9,.3,1.2)" }}
        >
          {/* Close button inside card */}
          <button
            ref={closeBtn}
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-3 top-3 z-30 flex size-[34px] sm:size-[38px] items-center justify-center rounded-full bg-brand text-white shadow-md transition hover:scale-105 hover:bg-brand-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <FaXmark className="size-[15px] sm:size-[16px]" />
          </button>

          {/* Left: image with headline (desktop only) */}
          <div
            className="relative hidden h-full shrink-0 overflow-hidden bg-[#eefffe] lg:block"
            style={{ aspectRatio: "554 / 865", width: "calc(min(630px, 90vh) * 554 / 865)" }}
          >
            <Image
              src="/images/about/popup-image.webp"
              alt=""
              fill
              sizes="420px"
              className="object-contain object-top"
              aria-hidden
              priority
            />

            {/* Top text */}
            <div className="relative z-10 px-5 pt-4 xl:px-6 xl:pt-5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[2px] text-brand xl:text-[12.5px]">
                Book an appointment
              </p>
              <h2 className="mt-0.5 text-[21px] font-bold leading-[27px] text-[#010101] xl:text-[24px] xl:leading-[31px]">
                Hair &amp; Skin<br />Problem Specialist
              </h2>
              <p className="mt-1 text-[11.5px] leading-[16px] text-[#3a4c4a] xl:text-[12px] xl:leading-[17px]">
                Get expert care for your hair, skin and aesthetic concerns from an experienced dermatologist.
              </p>
            </div>

            {/* Bottom 4 category labels positioned directly below the circles */}
            <div className="absolute inset-x-0 z-10" style={{ top: "calc(86.82% + 7px)" }}>
              {labelPos.map((l) => (
                <p
                  key={l.text}
                  className="absolute -translate-x-1/2 whitespace-pre text-center text-[10px] font-semibold leading-[13px] text-[#1c2d2a] xl:text-[10.5px] xl:leading-[13.5px]"
                  style={{ left: l.left }}
                >
                  {l.text}
                </p>
              ))}
            </div>
          </div>

          {/* Right: form & trust badges */}
          <div
            data-lenis-prevent
            className="relative flex flex-1 flex-col justify-between overflow-y-auto overscroll-auto px-5 py-5 sm:px-7 sm:py-5 lg:px-7 lg:py-5 xl:px-8 thin-scrollbar"
          >
            <div className="pr-10 sm:pr-12">
              <h2 className="text-[22px] sm:text-[24px] font-bold leading-tight text-[#010101]" id="consult-title">
                Book Your Consultation
              </h2>
              <p className="mt-1 text-[13px] sm:text-[13.5px] leading-relaxed text-[#3e3e3e]">
                Fill in your details and our team will contact you to confirm your appointment.
              </p>
            </div>

            {status === "done" ? (
              <div className="my-auto rounded-[10px] bg-brand/10 p-6 text-center" role="status">
                <p className="text-[20px] font-semibold text-brand">Thank you!</p>
                <p className="mt-2 text-[15px]">We&apos;ve received your request and our team will call you shortly to confirm your appointment.</p>
                <button onClick={() => setOpen(false)} className="mt-5 h-[40px] rounded-[5px] bg-brand-2 px-7 text-[16px] font-semibold text-white hover:bg-brand">Close</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-3 flex flex-1 flex-col justify-between">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-0 opacity-0" />
                <div className="space-y-2">
                  <label className="block">
                    <span className="sr-only">Your name</span>
                    <input name="name" placeholder="Your Name" autoComplete="name" className={box} aria-invalid={!!errors.name} />
                    {err("name")}
                  </label>
                  <label className="block">
                    <span className="sr-only">Phone number</span>
                    <input name="phone" type="tel" placeholder="Phone Number" autoComplete="tel" className={box} aria-invalid={!!errors.phone} />
                    {err("phone")}
                  </label>
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input name="email" type="email" placeholder="Email Address" autoComplete="email" className={box} aria-invalid={!!errors.email} />
                    {err("email")}
                  </label>
                  <label className="relative block">
                    <span className="sr-only">Your concern</span>
                    <select name="concern" defaultValue="" className={`${box} appearance-none pr-10`} aria-invalid={!!errors.concern}>
                      <option value="" disabled>Select Your Concern*</option>
                      {appointmentConcerns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <svg aria-hidden className="pointer-events-none absolute right-4 top-[13px] h-2 w-3" viewBox="0 0 12 8" fill="none" stroke="#100000" strokeWidth="2">
                      <path d="M1 1l5 5 5-5" />
                    </svg>
                    {err("concern")}
                  </label>
                  <label className="block">
                    <span className="sr-only">Preferred appointment date</span>
                    <input
                      name="preferredDate"
                      type="text"
                      min={today}
                      placeholder="Preferred Appointment Date"
                      aria-label="Preferred Appointment Date"
                      className={box}
                      onFocus={(e) => {
                        e.currentTarget.type = "date";
                        try { e.currentTarget.showPicker?.(); } catch { /* unsupported */ }
                      }}
                      onBlur={(e) => {
                        if (!e.currentTarget.value) e.currentTarget.type = "text";
                      }}
                    />
                    {err("preferredDate")}
                  </label>
                  <label className="block">
                    <span className="sr-only">Your message</span>
                    <textarea
                      name="message"
                      placeholder="Your Message (Optional)"
                      className="h-[50px] sm:h-[54px] w-full resize-none rounded-[7px] border border-[#747474]/60 bg-white px-[16px] py-[7px] text-[12px] outline-none placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]"
                    />
                  </label>
                </div>

                <div className="mt-2.5">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group flex h-[44px] sm:h-[46px] w-full items-center justify-center gap-2 rounded-[25px] bg-brand text-[15px] font-semibold text-white transition-all duration-300 hover:bg-brand-2 hover:shadow-lg disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending…" : "Book My Consultation"}
                    <FaArrowRight className="size-[15px] transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                  <p className="mt-1 text-center text-[12px] text-gray-500">
                    Our team will contact you to confirm your appointment.
                  </p>
                  <div aria-live="polite" className="min-h-[14px] text-center text-[12px] text-red-600">
                    {status === "error" && serverMsg}
                  </div>
                </div>
              </form>
            )}

            {/* Trust Badges */}
            <ul className="mt-2 flex justify-between gap-2 border-t border-gray-100 pt-2">
              {trustBadges.map((b) => (
                <li key={b.title} className="flex w-[31%] flex-col items-center text-center text-[#2c3e50]">
                  <Image src={b.icon} alt="" width={42} height={44} className="h-auto w-[36px] sm:w-[40px]" aria-hidden />
                  <span className="mt-1 text-[10px] font-medium leading-[13px] sm:text-[10.5px] sm:leading-[13.5px]">
                    {b.title}<br />{b.subtitle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
