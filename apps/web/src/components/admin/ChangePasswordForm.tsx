"use client";

import { useState } from "react";
import { passwordRules } from "@drkumar/shared";
import PasswordInput from "./PasswordInput";
import { useToast } from "./Toast";

export default function ChangePasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const rulesOk = passwordRules.every((r) => r.test(next));
  const matches = next.length > 0 && next === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) return setErrors({ confirm: "Passwords don't match" });
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/admin/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) {
      toast("Password updated. Other devices have been signed out.");
      setCurrent(""); setNext(""); setConfirm("");
      return;
    }
    const issues = (data?.issues ?? {}) as Record<string, string[]>;
    if (issues.currentPassword || issues.newPassword) {
      setErrors({ current: issues.currentPassword?.[0] ?? "", next: issues.newPassword?.[0] ?? "" });
    } else toast(data?.error ?? "Could not update password", "error");
  }

  const lab = "block text-[14px] font-medium";
  const err = (m?: string) => m && <p role="alert" className="mt-1 text-[13px] text-red-600">{m}</p>;
  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-[460px] space-y-5 rounded-xl bg-white p-6 shadow-sm">
      <label className={lab}>Current password
        <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" invalid={!!errors.current} />
        {err(errors.current)}
      </label>
      <label className={lab}>New password
        <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" invalid={!!errors.next} />
        {err(errors.next)}
      </label>
      <ul className="grid gap-1 text-[13px]" aria-label="Password requirements">
        {passwordRules.map((r) => {
          const ok = r.test(next);
          return <li key={r.id} className={ok ? "text-green-700" : "text-gray-500"}>{ok ? "✓" : "○"} {r.label}</li>;
        })}
      </ul>
      <label className={lab}>Confirm new password
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" invalid={!!errors.confirm} />
        {err(errors.confirm)}
        {confirm && !errors.confirm && <p className={`mt-1 text-[13px] ${matches ? "text-green-700" : "text-gray-500"}`}>{matches ? "✓ Passwords match" : "Passwords don't match yet"}</p>}
      </label>
      <button disabled={busy || !current || !rulesOk || !matches} className="h-[46px] w-full rounded-lg bg-brand text-[16px] font-semibold text-white transition hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
