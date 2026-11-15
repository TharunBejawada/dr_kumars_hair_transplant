"use client";

import { useState } from "react";
import { FaCircleCheck, FaSpinner } from "react-icons/fa6";

interface Props {
  treatmentTitle: string;
}

export default function TreatmentStickyForm({ treatmentTitle }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: `Enquiry from treatment page: ${treatmentTitle}`,
          source: "home",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not submit appointment. Please call us.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[24px] bg-[#006256] p-6 sm:p-7 shadow-xl border border-teal-700/50 text-white">
      <h3 className="text-center text-[22px] sm:text-[24px] font-bold text-white mb-5 tracking-tight">
        Book An Appointment
      </h3>

      {success ? (
        <div className="rounded-xl bg-white/10 p-5 text-center space-y-2 border border-white/20">
          <FaCircleCheck className="mx-auto size-10 text-[#1ecdbd]" />
          <h4 className="text-[16px] font-bold text-white">Request Received!</h4>
          <p className="text-[13px] text-teal-100 leading-relaxed">
            Thank you for reaching out. Dr. Kumar's team will contact you shortly to confirm your consultation.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-2 text-[12px] text-teal-200 underline hover:text-white"
          >
            Submit another query
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/20 border border-red-400/40 px-3.5 py-2 text-[12px] text-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="sticky-name" className="sr-only">
              Your Name*
            </label>
            <input
              id="sticky-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name*"
              required
              className="h-[46px] w-full rounded-md bg-[#e6f4f2] px-4 text-[14px] font-medium text-gray-800 placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-[#1ecdbd]"
            />
          </div>

          <div>
            <label htmlFor="sticky-email" className="sr-only">
              Your Email*
            </label>
            <input
              id="sticky-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email*"
              required
              className="h-[46px] w-full rounded-md bg-[#e6f4f2] px-4 text-[14px] font-medium text-gray-800 placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-[#1ecdbd]"
            />
          </div>

          <div>
            <label htmlFor="sticky-phone" className="sr-only">
              Phone*
            </label>
            <input
              id="sticky-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone*"
              required
              className="h-[46px] w-full rounded-md bg-[#e6f4f2] px-4 text-[14px] font-medium text-gray-800 placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-[#1ecdbd]"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-[46px] w-full items-center justify-center rounded-xl bg-[#1ecdbd] text-[16px] font-bold text-white shadow-md transition-all duration-200 hover:bg-[#19bba9] hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin size-4" />
                  <span>Sending...</span>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
