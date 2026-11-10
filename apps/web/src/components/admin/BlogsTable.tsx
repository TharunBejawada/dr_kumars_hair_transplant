"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { blogDisplayState, type Blog, type BlogDisplayState } from "@drkumar/shared";
import { formatIst } from "@/lib/ist";

const tone: Record<BlogDisplayState, string> = {
  live: "bg-green-50 text-green-700", scheduled: "bg-amber-50 text-amber-700", draft: "bg-gray-100 text-gray-600", inactive: "bg-red-50 text-red-700",
};

export default function BlogsTable({ initial }: { initial: Blog[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<BlogDisplayState | "all">("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const now = new Date();

  const shown = useMemo(
    () => rows.filter((b) => (filter === "all" || blogDisplayState(b) === filter) && (!q || `${b.blogTitle} ${b.author} ${b.categories.join(" ")}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, filter, q],
  );

  async function remove(b: Blog) {
    if (!confirm(`Delete "${b.blogTitle}" permanently?`)) return;
    const res = await fetch(`/api/admin/blogs/${b.id}`, { method: "DELETE" });
    if (res.ok) setRows((r) => r.filter((x) => x.id !== b.id));
    else setErr("Could not delete.");
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, author, category…" className="h-10 w-full max-w-[320px] rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-brand" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-[14px]">
          <option value="all">All</option><option value="live">Live</option><option value="scheduled">Scheduled</option><option value="draft">Draft</option><option value="inactive">Inactive</option>
        </select>
      </div>
      {err && <p role="alert" className="mt-3 text-[14px] text-red-600">{err}</p>}
      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="border-b bg-gray-50 text-[12px] uppercase tracking-wider text-gray-500">
            <tr><th className="p-3">Blog</th><th className="p-3">Categories</th><th className="p-3">Status</th><th className="p-3">Publish time</th><th className="p-3">Updated</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {shown.map((b) => {
              const s = blogDisplayState(b, now);
              return (
                <tr key={b.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {b.blogImage ? <img src={b.blogImage} alt="" className="h-12 w-20 rounded object-cover" /> : <div className="h-12 w-20 rounded bg-gray-100" />}
                      <div><Link href={`/admin/blogs/${b.id}`} className="font-medium hover:text-brand">{b.blogTitle}</Link><p className="text-[12px] text-gray-500">/{b.url}{b.author && ` · ${b.author}`}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{b.categories.join(", ") || "—"}</td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ${tone[s]}`}>{s}</span></td>
                  <td className="whitespace-nowrap p-3 text-gray-600">{formatIst(b.publishAt)}</td>
                  <td className="whitespace-nowrap p-3 text-gray-600">{formatIst(b.modifiedAt)}</td>
                  <td className="whitespace-nowrap p-3 text-right"><Link href={`/admin/blogs/${b.id}`} className="mr-3 font-medium text-brand">Edit</Link><button onClick={() => remove(b)} className="text-red-600 hover:underline">Delete</button></td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={6} className="p-10 text-center text-gray-500">No blogs yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
