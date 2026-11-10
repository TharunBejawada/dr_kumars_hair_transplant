"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const body = await res?.json().catch(() => ({}));
    setError(body?.error ?? "Could not sign in. Please try again.");
    setBusy(false);
  }

  const input = "mt-1 h-[44px] w-full rounded-lg border border-gray-300 px-3 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-[14px] font-medium">Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="block text-[14px] font-medium">Password
        <PasswordInput name="password" required autoComplete="current-password" />
      </label>
      <p role="alert" aria-live="polite" className="min-h-[20px] text-[13px] text-red-600">{error}</p>
      <button disabled={busy} className="h-[46px] w-full rounded-lg bg-brand text-[16px] font-semibold text-white transition hover:bg-brand-2 disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
