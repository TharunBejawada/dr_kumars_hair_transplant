"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/blogs", label: "Blogs" },
];

export default function AdminNav({ email, role }: { email: string; role: string }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <nav className="flex flex-1 flex-col p-3 md:p-4">
      <ul className="flex gap-1 md:flex-col">
        {items.map((i) => {
          const active = i.exact ? path === i.href : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link href={i.href} className={`block rounded-lg px-4 py-2.5 text-[15px] font-medium transition ${active ? "bg-white text-brand" : "hover:bg-white/15"}`}>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 border-t border-white/20 pt-3 text-[13px] md:mt-auto">
        <p className="truncate opacity-90" title={email}>{email}</p>
        <p className="mb-2 text-[12px] uppercase tracking-wider opacity-70">{role}</p>
        <button onClick={logout} className="w-full rounded-lg bg-white/15 px-4 py-2 text-left font-medium hover:bg-white/25">Sign out</button>
      </div>
    </nav>
  );
}
