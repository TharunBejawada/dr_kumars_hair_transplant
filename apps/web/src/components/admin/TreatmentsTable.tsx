"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  type Treatment,
  type TreatmentStatus,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { useConfirm } from "./Confirm";
import { useToast } from "./Toast";
import { FaMagnifyingGlass, FaPen, FaTrashCan, FaPlus, FaLayerGroup } from "react-icons/fa6";

const statusColors: Record<TreatmentStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  draft: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  inactive: "bg-gray-100 text-gray-700 ring-1 ring-gray-400/20",
};

const categoryBadgeColors: Record<ServiceCategoryId, string> = {
  hair: "bg-teal-50 text-teal-800 ring-1 ring-teal-600/25 border-teal-200",
  "skin-cosmetic": "bg-pink-50 text-pink-800 ring-1 ring-pink-600/25 border-pink-200",
  dermatology: "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-600/25 border-cyan-200",
  std: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/25 border-amber-200",
};

export default function TreatmentsTable({ initial }: { initial: Treatment[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [treatments, setTreatments] = useState<Treatment[]>(initial);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  async function onDelete(treatment: Treatment) {
    const ok = await confirm({
      title: "Delete Treatment?",
      message: `"${treatment.title}" will be permanently removed.`,
      confirmLabel: "Delete Treatment",
      danger: true,
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/treatments/${treatment.id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      toast("Could not delete treatment", "error");
      return;
    }
    setTreatments((prev) => prev.filter((t) => t.id !== treatment.id));
    toast("Treatment deleted successfully");
  }

  const filtered = treatments.filter((t) => {
    if (selectedCategory !== "all" && t.serviceCategory !== selectedCategory) return false;
    if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mt-6 space-y-4">
      {/* Category Tabs (Mapping Filter) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition cursor-pointer ${
            selectedCategory === "all"
              ? "bg-brand text-white shadow-2xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          All Services ({treatments.length})
        </button>
        {serviceCategories.map((cat) => {
          const count = treatments.filter((t) => t.serviceCategory === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-brand text-white shadow-2xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search treatments by title, slug..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[12.5px] font-medium text-gray-600">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 outline-none focus:border-brand"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-gray-50 text-[12px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Treatment</th>
                <th className="py-3 px-4">Mapped Service (1:1)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <FaLayerGroup className="mx-auto size-8 text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700">No treatments found</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {search ? "Try adjusting your search criteria" : "Click 'Add New Treatment' to create one"}
                    </p>
                    <Link
                      href="/admin/treatments/new"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-2 transition"
                    >
                      <FaPlus className="size-3" />
                      <span>Add New Treatment</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cat = serviceCategories.find((c) => c.id === t.serviceCategory);
                  const badgeClass =
                    categoryBadgeColors[t.serviceCategory] || "bg-gray-50 text-gray-700";

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition">
                      {/* Treatment Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden">
                            {t.image ? (
                              <Image src={t.image} alt={t.title} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/treatments/${t.id}`}
                              className="font-bold text-gray-900 hover:text-brand transition line-clamp-1"
                            >
                              {t.title}
                            </Link>
                            <span className="block text-[11px] font-mono text-gray-400">
                              /treatments/{t.slug}
                            </span>
                            {t.summary && (
                              <p className="text-[12px] text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                                {t.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mapped Service Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${badgeClass}`}
                        >
                          <span className="size-1.5 rounded-full bg-current opacity-70" />
                          <span>{cat?.label || t.serviceCategory}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            statusColors[t.status]
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[12px] text-gray-600">
                        {t.order}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/treatments/${t.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand transition shadow-2xs"
                            title="Edit treatment"
                          >
                            <FaPen className="size-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onDelete(t)}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-2xs cursor-pointer"
                            title="Delete treatment"
                          >
                            <FaTrashCan className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

