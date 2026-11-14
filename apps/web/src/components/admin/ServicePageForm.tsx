"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCalendarDays, FaCheck, FaCloudArrowUp, FaEye, FaArrowLeft } from "react-icons/fa6";
import {
  serviceCategories,
  type ServicePage,
  type ServicePageStatus,
  type ServiceCategoryId,
} from "@drkumar/shared";
import { slugify } from "@/lib/ist";
import { uploadImage } from "@/lib/upload-client";
import { useToast } from "./Toast";

const statusHelp: Record<ServicePageStatus, string> = {
  draft: "Draft — only visible to admins.",
  published: "Published — live on the website right now.",
  inactive: "Inactive — hidden from public views.",
};

const SAMPLE_IMAGES = [
  { label: "Hair Restoration (Provided)", url: "/images/services-hero-sample.jpg" },
  { label: "Facial Treatment (Oval 1)", url: "/images/oval1.webp" },
  { label: "Skin Rejuvenation (Oval 2)", url: "/images/oval2.webp" },
  { label: "MNRF / Clinical (Oval 3)", url: "/images/oval3.webp" },
  { label: "Doctor Hero", url: "/images/hero.webp" },
];

export default function ServicePageForm({ page }: { page?: ServicePage }) {
  const router = useRouter();
  const toast = useToast();
  const [dirty, setDirty] = useState(false);

  // Form State
  const [category, setCategory] = useState<ServiceCategoryId>(page?.serviceCategory ?? "hair");
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const slugTouched = useRef(!!page);

  // Section 1: Hero Banner Fields
  const [subtitle, setSubtitle] = useState(page?.subtitle ?? "");
  const [image, setImage] = useState(page?.image ?? "/images/services-hero-sample.jpg");
  const [imageAlt, setImageAlt] = useState(page?.imageAlt ?? "");
  const [ctaText, setCtaText] = useState(page?.ctaText ?? "Book a Consultation");
  const [ctaLink, setCtaLink] = useState(page?.ctaLink ?? "#appointment");

  // Publishing & SEO
  const [status, setStatus] = useState<ServicePageStatus>(page?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");

  // Status & loaders
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auto-slugify on title change if slug hasn't been edited manually
  function onTitleChange(val: string) {
    setTitle(val);
    setDirty(true);
    if (!slugTouched.current) {
      setSlug(slugify(val));
    }
  }

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const publicPath = await uploadImage(f);
      setImage(publicPath);
      setDirty(true);
      toast("Image uploaded successfully!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const body = {
      serviceCategory: category,
      title,
      slug,
      subtitle,
      image,
      imageAlt,
      ctaText,
      ctaLink,
      status,
      seoTitle,
      metaDescription,
      sections: page?.sections ?? {},
    };

    const res = await fetch(page ? `/api/admin/services/${page.id}` : "/api/admin/services", {
      method: page ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);

    const data = await res?.json().catch(() => ({}));
    setBusy(false);

    if (res?.ok) {
      setDirty(false);
      toast(page ? "Service page updated successfully" : "Service page created successfully");
      if (!page) {
        router.replace(`/admin/services/${data.page.id}`);
      } else {
        router.refresh();
      }
      return;
    }

    setErrors(data?.issues ?? {});
    toast(data?.error ?? "Could not save service page. Please check the fields.", "error");
  }

  const err = (k: string) =>
    errors[k]?.[0] ? <p role="alert" className="mt-1 text-[13px] text-red-600">{errors[k][0]}</p> : null;

  return (
    <form onSubmit={onSubmit} className="pb-16">
      {/* Top action bar */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FaArrowLeft className="size-3" /> Services List
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-[14px] font-semibold text-gray-800">
            {page ? `Editing: ${title || "Untitled"}` : "Create New Service Detail Page"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {page && (
            <Link
              href={`/services/${slug}`}
              target="_blank"
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <FaEye className="size-3.5" /> Preview Live
            </Link>
          )}

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ServicePageStatus);
              setDirty(true);
            }}
            className={`rounded-lg border px-3 py-2 text-[13px] font-semibold outline-none transition ${
              status === "published"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : status === "draft"
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-gray-300 bg-gray-50 text-gray-700"
            }`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            disabled={busy || uploading}
            className="rounded-lg bg-brand px-5 py-2 text-[14px] font-semibold text-white shadow-sm hover:bg-brand-2 disabled:opacity-50 transition"
          >
            {busy ? "Saving..." : page ? "Update Page" : "Publish Page"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 0: Service Category & Hierarchy */}
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Service Category & URL</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Select which core service this detail page belongs to.
            </p>

            <div className="mb-4">
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">Service Category *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {serviceCategories.map((c) => {
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        setDirty(true);
                      }}
                      className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition border ${
                        active
                          ? "border-brand bg-brand/10 text-brand ring-2 ring-brand/30 font-bold"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-[14px]">{c.label}</span>
                    </button>
                  );
                })}
              </div>
              {err("serviceCategory")}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Page Slug (URL) *</label>
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-[14px] text-gray-500 focus-within:border-brand focus-within:bg-white">
                  <span>/services/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      slugTouched.current = true;
                      setSlug(slugify(e.target.value));
                      setDirty(true);
                    }}
                    placeholder="e.g. hair-loss-treatments"
                    className="w-full bg-transparent pl-1 font-mono text-gray-900 outline-none"
                    required
                  />
                </div>
                {err("slug")}
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Status</label>
                <p className="mt-2 text-[12px] text-gray-500">{statusHelp[status]}</p>
              </div>
            </div>
          </section>

          {/* Card 1: Section 1 - Hero Banner (Title, Subtitle, Image) */}
          <section className="rounded-xl bg-white p-5 shadow-sm border-2 border-brand/30">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                    Section 1
                  </span>
                  <h2 className="text-[17px] font-bold text-gray-900">Hero Banner</h2>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">
                  Primary hero section displayed at the very top of the service details page.
                </p>
              </div>
              <span className="text-[12px] font-semibold text-brand bg-brand/10 px-2 py-1 rounded">Active</span>
            </div>

            {/* Title */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-gray-700">Section Title *</label>
                <span className="text-[11px] text-gray-400">{title.length}/250</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] font-semibold text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                required
              />
              {err("title")}
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-gray-700">Sub Title *</label>
                <span className="text-[11px] text-gray-400">{subtitle.length}/300</span>
              </div>
              <textarea
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                  setDirty(true);
                }}
                rows={2}
                placeholder="e.g. Personalised Care for Hair Fall, Thinning Hair & Baldness"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              {err("subtitle")}
            </div>

            {/* Hero Image */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Hero Section Image (Right Column) *
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Image Preview Thumbnail */}
                <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
                  {image ? (
                    <Image src={image} alt="Preview" fill className="object-cover" sizes="176px" />
                  ) : (
                    <span className="text-[12px] text-gray-400">No Image</span>
                  )}
                </div>

                {/* Upload & Pickers */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-2 transition">
                      <FaCloudArrowUp className="size-4" />
                      <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={onFileSelected}
                        disabled={uploading}
                      />
                    </label>

                    {image && (
                      <button
                        type="button"
                        onClick={() => {
                          setImage("");
                          setDirty(true);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preset quick selection */}
                  <div>
                    <span className="text-[11px] font-medium text-gray-500 block mb-1">Or choose a preset sample:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_IMAGES.map((s) => (
                        <button
                          key={s.url}
                          type="button"
                          onClick={() => {
                            setImage(s.url);
                            setDirty(true);
                          }}
                          className={`rounded px-2 py-1 text-[11px] transition ${
                            image === s.url
                              ? "bg-brand text-white font-semibold"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Image URL input */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Image URL (e.g. /images/... or https://...)"
                      className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[12px] font-mono outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
              {err("image")}
            </div>

            {/* CTA Button Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => {
                    setCtaText(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Book a Consultation"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">CTA Action / Link</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => {
                    setCtaLink(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="#appointment (or URL)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          {/* Modular Extensible Placeholders for Future Sections */}
          <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5 text-center">
            <div className="mx-auto max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 mb-2">
                Upcoming Sections
              </span>
              <h3 className="text-[15px] font-semibold text-gray-800">
                Ready for More Sections (Section 2, 3...)
              </h3>
              <p className="mt-1 text-[12px] text-gray-500">
                You can now submit the next sections one by one. The data architecture and admin screens are structured to smoothly adopt each UI block as you present it.
              </p>
            </div>
          </section>

          {/* Card 3: SEO Metadata (Collapsible) */}
          <details className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 group">
            <summary className="cursor-pointer font-bold text-gray-900 text-[15px] select-none flex items-center justify-between">
              <span>Search Engine Optimization (SEO) & Social Sharing</span>
              <span className="text-[12px] text-brand group-open:rotate-180 transition">▼</span>
            </summary>
            <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    setDirty(true);
                  }}
                  placeholder={title || "Defaults to Section Title"}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    setDirty(true);
                  }}
                  rows={2}
                  placeholder="Concise overview for Google search snippets (150-160 characters)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Right Column: Live Interactive Section 1 UI Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl bg-white p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Section 1 · Live Visual Preview
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time
              </span>
            </div>

            {/* Simulated Live Section 1 Component */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <div
                className="relative overflow-hidden p-5 sm:p-6"
                style={{
                  background: "linear-gradient(135deg, #e7f7f5 0%, #f4fbfa 55%, #ffffff 100%)",
                }}
              >
                {/* Decorative background shape */}
                <div
                  className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-brand/5 blur-xl"
                  aria-hidden
                />

                <div className="flex flex-col gap-4">
                  {/* Title */}
                  <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight text-[#101828]">
                    {title || "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad"}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[14px] sm:text-[15px] font-semibold text-brand leading-snug">
                    {subtitle || "Personalised Care for Hair Fall, Thinning Hair & Baldness"}
                  </p>

                  {/* Button */}
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-2">
                      <FaCalendarDays className="size-4" />
                      <span>{ctaText || "Book a Consultation"}</span>
                    </span>
                  </div>

                  {/* Hero image preview */}
                  <div className="relative mt-2 h-44 w-full overflow-hidden rounded-xl border border-teal-100 bg-white/70 shadow-inner flex items-center justify-center">
                    {image ? (
                      <Image
                        src={image}
                        alt={imageAlt || title || "Preview"}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="text-center p-4 text-gray-400 text-[12px]">
                        No image uploaded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-teal-50/70 p-3 text-[12px] text-teal-900 border border-teal-100">
              <p className="font-semibold">💡 What you see is what visitors see:</p>
              <p className="mt-0.5 text-teal-800">
                This preview accurately reflects Section 1 (Title, Sub title, Image & CTA) on desktop & mobile screens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

