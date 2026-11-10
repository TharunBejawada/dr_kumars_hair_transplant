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
  { left: 36, width: 78, text: "Hair Loss &\nThinning" },
  { left: 158, width: 95, text: "Acne & Skin\nProblems" },
  { left: 298, width: 95, text: "Pigmentation\n& Dark Spots" },
  { left: 414, width: 124, text: "Anti-Ageing\n& Aesthetic Care" },
];
const trust = ["Consult an Experienced Dermatologist", "Convenient Appointment Scheduling", "Your Information is Confidential"];

const box = "h-[38px] w-full rounded-[7px] border border-[#747474] bg-white px-[20px] text-[12px] outline-none transition-shadow placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]";

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
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-brand-light/50 p-4 backdrop-blur-[1px] md:items-center" onClick={dismiss} style={{ animation: "popup-fade .35s ease-out" }}>
      <div role="dialog" aria-modal="true" aria-label="Book your consultation" onClick={(e) => e.stopPropagation()}
        className="relative my-6 w-full max-w-[1180px] rounded-[16px] bg-[#fafdff] shadow-[0_20px_60px_rgba(0,0,0,0.25)] lg:h-[864px]" style={{ animation: "popup-pop .45s cubic-bezier(.2,.9,.3,1.2)" }}>
        <button ref={closeBtn} onClick={dismiss} aria-label="Close" className="absolute -top-3 right-2 z-20 flex size-[43px] items-center justify-center rounded-full bg-brand text-white shadow-md transition hover:scale-110 hover:bg-brand-2 lg:-right-[3px] lg:top-[-7px]">
          <FaXmark className="size-[18px]" />
        </button>

        {/* Left: image with headline (desktop only) */}
        <div className="absolute inset-y-0 left-0 hidden w-[553px] overflow-hidden rounded-l-[16px] lg:block">
          <Image src="/images/about/popup-image.webp" alt="" fill sizes="553px" className="object-cover object-top" aria-hidden />
          <div className="absolute left-[50px] top-[37px] w-[480px]">
            <p className="text-[16px] font-medium uppercase tracking-[2px] text-brand">Book an appointment</p>
            <h2 id="consult-title" className="mt-[6px] text-[38px] font-bold leading-[48px] text-[#010101]">Hair &amp; Skin<br />Problem Specialist</h2>
            <p className="mt-[8px] text-[16px] leading-[24px] text-[#3a4c4a]">Get expert care for your hair, skin and aesthetic concerns<br />from an experienced dermatologist.</p>
          </div>
          {labelPos.map((l) => (
            <p key={l.text} className="absolute top-[765px] whitespace-pre-line text-center text-[12px] font-medium leading-[17px]" style={{ left: l.left, width: l.width }}>{l.text}</p>
          ))}
        </div>

        {/* Right: form */}
        <div className="relative px-6 py-10 lg:absolute lg:left-[630px] lg:top-[44px] lg:w-[472px] lg:p-0">
          <h2 className="text-[26px] font-bold leading-[34px] text-[#010101] lg:hidden" id="consult-title-m">Book Your Consultation</h2>
          <h3 className="hidden text-[34px] font-bold leading-[43px] text-[#010101] lg:block">Book Your Consultation</h3>
          <p className="mt-2 text-[16px] leading-[24px] text-[#3e3e3e] lg:mt-[9px]">Fill in your details and our team will contact you to confirm your appointment.</p>

          {status === "done" ? (
            <div className="mt-10 rounded-[10px] bg-brand/10 p-6 text-center" role="status">
              <p className="text-[20px] font-semibold text-brand">Thank you!</p>
              <p className="mt-2 text-[15px]">We&apos;ve received your request and our team will call you shortly to confirm your appointment.</p>
              <button onClick={() => setOpen(false)} className="mt-5 h-[40px] rounded-[5px] bg-brand-2 px-7 text-[16px] font-semibold text-white hover:bg-brand">Close</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 lg:mt-[24px]">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-0 opacity-0" />
              <div className="space-y-[21px]">
                <label className="block"><span className="sr-only">Your name</span><input name="name" placeholder="Your Name" autoComplete="name" className={box} aria-invalid={!!errors.name} />{err("name")}</label>
                <label className="block"><span className="sr-only">Phone number</span><input name="phone" type="tel" placeholder="Phone Number" autoComplete="tel" className={box} aria-invalid={!!errors.phone} />{err("phone")}</label>
                <label className="block"><span className="sr-only">Email address</span><input name="email" type="email" placeholder="Email Address" autoComplete="email" className={box} aria-invalid={!!errors.email} />{err("email")}</label>
                <label className="relative block"><span className="sr-only">Your concern</span>
                  <select name="concern" defaultValue="" className={`${box} appearance-none pr-10`} aria-invalid={!!errors.concern}>
                    <option value="" disabled>Select Your Concern*</option>
                    {appointmentConcerns.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg aria-hidden className="pointer-events-none absolute right-4 top-[15px] h-2 w-3" viewBox="0 0 12 8" fill="none" stroke="#100000" strokeWidth="2"><path d="M1 1l5 5 5-5" /></svg>{err("concern")}</label>
                <label className="block"><span className="sr-only">Preferred appointment date</span>
                  <input name="preferredDate" type="text" min={today} placeholder="Preferred Appointment Date" aria-label="Preferred Appointment Date" className={box}
                    onFocus={(e) => { e.currentTarget.type = "date"; try { e.currentTarget.showPicker?.(); } catch { /* unsupported */ } }} onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }} />{err("preferredDate")}</label>
                <label className="block"><span className="sr-only">Your message</span>
                  <textarea name="message" placeholder="Your Message (Optional)" className="h-[80px] w-full resize-none rounded-[7px] border border-[#747474] bg-white px-[20px] py-[9px] text-[12px] outline-none placeholder:text-ink focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)]" /></label>
              </div>
              <button type="submit" disabled={status === "sending"} className="group mt-[19px] flex h-[59px] w-full items-center justify-center gap-[10px] rounded-[30px] bg-brand text-[18px] font-semibold text-white transition-all duration-300 hover:bg-brand-2 hover:shadow-lg disabled:opacity-70">
                {status === "sending" ? "Sending…" : "Book My Consultation"}
                <FaArrowRight className="size-[20px] transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
              <p className="mt-[10px] text-center text-[14px]">Our team will contact you to confirm your appointment.</p>
              <div aria-live="polite" className="min-h-[18px] text-center text-[13px] text-red-600">{status === "error" && serverMsg}</div>
            </form>
          )}

          <ul className="mt-6 flex justify-between gap-2 lg:absolute lg:left-[19px] lg:top-[636px] lg:mt-0 lg:w-[434px]">
            {trust.map((t, i) => (
              <li key={t} className="flex w-[30%] flex-col items-center text-center text-[12px] font-medium leading-[17px] lg:w-[125px]">
                <Image src={`/images/about/popup-icon-${i + 1}.webp`} alt="" width={75} height={80} className="h-auto w-[56px] lg:w-[75px]" aria-hidden />
                <span className="mt-2 lg:mt-[4px]">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
