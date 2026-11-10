"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface BlogCard {
  url: string; title: string; image: string; categories: string[]; author: string; date: string; excerpt: string;
}
const PAGE = 9;

export default function BlogsExplorer({ blogs }: { blogs: BlogCard[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [visible, setVisible] = useState(PAGE);

  const categories = useMemo(() => ["All", ...Array.from(new Set(blogs.flatMap((b) => b.categories))).sort()], [blogs]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return blogs.filter((b) => (cat === "All" || b.categories.includes(cat)) && (!s || `${b.title} ${b.excerpt} ${b.author} ${b.categories.join(" ")}`.toLowerCase().includes(s)));
  }, [blogs, q, cat]);

  return (
    <div>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories">
          {categories.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => { setCat(c); setVisible(PAGE); }}
              className={`rounded-[5px] px-4 py-2 text-[15px] font-medium transition-all hover:-translate-y-0.5 ${cat === c ? "bg-brand-2 text-white shadow-md" : "bg-chip hover:bg-brand-light/40"}`}>{c}</button>
          ))}
        </div>
        <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setVisible(PAGE); }} placeholder="Search blogs…" aria-label="Search blogs"
          className="h-[42px] w-full rounded-[7px] border border-ink px-4 text-[14px] outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,147,136,0.2)] md:w-[300px]" />
      </div>

      {shown.length ? (
        <ul className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {shown.slice(0, visible).map((b) => (
            <li key={b.url} className="group overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(11,147,136,0.25)]">
              <Link href={`/blogs/${b.url}`} className="block h-full">
                <div className="aspect-[16/10] overflow-hidden bg-mint">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-light/50 to-brand-2 px-6 text-center text-[20px] font-semibold text-white">{b.title}</div>
                  )}
                </div>
                <div className="p-5">
                  {b.categories[0] && <span className="rounded-full bg-brand/10 px-3 py-0.5 text-[12px] font-semibold text-brand">{b.categories[0]}</span>}
                  <h2 className="mt-3 text-[18px] font-semibold leading-[26px] group-hover:text-brand">{b.title}</h2>
                  <p className="mt-2 text-[14px] leading-[22px] text-gray-600">{b.excerpt}</p>
                  <p className="mt-4 text-[13px] text-gray-500">{[b.date, b.author].filter(Boolean).join(" · ")}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-14 text-center text-[16px] text-gray-500">{blogs.length ? "No blogs match your search." : "New articles are coming soon. Please check back shortly."}</p>
      )}

      {visible < shown.length && (
        <div className="mt-10 text-center">
          <button onClick={() => setVisible((v) => v + PAGE)} className="inline-flex h-[40px] items-center rounded-[5px] bg-brand-2 px-[28px] text-[18px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand hover:shadow-lg">Load more</button>
        </div>
      )}
    </div>
  );
}
