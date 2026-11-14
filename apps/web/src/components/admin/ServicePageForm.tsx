"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaCalendarDays,
  FaCloudArrowUp,
  FaEye,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaCheck,
} from "react-icons/fa6";
import {
  serviceCategories,
  type ServicePage,
  type ServicePageStatus,
  type ServiceCategoryId,
  type ConcernItem,
  type ServiceConcernsSection,
} from "@drkumar/shared";
import { slugify } from "@/lib/ist";
import { uploadImage } from "@/lib/upload-client";
import { useToast } from "./Toast";

const statusHelp: Record<ServicePageStatus, string> = {
  draft: "Draft — only visible to admins.",
  published: "Published — live on the website right now.",
  inactive: "Inactive — hidden from public views.",
};

const SAMPLE_HERO_IMAGES = [
  { label: "Hair Restoration (Provided)", url: "/images/services-hero-sample.jpg" },
  { label: "Facial Treatment (Oval 1)", url: "/images/oval1.webp" },
  { label: "Skin Rejuvenation (Oval 2)", url: "/images/oval2.webp" },
  { label: "MNRF / Clinical (Oval 3)", url: "/images/oval3.webp" },
  { label: "Doctor Hero", url: "/images/hero.webp" },
];

const CONCERN_IMAGE_PRESETS = [
  { label: "Excessive Hair Fall", url: "/images/concerns/excessive-hair-fall.webp" },
  { label: "Receding Hairline", url: "/images/concerns/receding-hairline.webp" },
  { label: "Male Pattern Baldness", url: "/images/concerns/male-pattern-baldness.webp" },
  { label: "Female Pattern Hair Loss", url: "/images/concerns/female-pattern-hair-loss.webp" },
  { label: "Thinning Hair Crown", url: "/images/concerns/thinning-hair-crown.webp" },
  { label: "Bald Patches", url: "/images/concerns/bald-patches.webp" },
  { label: "Widening Hair Parting", url: "/images/concerns/widening-hair-parting.webp" },
  { label: "Reduced Hair Density", url: "/images/concerns/reduced-hair-density.webp" },
];

const DEFAULT_CONCERNS_LIST: ConcernItem[] = [
  { id: "c1", title: "Excessive hair fall", image: "/images/concerns/excessive-hair-fall.webp" },
  { id: "c2", title: "Receding hairline", image: "/images/concerns/receding-hairline.webp" },
  { id: "c3", title: "Male pattern baldness", image: "/images/concerns/male-pattern-baldness.webp" },
  { id: "c4", title: "Female pattern hair loss", image: "/images/concerns/female-pattern-hair-loss.webp" },
  { id: "c5", title: "Thinning hair at the crown", image: "/images/concerns/thinning-hair-crown.webp" },
  { id: "c6", title: "Bald patches", image: "/images/concerns/bald-patches.webp" },
  { id: "c7", title: "Widening hair parting", image: "/images/concerns/widening-hair-parting.webp" },
  { id: "c8", title: "Reduced hair density", image: "/images/concerns/reduced-hair-density.webp" },
];

export default function ServicePageForm({ page }: { page?: ServicePage }) {
  const router = useRouter();
  const toast = useToast();
  const [dirty, setDirty] = useState(false);

  // Form Meta State
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

  // Section 2: Concerns & Treatment Approaches Fields
  const initConcerns = page?.concernsSection;
  const [concernsTagline, setConcernsTagline] = useState(
    initConcerns?.tagline ?? "Understanding Your Hair Concerns"
  );
  const [concernsHeading, setConcernsHeading] = useState(
    initConcerns?.heading ?? "Different Hair Problems Need Different Treatment Approaches"
  );
  const [concernsDescription, setConcernsDescription] = useState(
    initConcerns?.description ??
      "Hair loss does not always begin with visible baldness. Some people notice excessive hair shedding, while others experience gradual thinning or changes in their hairline."
  );
  const [concernItems, setConcernItems] = useState<ConcernItem[]>(
    initConcerns?.items && initConcerns.items.length > 0
      ? initConcerns.items
      : DEFAULT_CONCERNS_LIST
  );
  const [sideCardImage, setSideCardImage] = useState(
    initConcerns?.sideCard?.image ?? "/images/concerns/side-woman.webp"
  );
  const [sideCardText1, setSideCardText1] = useState(
    initConcerns?.sideCard?.text1 ??
      "Early evaluation can help identify possible causes and determine whether medical treatment, supportive procedures, or hair transplantation may be appropriate."
  );
  const [sideCardText2, setSideCardText2] = useState(
    initConcerns?.sideCard?.text2 ??
      "At Dr. Kumar’s Skin & Hair Transplant Center, patients looking for a hair specialist in Kondapur, Hyderabad can receive individualised assessment and guidance for different hair loss concerns."
  );
  const [sideCardCtaText, setSideCardCtaText] = useState(
    initConcerns?.sideCard?.ctaText ?? "Consult Our Hair Specialist"
  );
  const [sideCardCtaLink, setSideCardCtaLink] = useState(
    initConcerns?.sideCard?.ctaLink ?? "#appointment"
  );

  // Preview tab selection
  const [previewTab, setPreviewTab] = useState<"section1" | "section2" | "full">("full");

  // Publishing & SEO
  const [status, setStatus] = useState<ServicePageStatus>(page?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");

  // Status & loaders
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingSide, setUploadingSide] = useState(false);
  const [uploadingItemIdx, setUploadingItemIdx] = useState<number | null>(null);

  function onTitleChange(val: string) {
    setTitle(val);
    setDirty(true);
    if (!slugTouched.current) {
      setSlug(slugify(val));
    }
  }

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function onHeroFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingHero(true);
    try {
      const publicPath = await uploadImage(f);
      setImage(publicPath);
      setDirty(true);
      toast("Hero image uploaded successfully!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  }

  async function onSideCardFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingSide(true);
    try {
      const publicPath = await uploadImage(f);
      setSideCardImage(publicPath);
      setDirty(true);
      toast("Side card image uploaded successfully!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingSide(false);
      e.target.value = "";
    }
  }

  async function onConcernItemFileSelected(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingItemIdx(idx);
    try {
      const publicPath = await uploadImage(f);
      setConcernItems((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], image: publicPath };
        return copy;
      });
      setDirty(true);
      toast("Concern item image updated!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingItemIdx(null);
      e.target.value = "";
    }
  }

  function addConcernItem() {
    setConcernItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        title: "New Concern / Problem",
        image: "/images/concerns/excessive-hair-fall.webp",
      },
    ]);
    setDirty(true);
  }

  function removeConcernItem(idx: number) {
    setConcernItems((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateConcernTitle(idx: number, text: string) {
    setConcernItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], title: text };
      return copy;
    });
    setDirty(true);
  }

  function updateConcernImage(idx: number, url: string) {
    setConcernItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], image: url };
      return copy;
    });
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const concernsSection: ServiceConcernsSection = {
      tagline: concernsTagline,
      heading: concernsHeading,
      description: concernsDescription,
      items: concernItems,
      sideCard: {
        image: sideCardImage,
        text1: sideCardText1,
        text2: sideCardText2,
        ctaText: sideCardCtaText,
        ctaLink: sideCardCtaLink,
      },
    };

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
      concernsSection,
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
            disabled={busy || uploadingHero || uploadingSide}
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
              Select which core service category this detail page belongs to.
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
                    placeholder="e.g. hair"
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
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Section 1
                </span>
                <h2 className="text-[17px] font-bold text-gray-900">Hero Banner (Title, Subtitle & Image)</h2>
              </div>
              <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-600/20">
                Active
              </span>
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
                <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
                  {image ? (
                    <Image src={image} alt="Preview" fill className="object-cover" sizes="176px" />
                  ) : (
                    <span className="text-[12px] text-gray-400">No Image</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-2 transition">
                      <FaCloudArrowUp className="size-4" />
                      <span>{uploadingHero ? "Uploading..." : "Upload New Image"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={onHeroFileSelected}
                        disabled={uploadingHero}
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

                  <div>
                    <span className="text-[11px] font-medium text-gray-500 block mb-1">Preset samples:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_HERO_IMAGES.map((s) => (
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

                  <div className="pt-1">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Image URL"
                      className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[12px] font-mono outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
              {err("image")}
            </div>

            {/* CTA Settings */}
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
                  placeholder="#appointment"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Section 2 - Concerns & Treatment Approaches */}
          <section className="rounded-xl bg-white p-5 shadow-sm border-2 border-teal-500/30">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Section 2
                </span>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Concerns &amp; Treatment Approaches Grid
                </h2>
              </div>
              <span className="text-[12px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full ring-1 ring-teal-600/20">
                New Section
              </span>
            </div>

            {/* Section 2 Tagline, Heading & Intro */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 2 Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={concernsTagline}
                  onChange={(e) => {
                    setConcernsTagline(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. Understanding Your Hair Concerns"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] font-medium text-brand outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 2 Main Heading *
                </label>
                <input
                  type="text"
                  value={concernsHeading}
                  onChange={(e) => {
                    setConcernsHeading(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. Different Hair Problems Need Different Treatment Approaches"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] font-bold text-gray-900 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 2 Description Paragraph
                </label>
                <textarea
                  value={concernsDescription}
                  onChange={(e) => {
                    setConcernsDescription(e.target.value);
                    setDirty(true);
                  }}
                  rows={2}
                  placeholder="e.g. Hair loss does not always begin with visible baldness..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] text-gray-700 outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Concern Circle Items Manager */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">
                    Concern Items ({concernItems.length} items)
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Circular portrait cards displayed in the 4-column problem grid.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addConcernItem}
                  className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-[12px] font-semibold text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                >
                  <FaPlus className="size-3" /> Add Concern
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {concernItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-2.5 transition hover:border-gray-300"
                  >
                    {/* Circle Image preview & picker */}
                    <div className="relative size-14 shrink-0 rounded-full overflow-hidden border border-gray-300 bg-white shadow-sm flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <span className="text-[10px] text-gray-400">No img</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateConcernTitle(idx, e.target.value)}
                        placeholder="Concern Title"
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[13px] font-medium text-gray-900 outline-none focus:border-brand"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <label className="cursor-pointer text-[11px] font-semibold text-brand hover:underline">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onConcernItemFileSelected(idx, e)}
                            disabled={uploadingItemIdx === idx}
                          />
                        </label>
                        <span className="text-gray-300">·</span>
                        {/* Preset quick selector dropdown */}
                        <select
                          value={item.image}
                          onChange={(e) => updateConcernImage(idx, e.target.value)}
                          className="text-[11px] text-gray-600 bg-transparent border-none outline-none max-w-[130px] truncate cursor-pointer hover:text-gray-900"
                        >
                          <option value="">Preset</option>
                          {CONCERN_IMAGE_PRESETS.map((p) => (
                            <option key={p.url} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeConcernItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <FaTrash className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Card Configuration */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                Right Column Consultation Card Box
              </h3>
              <p className="text-[12px] text-gray-500 mb-3">
                The soft mint container displaying the specialist consultation advice and direct booking CTA.
              </p>

              <div className="space-y-3 rounded-lg bg-teal-50/50 p-3.5 border border-teal-100">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-teal-200 bg-white">
                    {sideCardImage ? (
                      <Image src={sideCardImage} alt="Card image" fill className="object-cover object-top" sizes="128px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded bg-brand px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-brand-2">
                      <FaCloudArrowUp className="size-3.5" />
                      <span>{uploadingSide ? "Uploading..." : "Upload Side Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onSideCardFileSelected}
                        disabled={uploadingSide}
                      />
                    </label>
                    <input
                      type="text"
                      value={sideCardImage}
                      onChange={(e) => {
                        setSideCardImage(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Image URL"
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[12px] font-mono outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">Paragraph 1 Text</label>
                  <textarea
                    value={sideCardText1}
                    onChange={(e) => {
                      setSideCardText1(e.target.value);
                      setDirty(true);
                    }}
                    rows={2}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">Paragraph 2 Text</label>
                  <textarea
                    value={sideCardText2}
                    onChange={(e) => {
                      setSideCardText2(e.target.value);
                      setDirty(true);
                    }}
                    rows={2}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="mb-1 block text-[12px] font-semibold text-gray-700">Card Button Label</label>
                    <input
                      type="text"
                      value={sideCardCtaText}
                      onChange={(e) => {
                        setSideCardCtaText(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Consult Our Hair Specialist"
                      className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-semibold text-gray-700">Card Button Action</label>
                    <input
                      type="text"
                      value={sideCardCtaLink}
                      onChange={(e) => {
                        setSideCardCtaLink(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="#appointment"
                      className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 Placeholder for Next Request */}
          <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5 text-center">
            <div className="mx-auto max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 mb-2">
                Upcoming
              </span>
              <h3 className="text-[15px] font-semibold text-gray-800">
                Ready for Section 3
              </h3>
              <p className="mt-1 text-[12px] text-gray-500">
                Section 1 and Section 2 are both live and configured. Provide Section 3 next and we will integrate it!
              </p>
            </div>
          </section>

          {/* Card 3: SEO Metadata (Collapsible) */}
          <details className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 group">
            <summary className="cursor-pointer font-bold text-gray-900 text-[15px] select-none flex items-center justify-between">
              <span>Search Engine Optimization (SEO) &amp; Social Sharing</span>
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

        {/* Right Column: Live Interactive Section Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl bg-white p-4 shadow-md border border-gray-200 max-h-[calc(100vh-6rem)] overflow-y-auto thin-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Interactive Visual Preview
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time
              </span>
            </div>

            {/* Preview Section Switcher Tabs */}
            <div className="flex gap-1 mb-3 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setPreviewTab("full")}
                className={`flex-1 rounded py-1 text-[11px] font-bold transition ${
                  previewTab === "full" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Full Page
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section1")}
                className={`flex-1 rounded py-1 text-[11px] font-bold transition ${
                  previewTab === "section1" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Section 1 (Hero)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section2")}
                className={`flex-1 rounded py-1 text-[11px] font-bold transition ${
                  previewTab === "section2" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Section 2 (Concerns)
              </button>
            </div>

            {/* Preview Container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm space-y-2 bg-white">
              {/* SECTION 1 LIVE PREVIEW */}
              {(previewTab === "section1" || previewTab === "full") && (
                <div
                  className="relative overflow-hidden p-4 sm:p-5 border-b border-teal-100"
                  style={{
                    background: "linear-gradient(135deg, #e7f7f5 0%, #f4fbfa 55%, #ffffff 100%)",
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit">
                      Section 1 · Hero Banner
                    </span>
                    <h1 className="text-[18px] sm:text-[20px] font-bold leading-tight text-[#101828]">
                      {title || "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad"}
                    </h1>
                    <p className="text-[13px] font-semibold text-brand leading-snug">
                      {subtitle || "Personalised Care for Hair Fall, Thinning Hair & Baldness"}
                    </p>
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white shadow-sm">
                        <FaCalendarDays className="size-3.5" />
                        <span>{ctaText || "Book a Consultation"}</span>
                      </span>
                    </div>
                    <div className="relative mt-1 h-36 w-full overflow-hidden rounded-xl border border-teal-100 bg-white/70 shadow-inner flex items-center justify-center">
                      {image ? (
                        <Image src={image} alt="Preview" fill className="object-cover object-center" sizes="380px" />
                      ) : (
                        <div className="text-gray-400 text-[11px]">No image</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2 LIVE PREVIEW */}
              {(previewTab === "section2" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-white space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Section 2 · Concerns Grid
                  </span>

                  <div>
                    <h3 className="text-[16px] font-bold text-brand leading-snug">
                      {concernsTagline || "Understanding Your Hair Concerns"}
                    </h3>
                    <h4 className="text-[15px] font-bold text-[#111828] leading-tight mt-1">
                      {concernsHeading || "Different Hair Problems Need Different Treatment Approaches"}
                    </h4>
                    <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">
                      {concernsDescription}
                    </p>
                  </div>

                  {/* Concerns Circles Mockup */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {concernItems.slice(0, 8).map((item) => (
                      <div key={item.id} className="flex flex-col items-center text-center">
                        <div className="relative size-12 rounded-full overflow-hidden border border-teal-200 bg-teal-50 shadow-xs">
                          {item.image && (
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-800 line-clamp-2 mt-1 leading-tight">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right Side Card Mockup */}
                  <div className="rounded-xl bg-[#ecfaf7] border border-[#cbece6] p-3.5 space-y-2 mt-3">
                    {sideCardImage && (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-white shadow-inner">
                        <Image src={sideCardImage} alt="Specialist" fill className="object-cover object-top" sizes="300px" />
                      </div>
                    )}
                    <p className="text-[11.5px] text-gray-700 line-clamp-2">{sideCardText1}</p>
                    <p className="text-[11.5px] text-gray-700 line-clamp-2">
                      <span className="font-semibold text-brand">At Dr. Kumar’s: </span>
                      {sideCardText2}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-[11px] font-semibold text-white shadow-xs">
                      {sideCardCtaText || "Consult Our Specialist"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-teal-50/70 p-3 text-[12px] text-teal-900 border border-teal-100">
              <p className="font-semibold">✨ Section 1 &amp; Section 2 integrated:</p>
              <p className="mt-0.5 text-teal-800">
                Any changes made on the left form update this real-time preview and public pages immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
