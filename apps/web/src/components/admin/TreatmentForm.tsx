"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type Treatment,
  type TreatmentInput,
  type TreatmentStatus,
  type TreatmentContentSection,
  type TreatmentFaqItem,
  type TreatmentFaqSection,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { slugify } from "@/lib/ist";
import { uploadImage } from "@/lib/upload-client";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./Toast";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowUp,
  FaArrowUpRightFromSquare,
  FaCheck,
  FaCircleQuestion,
  FaCloudArrowUp,
  FaEye,
  FaLayerGroup,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";

const TREATMENT_IMAGE_PRESETS = [
  { label: "Stem Cell Hair Therapy", url: "/images/treatments/stem-cell-therapy.webp" },
  { label: "Human-Derived Exosomes", url: "/images/treatments/human-exosomes.webp" },
  { label: "Dutasteride Mesotherapy", url: "/images/treatments/dutasteride-mesotherapy.webp" },
  { label: "Female Hair Transplant", url: "/images/treatments/female-hair-transplant.webp" },
  { label: "Hair Transplant", url: "/images/treatments/hair-transplant.webp" },
  { label: "GFC Hair Treatment", url: "/images/treatments/gfc-treatment.webp" },
  { label: "Hair Loss Treatment", url: "/images/treatments/hair-loss-treatment.webp" },
  { label: "Hair Transplant Clinic", url: "/images/treatments/hair-transplant-clinic.webp" },
  { label: "Doctor Scalp Examination", url: "/images/scalp-examination.webp" },
  { label: "Clinical Skin Care (Oval 1)", url: "/images/oval1.webp" },
  { label: "Chemical Peels (Oval 2)", url: "/images/oval2.webp" },
  { label: "Laser Skin Toning (Oval 3)", url: "/images/oval3.webp" },
  { label: "Carbon Laser Peel (Oval 4)", url: "/images/oval4.webp" },
];

const SERVICE_PRESETS = [
  {
    id: "hair" as ServiceCategoryId,
    label: "Hair",
    color: "teal",
    badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    id: "skin-cosmetic" as ServiceCategoryId,
    label: "Skin & Cosmetic",
    color: "emerald",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "dermatology" as ServiceCategoryId,
    label: "Dermatology",
    color: "cyan",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
  },
  {
    id: "std" as ServiceCategoryId,
    label: "STD",
    color: "amber",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
];

export default function TreatmentForm({ treatment }: { treatment?: Treatment }) {
  const router = useRouter();
  const toast = useToast();
  const [dirty, setDirty] = useState(false);

  // Mapped Service: Exactly ONE service category
  const [serviceCategory, setServiceCategory] = useState<ServiceCategoryId>(
    treatment?.serviceCategory ?? "hair"
  );

  // Basic Info
  const [title, setTitle] = useState(treatment?.title ?? "");
  const [slug, setSlug] = useState(treatment?.slug ?? "");
  const slugTouched = useRef(!!treatment);
  const [summary, setSummary] = useState(treatment?.summary ?? "");
  const [image, setImage] = useState(treatment?.image ?? "");
  const [imageAlt, setImageAlt] = useState(treatment?.imageAlt ?? "");
  const [status, setStatus] = useState<TreatmentStatus>(treatment?.status ?? "draft");
  const [order, setOrder] = useState<number>(treatment?.order ?? 1);

  // SEO
  const [seoTitle, setSeoTitle] = useState(treatment?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(treatment?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(treatment?.metaKeywords ?? "");

  // Dynamic Content Sections (Title + Rich Text Editor)
  const [contentSections, setContentSections] = useState<TreatmentContentSection[]>(() => {
    if (treatment?.contentSections && treatment.contentSections.length > 0) {
      return treatment.contentSections;
    }
    if (Array.isArray(treatment?.sections) && treatment.sections.length > 0) {
      return treatment.sections as TreatmentContentSection[];
    }
    return [];
  });

  function addContentSection() {
    setContentSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: "",
        data: "",
      },
    ]);
    setDirty(true);
  }

  function removeContentSection(idx: number) {
    setContentSections((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateContentSectionTitle(idx: number, val: string) {
    setContentSections((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], title: val };
      return copy;
    });
    setDirty(true);
  }

  function updateContentSectionData(idx: number, val: string) {
    setContentSections((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], data: val };
      return copy;
    });
    setDirty(true);
  }

  function moveContentSection(idx: number, dir: -1 | 1) {
    setContentSections((prev) => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[nextIdx];
      copy[nextIdx] = temp;
      return copy;
    });
    setDirty(true);
  }

  // Section 6: Frequently Asked Questions (FAQ)
  const [faqHeading, setFaqHeading] = useState(
    treatment?.faqSection?.heading ?? "Frequently Asked Questions"
  );
  const [faqItems, setFaqItems] = useState<TreatmentFaqItem[]>(() => {
    if (treatment?.faqSection?.items && treatment.faqSection.items.length > 0) {
      return treatment.faqSection.items;
    }
    if (Array.isArray(treatment?.faqs) && treatment.faqs.length > 0) {
      return treatment.faqs;
    }
    return [];
  });
  const [previewOpenFaq, setPreviewOpenFaq] = useState<string | null>(null);

  function addFaqItem() {
    setFaqItems((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: "",
        answer: "",
      },
    ]);
    setDirty(true);
  }

  function removeFaqItem(idx: number) {
    setFaqItems((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateFaqItem(idx: number, patch: Partial<TreatmentFaqItem>) {
    setFaqItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
    setDirty(true);
  }

  function moveFaqItem(idx: number, dir: -1 | 1) {
    setFaqItems((prev) => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[nextIdx];
      copy[nextIdx] = temp;
      return copy;
    });
    setDirty(true);
  }

  // Status & loaders
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingImage(true);
    try {
      const publicPath = await uploadImage(f);
      setImage(publicPath);
      setDirty(true);
      toast("Treatment photo uploaded successfully!");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const rawSlug = slug.trim() || slugify(title);
    const cleanSlug = rawSlug.toLowerCase().replace(/^-+|-+$/g, "");

    const validContentSections = contentSections
      .map((sec) => ({
        id: sec.id || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: sec.title.trim(),
        data: sec.data || "",
      }))
      .filter((sec) => sec.title.length > 0 || (sec.data && sec.data.trim().length > 0));

    const validFaqItems = faqItems
      .map((it) => ({
        id: it.id || `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: it.question.trim(),
        answer: it.answer.trim(),
      }))
      .filter((it) => it.question.length > 0 || it.answer.length > 0);

    const body: TreatmentInput = {
      serviceCategory,
      title: title.trim(),
      slug: cleanSlug,
      summary: summary.trim(),
      image: image.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      status,
      order: Number(order) || 1,
      seoTitle: seoTitle.trim(),
      metaDescription: metaDescription.trim(),
      metaKeywords: metaKeywords.trim(),
      contentSections: validContentSections,
      sections: validContentSections,
      faqSection: {
        heading: faqHeading.trim() || "Frequently Asked Questions",
        items: validFaqItems,
      },
      faqs: validFaqItems,
    };

    const res = await fetch(treatment ? `/api/admin/treatments/${treatment.id}` : "/api/admin/treatments", {
      method: treatment ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);

    const data = await res?.json().catch(() => ({}));
    setBusy(false);

    if (res?.ok) {
      setDirty(false);
      toast(treatment ? "Treatment updated successfully!" : "Treatment created successfully!");
      router.refresh();
      window.location.href = "/admin/treatments";
      return;
    }

    if (data?.issues) {
      setErrors(data.issues);
      const firstIssue = Object.values(data.issues).flat()[0];
      toast(firstIssue ? String(firstIssue) : "Please review the errors highlighted below.", "error");
    } else {
      toast(data?.error ?? "Save failed. Please try again.", "error");
    }
  }

  const selectedServiceObj = SERVICE_PRESETS.find((s) => s.id === serviceCategory) ?? SERVICE_PRESETS[0];

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-6xl pb-24">
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/treatments"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 shadow-2xs"
            title="Back to Treatments list"
          >
            <FaArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">
              {treatment ? "Edit Treatment" : "Add New Treatment"}
            </h1>
            <p className="text-[13px] text-gray-500">
              Map this treatment to exactly one service category and configure its clinical details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {treatment?.slug && (
            <a
              href={`/${serviceCategory}/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3.5 py-2 text-[13px] font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              <span>View Live</span>
              <FaArrowUpRightFromSquare className="size-3" />
            </a>
          )}
          <Link
            href="/admin/treatments"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-2 disabled:opacity-50 cursor-pointer"
          >
            <FaCheck className="size-3.5" />
            <span>{busy ? "Saving..." : treatment ? "Save Changes" : "Create Treatment"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Service Category Mapping (Strictly 1 Service) */}
          <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <FaLayerGroup className="size-4 text-brand" />
              <h2 className="text-[16px] font-bold text-gray-900">1. Service Mapping</h2>
              <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-full">
                Single Mapping Required
              </span>
            </div>
            <p className="text-[12.5px] text-gray-600 mb-4">
              Select the <strong>single service category</strong> this treatment belongs to. Each treatment maps to only one service.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_PRESETS.map((preset) => {
                const isSelected = serviceCategory === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => {
                      setServiceCategory(preset.id);
                      setDirty(true);
                    }}
                    className={`text-left rounded-xl p-3.5 border transition cursor-pointer relative ${isSelected
                      ? "border-brand bg-white ring-2 ring-brand/20 shadow-xs"
                      : "border-gray-200 bg-white/80 hover:border-teal-300 hover:bg-white"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[14px] font-bold text-gray-900">{preset.label}</span>
                      <span
                        className={`size-4 rounded-full border flex items-center justify-center ${isSelected ? "border-brand bg-brand text-white" : "border-gray-300"
                          }`}
                      >
                        {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.serviceCategory && (
              <p className="mt-2 text-[12px] text-red-600">{errors.serviceCategory[0]}</p>
            )}
          </div>

          {/* Card 2: Treatment Basic Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-[16px] font-bold text-gray-900 border-b border-gray-100 pb-2">
              2. Treatment Identification
            </h2>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">
                Treatment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. FUE Hair Transplant"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                required
              />
              {errors.title && <p className="mt-1 text-[12px] text-red-600">{errors.title[0]}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg border border-gray-300 focus-within:border-brand overflow-hidden">
                  <span className="bg-gray-50 px-2.5 py-2 text-[12px] text-gray-500 select-none border-r border-gray-200">
                    /{serviceCategory}/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      slugTouched.current = true;
                      setSlug(slugify(e.target.value));
                      setDirty(true);
                    }}
                    placeholder="fue-hair-transplant"
                    className="w-full bg-white px-2.5 py-2 text-[12.5px] font-mono outline-none"
                    required
                  />
                </div>
                {errors.slug && <p className="mt-1 text-[12px] text-red-600">{errors.slug[0]}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => {
                    setOrder(parseInt(e.target.value) || 1);
                    setDirty(true);
                  }}
                  min={1}
                  max={999}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">
                Summary / Short Description
              </label>
              <textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setDirty(true);
                }}
                rows={3}
                placeholder="A concise clinical overview of this treatment, procedure steps, and candidate criteria..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
              />
              {errors.summary && <p className="mt-1 text-[12px] text-red-600">{errors.summary[0]}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Publication Status</label>
              <div className="flex gap-4 pt-1">
                {(["published", "draft", "inactive"] as TreatmentStatus[]).map((st) => (
                  <label key={st} className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      checked={status === st}
                      onChange={() => {
                        setStatus(st);
                        setDirty(true);
                      }}
                      className="accent-brand size-4 cursor-pointer"
                    />
                    <span className="text-[13px] font-medium text-gray-700 capitalize">{st}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Featured Treatment Photo */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-[16px] font-bold text-gray-900 border-b border-gray-100 pb-2">
              3. Featured Photo / Card Image
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4">
                <div className="relative aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {image ? (
                    <Image src={image} alt="Treatment preview" fill className="object-cover" sizes="200px" />
                  ) : (
                    <span className="text-[11px] text-gray-400">No photo selected</span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="/images/treatments/hair-transplant.webp"
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[12px] font-mono outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs">
                    <FaCloudArrowUp className="size-3.5 text-brand" />
                    <span>{uploadingImage ? "Uploading..." : "Upload New Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageSelected}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <select
                    value={image}
                    onChange={(e) => {
                      if (e.target.value) {
                        setImage(e.target.value);
                        setDirty(true);
                      }
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="">Or Pick from Image Library</option>
                    {TREATMENT_IMAGE_PRESETS.map((p) => (
                      <option key={p.url} value={p.url}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: SEO Metadata */}
          <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs group" open>
            <summary className="flex items-center justify-between cursor-pointer font-bold text-[15px] text-gray-900 select-none">
              <span>4. Search Engine Optimization (SEO) &amp; Social Meta</span>
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
                  placeholder={title ? `${title} | Dr. Kumar's Clinic` : "Defaults to Treatment Title"}
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
                  placeholder="Concise clinical summary for Google search results (150-160 characters)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Meta Keywords</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => {
                    setMetaKeywords(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. hair transplant kondapur, FUE hair restoration, cost of hair transplant"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Comma-separated keywords for search engines and SEO ranking.
                </p>
              </div>
            </div>
          </details>

          {/* Card 5: Clinical Content Sections (Title + Rich Text Editor) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="size-4 text-brand" />
                  <h2 className="text-[16px] font-bold text-gray-900">
                    5. Clinical Content Sections
                  </h2>
                  <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    Rich Text Enabled
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">
                  Add content blocks for this treatment. Each section has its own title and full rich-text editor (formatting, lists, links, images).
                </p>
              </div>

              <button
                type="button"
                onClick={addContentSection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand border border-teal-200 hover:bg-teal-100 transition shadow-2xs cursor-pointer"
              >
                <FaPlus className="size-3" />
                <span>Add Section</span>
              </button>
            </div>

            {contentSections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
                  <FaLayerGroup className="size-5" />
                </span>
                <p className="text-[13.5px] font-medium text-gray-700">No content sections added yet</p>
                <p className="text-[12px] text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                  Add custom clinical sections such as Procedure Overview, Benefits, Candidate Criteria, or Aftercare.
                </p>
                <button
                  type="button"
                  onClick={addContentSection}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-2 transition shadow-xs cursor-pointer"
                >
                  <FaPlus className="size-3" />
                  <span>Add First Section</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {contentSections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-gray-300"
                  >
                    {/* Section Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-gray-200/80">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] font-bold text-gray-800">
                          {sec.title ? sec.title : `Section ${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveContentSection(idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                          className="size-7 rounded border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                        >
                          <FaArrowUp className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveContentSection(idx, 1)}
                          disabled={idx === contentSections.length - 1}
                          title="Move down"
                          className="size-7 rounded border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                        >
                          <FaArrowDown className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentSection(idx)}
                          title="Remove section"
                          className="size-7 rounded border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition cursor-pointer text-[11px] ml-1"
                        >
                          <FaTrash className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Section Title Input */}
                    <div className="mb-3">
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Section Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateContentSectionTitle(idx, e.target.value)}
                        placeholder="e.g. Procedure Steps & Clinical Method"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
                      />
                    </div>

                    {/* Section Rich Text Editor */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Section Content (Rich Text)
                      </label>
                      <RichTextEditor
                        value={sec.data}
                        onChange={(html) => updateContentSectionData(idx, html)}
                        minHeight={150}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addContentSection}
                  className="w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/50 py-3 text-[13px] font-semibold text-brand hover:bg-teal-100/70 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaPlus className="size-3.5" />
                  <span>Add Another Content Section</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 6: Frequently Asked Questions (FAQ) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FaCircleQuestion className="size-4 text-brand" />
                  <h2 className="text-[16px] font-bold text-gray-900">
                    6. Frequently Asked Questions (FAQ)
                  </h2>
                  <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    Interactive Accordion
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">
                  Add patient FAQs for this treatment. Rendered as an expandable accordion on the live treatment page with FAQPage schema for search engines.
                </p>
              </div>

              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand border border-teal-200 hover:bg-teal-100 transition shadow-2xs cursor-pointer"
              >
                <FaPlus className="size-3" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  FAQ Section Heading
                </label>
                <input
                  type="text"
                  value={faqHeading}
                  onChange={(e) => {
                    setFaqHeading(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Frequently Asked Questions"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
                />
              </div>

              {faqItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
                    <FaCircleQuestion className="size-5" />
                  </span>
                  <p className="text-[13.5px] font-medium text-gray-700">No FAQ questions added yet</p>
                  <p className="text-[12px] text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                    Add patient questions about recovery time, candidate eligibility, procedure discomfort, results timeline, and safety.
                  </p>
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-2 transition shadow-xs cursor-pointer"
                  >
                    <FaPlus className="size-3" />
                    <span>Add First FAQ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-gray-300 space-y-3"
                    >
                      {/* FAQ Header & Actions */}
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-6 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            Q{idx + 1}
                          </span>
                          <span className="text-[13px] font-semibold text-gray-800 truncate">
                            {item.question ? item.question : `Question ${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveFaqItem(idx, -1)}
                            disabled={idx === 0}
                            title="Move question up"
                            className="size-7 rounded border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                          >
                            <FaArrowUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaqItem(idx, 1)}
                            disabled={idx === faqItems.length - 1}
                            title="Move question down"
                            className="size-7 rounded border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                          >
                            <FaArrowDown className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaqItem(idx)}
                            title="Remove question"
                            className="size-7 rounded border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition cursor-pointer text-[11px] ml-1"
                          >
                            <FaTrash className="size-3" />
                          </button>
                        </div>
                      </div>

                      {/* Question Field */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                          Question <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(idx, { question: e.target.value })}
                          placeholder="e.g. Is the treatment painful or do you use local anaesthesia?"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
                        />
                      </div>

                      {/* Answer Field */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                          Answer / Clinical Guidance <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={item.answer}
                          onChange={(e) => updateFaqItem(idx, { answer: e.target.value })}
                          placeholder="Provide a clear, medically factual answer reassuring patients on what to expect..."
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 leading-relaxed outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/50 py-3 text-[13px] font-semibold text-brand hover:bg-teal-100/70 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaPlus className="size-3.5" />
                    <span>Add Another FAQ Question</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl bg-white p-4 shadow-md border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Live Card Preview
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time
              </span>
            </div>

            {/* Treatment Card Representation */}
            <div className="rounded-xl border border-teal-100 overflow-hidden bg-white shadow-xs">
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                {image ? (
                  <Image src={image} alt="Preview" fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400 text-[12px]">
                    No treatment photo
                  </div>
                )}
                {/* Mapped Service Pill */}
                <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10.5px] font-bold text-teal-800 shadow-xs border border-teal-100">
                  {selectedServiceObj.label}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-[15px] font-bold text-gray-900 leading-snug">
                  {title || "Treatment Title"}
                </h4>
                <p className="text-[12px] text-gray-600 line-clamp-3 leading-relaxed">
                  {summary || "Treatment summary and clinical overview will appear here..."}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[11px] font-mono text-gray-400">
                    /{serviceCategory}/{slug || "slug"}
                  </span>
                  <span className="rounded-lg bg-brand px-3 py-1 text-[11px] font-semibold text-white">
                    Know More
                  </span>
                </div>
              </div>
            </div>

            {/* Content Sections Live Preview */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-gray-700">
                  Content Sections Preview ({contentSections.length})
                </span>
                <span className="text-[10px] uppercase font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                  Formatted
                </span>
              </div>

              {contentSections.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-lg">
                  No content sections added yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {contentSections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs space-y-1.5"
                    >
                      <h5 className="text-[12.5px] font-bold text-gray-900 border-b border-gray-100 pb-1">
                        {sec.title || `Section ${idx + 1}`}
                      </h5>
                      {sec.data ? (
                        <div
                          className="blog-content text-[11.5px] text-gray-600 leading-relaxed max-h-32 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: sec.data }}
                        />
                      ) : (
                        <p className="text-[10.5px] text-gray-400 italic">No content written yet</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live FAQs Accordion Preview */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-gray-700">
                  FAQs Accordion Preview ({faqItems.length})
                </span>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Click to Test
                </span>
              </div>

              {faqItems.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-lg">
                  No FAQs added yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  <h5 className="text-[12.5px] font-bold text-brand pb-0.5">
                    {faqHeading || "Frequently Asked Questions"}
                  </h5>
                  {faqItems.map((item, idx) => {
                    const id = item.id || `faq-${idx}`;
                    const isOpen = previewOpenFaq === id;
                    return (
                      <div
                        key={id}
                        className="overflow-hidden border border-teal-100/80 rounded-xl shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewOpenFaq(isOpen ? null : id)}
                          className={`w-full flex items-center justify-between gap-3 p-2.5 text-left transition-colors cursor-pointer select-none text-[12px] font-bold leading-snug ${
                            isOpen
                              ? "bg-[#00695c] text-white"
                              : "bg-[#e8f7f5] text-gray-900 hover:bg-[#d8f2ee]"
                          }`}
                        >
                          <span className="line-clamp-2">{item.question || `Question ${idx + 1}`}</span>
                          <span
                            className={`size-3 shrink-0 transition-transform duration-200 text-[9px] ${
                              isOpen ? "rotate-90 text-white" : "text-teal-700"
                            }`}
                          >
                            ▶
                          </span>
                        </button>
                        {isOpen && (
                          <div className="bg-white p-2.5 text-[11.5px] text-gray-700 leading-relaxed border-t border-teal-100/60 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {item.answer || "No answer text entered yet."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-teal-50/70 p-3 text-[12px] text-teal-900 border border-teal-100">
              <p className="font-semibold mb-0.5">Mapped Service Rule:</p>
              <p className="text-[11.5px] text-teal-800 leading-relaxed">
                This treatment is exclusively associated with <strong>{selectedServiceObj.label}</strong>. When visitors explore {selectedServiceObj.label}, this treatment will appear in its services range.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
