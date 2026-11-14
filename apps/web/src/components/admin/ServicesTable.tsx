"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  serviceCategories,
  type ServicePage,
  type ServiceCategoryId,
  type ServicePageStatus,
} from "@drkumar/shared";
import { useConfirm } from "./Confirm";
import { useToast } from "./Toast";

const statusColors: Record<ServicePageStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  draft: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  inactive: "bg-gray-100 text-gray-700 ring-1 ring-gray-400/20",
};

const categoryBadgeColors: Record<ServiceCategoryId, string> = {
  hair: "bg-teal-50 text-teal-700 ring-teal-600/20",
  "skin-cosmetic": "bg-pink-50 text-pink-700 ring-pink-600/20",
  dermatology: "bg-blue-50 text-blue-700 ring-blue-600/20",
  std: "bg-purple-50 text-purple-700 ring-purple-600/20",
};

export default function ServicesTable({ initial }: { initial: ServicePage[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [pages, setPages] = useState<ServicePage[]>(initial);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  async function onDelete(page: ServicePage) {
    const ok = await confirm({
      title: "Delete Service Detail Page?",
      message: `"${page.title}" will be permanently removed.`,
      confirmLabel: "Delete Page",
      danger: true,
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/services/${page.id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      toast("Could not delete service page", "error");
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== page.id));
    toast("Service page deleted");
  }

  const filtered = pages.filter((p) => {
    if (selectedCategory !== "all" && p.serviceCategory !== selectedCategory) return false;
    if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryCount = (catId: string) => pages.filter((p) => p.serviceCategory === catId).length;

  return (
    <div className="mt-6">
      {/* 4 Service Category Hub Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {serviceCategories.map((cat) => {
          const active = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(active ? "all" : cat.id)}
              className={`flex flex-col text-left rounded-xl p-4 transition-all duration-200 border ${
                active
                  ? "border-brand bg-brand/5 shadow-sm ring-2 ring-brand/30"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[15px] font-bold text-gray-900">{cat.label}</span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
                  {count} {count === 1 ? "page" : "pages"}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-[12px] text-gray-500">{cat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
              selectedCategory === "all" ? "bg-brand text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Categories ({pages.length})
          </button>
          {serviceCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                selectedCategory === c.id ? "bg-brand text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c.label} ({getCategoryCount(c.id)})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 outline-none focus:border-brand"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table of Detail Pages */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-200">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-[13px] font-semibold text-gray-600">
              <th className="py-3.5 pl-4 pr-3">Section 1 Hero</th>
              <th className="py-3.5 px-3">Service & Detail Page</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">URL Slug</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[14px]">
            {filtered.map((page) => {
              const catObj = serviceCategories.find((c) => c.id === page.serviceCategory);
              return (
                <tr key={page.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 pl-4 pr-3 w-[120px]">
                    <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                      {page.image ? (
                        <Image
                          src={page.image}
                          alt={page.imageAlt || page.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <span className="text-[11px] text-gray-400">No image</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/admin/services/${page.id}`}
                      className="font-semibold text-gray-900 hover:text-brand line-clamp-1 text-[15px]"
                    >
                      {page.title}
                    </Link>
                    {page.subtitle && (
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-500">{page.subtitle}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset ${
                        categoryBadgeColors[page.serviceCategory] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {catObj?.label || page.serviceCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[13px] text-gray-600 font-mono">
                    /services/{page.slug}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold ${
                        statusColors[page.status]
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/services/${page.slug}`}
                        target="_blank"
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
                        title="View live service page"
                      >
                        View ↗
                      </Link>
                      <Link
                        href={`/admin/services/${page.id}`}
                        className="rounded-md bg-brand px-3 py-1 text-[12px] font-semibold text-white hover:bg-brand-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(page)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-[12px] font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <p className="text-[16px] font-medium">No service detail pages found</p>
                  <p className="mt-1 text-[13px] text-gray-400">
                    Try adjusting your filters or click "+ Add Detail Page" above.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
