"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

const REMEMBER_KEY = "dk_admin_remember_login";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (typeof data.email === "string" && data.email) {
          setEmail(data.email);
        }
        if (typeof data.password === "string" && data.password) {
          setPassword(data.password);
        }
        setRememberMe(true);
      }
    } catch {
      // LocalStorage might be disabled or parsing failed
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const trimmedEmail = email.trim();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password }),
    }).catch(() => null);

    if (res?.ok) {
      try {
        if (rememberMe) {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ email: trimmedEmail, password })
          );
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
        // Ignore storage write errors
      }
      router.replace("/admin");
      router.refresh();
      return;
    }

    const body = await res?.json().catch(() => ({}));
    setError(body?.error ?? "Could not sign in. Please try again.");
    setBusy(false);
  }

  const input =
    "mt-1 h-[44px] w-full rounded-lg border border-gray-300 px-3 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-[14px] font-medium text-gray-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className={input}
        />
      </label>

      <label className="block text-[14px] font-medium text-gray-700">
        Password
        <PasswordInput
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </label>

      <div className="flex items-center justify-between pt-0.5">
        <label className="inline-flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            name="remember"
            checked={rememberMe}
            onChange={(e) => {
              const checked = e.target.checked;
              setRememberMe(checked);
              if (!checked) {
                try {
                  localStorage.removeItem(REMEMBER_KEY);
                } catch {}
              }
            }}
            className="size-4 rounded border-gray-300 accent-brand focus:ring-brand/20 cursor-pointer"
          />
          <span className="text-[13.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Remember me
          </span>
        </label>
      </div>

      <p role="alert" aria-live="polite" className="min-h-[20px] text-[13px] text-red-600">
        {error}
      </p>

      <button
        type="submit"
        disabled={busy}
        className="h-[46px] w-full rounded-lg bg-brand text-[16px] font-semibold text-white transition hover:bg-brand-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
