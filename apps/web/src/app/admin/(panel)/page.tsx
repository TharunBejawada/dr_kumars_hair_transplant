import Link from "next/link";
import { blogDisplayState } from "@drkumar/shared";
import { listAppointments } from "@/lib/db/appointments";
import { listBlogs } from "@/lib/db/blogs";
import { formatIst } from "@/lib/ist";

export const dynamic = "force-dynamic";

function Stat({ label, value, href, tone = "text-brand" }: { label: string; value: number; href: string; tone?: string }) {
  return (
    <Link href={href} className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[13px] font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-[32px] font-bold ${tone}`}>{value}</p>
    </Link>
  );
}

export default async function Dashboard() {
  const [appts, blogs] = await Promise.all([listAppointments(), listBlogs()]);
  const now = new Date();
  const states = blogs.map((b) => blogDisplayState(b, now));
  const upcoming = blogs
    .filter((b, i) => states[i] === "scheduled")
    .sort((a, b) => (a.publishAt ?? "").localeCompare(b.publishAt ?? ""))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/blogs/new" className="rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-2">+ New blog</Link>
          <Link href="/admin/appointments" className="rounded-lg border border-brand px-4 py-2 text-[14px] font-semibold text-brand hover:bg-brand/5">View appointments</Link>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="New appointments" value={appts.filter((a) => a.status === "new").length} href="/admin/appointments" tone="text-red-600" />
        <Stat label="Total appointments" value={appts.length} href="/admin/appointments" />
        <Stat label="Live blogs" value={states.filter((s) => s === "live").length} href="/admin/blogs" />
        <Stat label="Scheduled blogs" value={states.filter((s) => s === "scheduled").length} href="/admin/blogs" tone="text-amber-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-[18px] font-semibold">Latest appointments</h2><Link href="/admin/appointments" className="text-[14px] font-medium text-brand">View all</Link></div>
          <ul className="mt-3 divide-y">
            {appts.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <div className="min-w-0"><p className="truncate font-medium">{a.name}</p><p className="text-gray-500">{a.phone}{a.preferredDate ? ` · prefers ${a.preferredDate}` : ""}{a.concern ? ` · ${a.concern}` : ""}</p></div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-medium capitalize text-brand">{a.status}</span>
              </li>
            ))}
            {!appts.length && <li className="py-6 text-center text-gray-500">No appointments yet</li>}
          </ul>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-[18px] font-semibold">Upcoming scheduled blogs</h2><Link href="/admin/blogs/new" className="text-[14px] font-medium text-brand">+ New blog</Link></div>
          <ul className="mt-3 divide-y">
            {upcoming.map((b) => (
              <li key={b.id} className="py-2.5 text-[14px]">
                <Link href={`/admin/blogs/${b.id}`} className="font-medium hover:text-brand">{b.blogTitle}</Link>
                <p className="text-gray-500">Goes live {formatIst(b.publishAt)}</p>
              </li>
            ))}
            {!upcoming.length && <li className="py-6 text-center text-gray-500">Nothing scheduled</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
