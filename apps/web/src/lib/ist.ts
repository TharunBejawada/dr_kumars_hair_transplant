/** Scheduling is entered and shown in India Standard Time (UTC+05:30, no DST); stored as UTC ISO strings. */
const IST_OFFSET = "+05:30";

/** "2026-12-01T09:30" (IST wall time) -> "2026-12-01T04:00:00.000Z" */
export function istInputToIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00${IST_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO (UTC) -> "2026-12-01T09:30" in IST, for <input type="datetime-local"> */
export function isoToIstInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000);
  return d.toISOString().slice(0, 16);
}

export function formatIst(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) + " IST";
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 150);
