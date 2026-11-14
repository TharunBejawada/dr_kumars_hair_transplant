import Link from "next/link";
import { blogDisplayState } from "@drkumar/shared";
import { listAppointments } from "@/lib/db/appointments";
import { listBlogs } from "@/lib/db/blogs";
import { listServicePages } from "@/lib/db/services";
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
  const [appts, blogs, services] = await Promise.all([listAppointments(), listBlogs(), listServicePages()]);
  const now = new Date();
  const states = blogs.map((b) => blogDisplayState(b, now));
  const upcoming = blogs
    .filter((b, i) => states[i] === "scheduled")
    .sort((a, b) => (a.publishAt ?? "").localeCompare(b.publishAt ?? ""))
    .slice(0, 5);

  const publishedServices = services.filter((s) => s.status === "published").length;

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/services/new" className="rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-2">
            + New Service Page
          </Link>
          <Link href="/admin/blogs/new" className="rounded-lg border border-brand px-4 py-2 text-[14px] font-semibold text-brand hover:bg-brand/5">
            + New blog
          </Link>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="New appointments" value={appts.filter((a) => a.status === "new").length} href="/admin/appointments" tone="text-red-600" />
        <Stat label="Total appointments" value={appts.length} href="/admin/appointments" />
        <Stat label="Published Services" value={publishedServices} href="/admin/services" tone="text-teal-600" />
        <Stat label="Live blogs" value={states.filter((s) => s === "live").length} href="/admin/blogs" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Services & Detail Pages</h2>
            <Link href="/admin/services" className="text-[14px] font-medium text-brand hover:underline">
              Manage all →
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {services.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                <div className="min-w-0">
                  <Link href={`/admin/services/${s.id}`} className="truncate font-semibold text-gray-900 hover:text-brand block">
                    {s.title}
                  </Link>
                  <p className="text-[12px] text-gray-500 capitalize">
                    {s.serviceCategory.replace("-", " ")} · /{s.slug}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                    s.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : s.status === "draft"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Latest appointments</h2>
            <Link href="/admin/appointments" className="text-[14px] font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {appts.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="text-gray-500 text-[12px]">
                    {a.phone}
                    {a.preferredDate ? ` · prefers ${a.preferredDate}` : ""}
                    {a.concern ? ` · ${a.concern}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-medium capitalize text-brand">
                  {a.status}
                </span>
              </li>
            ))}
            {!appts.length && <li className="py-6 text-center text-gray-500">No appointments yet</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
