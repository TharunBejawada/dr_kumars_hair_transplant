"use client";

import { useMemo, useState } from "react";
import { appointmentStatuses, type Appointment, type AppointmentStatus } from "@drkumar/shared";
import { formatIst } from "@/lib/ist";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";

const tone: Record<AppointmentStatus, string> = {
  new: "bg-red-50 text-red-700", contacted: "bg-amber-50 text-amber-700", confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700", cancelled: "bg-gray-100 text-gray-600",
};

export default function AppointmentsTable({ initial }: { initial: Appointment[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [q, setQ] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const shown = useMemo(
    () => rows.filter((r) => (filter === "all" || r.status === filter) && (!q || `${r.name} ${r.email} ${r.phone}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, filter, q],
  );

  async function patch(id: string, body: { status?: AppointmentStatus; notes?: string }) {
    const res = await fetch(`/api/admin/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return toast("Could not update. Please refresh and retry.", "error");
    const { appointment } = await res.json();
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...appointment } : x)));
    toast(body.status ? `Marked as ${body.status}` : "Note saved");
  }
  async function remove(id: string) {
    if (!(await confirm({ title: "Delete this appointment?", message: "This request will be permanently removed.", confirmLabel: "Delete", danger: true }))) return;
    const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    if (res.ok) { setRows((r) => r.filter((x) => x.id !== id)); toast("Appointment deleted"); }
    else toast("Could not delete.", "error");
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="h-10 w-full max-w-[320px] rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-brand" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-[14px] capitalize">
          <option value="all">All statuses</option>
          {appointmentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-[13px] text-gray-500">{shown.length} of {rows.length}</span>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="border-b bg-gray-50 text-[12px] uppercase tracking-wider text-gray-500">
            <tr><th className="p-3">Received</th><th className="p-3">Patient</th><th className="p-3">Contact</th><th className="p-3">Preferred</th><th className="p-3">Message / notes</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y align-top">
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap p-3 text-gray-600">{formatIst(r.createdAt)}</td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3"><a href={`tel:${r.phone}`} className="text-brand">{r.phone}</a><br /><a href={`mailto:${r.email}`} className="break-all text-gray-600">{r.email}</a></td>
                <td className="whitespace-nowrap p-3">{r.preferredDate}</td>
                <td className="max-w-[280px] p-3">
                  {r.message && <p className="mb-1 whitespace-pre-wrap text-gray-700">{r.message}</p>}
                  <input defaultValue={r.notes ?? ""} placeholder="Add internal note…" onBlur={(e) => e.target.value !== (r.notes ?? "") && patch(r.id, { notes: e.target.value })} className="w-full rounded border border-gray-200 px-2 py-1 text-[13px] outline-none focus:border-brand" />
                </td>
                <td className="p-3">
                  <select value={r.status} onChange={(e) => patch(r.id, { status: e.target.value as AppointmentStatus })} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ${tone[r.status]}`}>
                    {appointmentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3"><button onClick={() => remove(r.id)} className="text-[13px] text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={7} className="p-10 text-center text-gray-500">No appointments found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
