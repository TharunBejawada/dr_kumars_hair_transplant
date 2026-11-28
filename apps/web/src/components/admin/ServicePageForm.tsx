"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaCalendarDays,
  FaCloudArrowUp,
  FaEye,
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaCheck,
  FaRegCalendarCheck,
} from "react-icons/fa6";
import {
  serviceCategories,
  type ServicePage,
  type ServicePageStatus,
  type ServiceCategoryId,
  type ConcernItem,
  type ServiceConcernsSection,
  type TreatmentCard,
  type ServiceTreatmentsSection,
  type FactorItem,
  type ServiceAssessmentSection,
  type ServiceDoctorSection,
  type ServiceContentSection,
  type ServiceFaqItem,
  type ServiceFaqSection,
} from "@drkumar/shared";
import { slugify } from "@/lib/ist";
import { uploadImage } from "@/lib/upload-client";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./Toast";

const statusHelp: Record<ServicePageStatus, string> = {
  draft: "Draft — only visible to admins.",
  published: "Published — live on the website right now.",
  inactive: "Inactive — hidden from public views.",
};

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

const TREATMENT_IMAGE_PRESETS = [
  { label: "Stem Cell Hair Therapy", url: "/images/treatments/stem-cell-therapy.webp" },
  { label: "Human-Derived Exosomes", url: "/images/treatments/human-exosomes.webp" },
  { label: "Dutasteride Mesotherapy", url: "/images/treatments/dutasteride-mesotherapy.webp" },
  { label: "Female Hair Transplant", url: "/images/treatments/female-hair-transplant.webp" },
  { label: "Hair Transplant", url: "/images/treatments/hair-transplant.webp" },
  { label: "GFC Hair Treatment", url: "/images/treatments/gfc-treatment.webp" },
  { label: "Hair Loss Treatment", url: "/images/treatments/hair-loss-treatment.webp" },
  { label: "Hair Transplant Clinic", url: "/images/treatments/hair-transplant-clinic.webp" },
];

const ASSESSMENT_IMAGE_PRESETS = [
  { label: "Doctor Scalp Examination (Default)", url: "/images/scalp-examination.webp" },
  { label: "Clinical Consultation", url: "/images/concerns/side-woman.webp" },
  { label: "Skin & Aesthetic Care", url: "/images/oval2.webp" },
];

const DOCTOR_IMAGE_PRESETS = [
  { label: "Dr. Ashok Kumar (Default)", url: "/images/doctor-specialist.webp" },
  { label: "Clinical Specialist (Woman)", url: "/images/concerns/side-woman.webp" },
  { label: "Scalp Examination", url: "/images/scalp-examination.webp" },
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
  const [image, setImage] = useState(page?.image ?? "");
  const [imageAlt, setImageAlt] = useState(page?.imageAlt ?? "");
  const ctaText = page?.ctaText ?? "Book a Consultation";
  const ctaLink = page?.ctaLink ?? "#appointment";

  // Section 2: Concerns & Treatment Approaches Fields
  const initConcerns = page?.concernsSection;
  const [concernsTagline, setConcernsTagline] = useState(initConcerns?.tagline ?? "");
  const [concernsHeading, setConcernsHeading] = useState(initConcerns?.heading ?? "");
  const [concernsDescription, setConcernsDescription] = useState(initConcerns?.description ?? "");
  const [concernItems, setConcernItems] = useState<ConcernItem[]>(initConcerns?.items ?? []);
  const [sideCardImage, setSideCardImage] = useState(initConcerns?.sideCard?.image ?? "");
  const [sideCardText1, setSideCardText1] = useState(initConcerns?.sideCard?.text1 ?? "");
  const [sideCardText2, setSideCardText2] = useState(initConcerns?.sideCard?.text2 ?? "");
  const [sideCardCtaText, setSideCardCtaText] = useState(initConcerns?.sideCard?.ctaText ?? "");
  const [sideCardCtaLink, setSideCardCtaLink] = useState(initConcerns?.sideCard?.ctaLink ?? "");

  // Section 3: Treatments / Services Range Grid Fields
  const initTreatments = page?.treatmentsSection;
  const [treatmentsTagline, setTreatmentsTagline] = useState(initTreatments?.tagline ?? "");
  const [treatmentsHeading, setTreatmentsHeading] = useState(initTreatments?.heading ?? "");
  const [treatmentsDescription, setTreatmentsDescription] = useState(initTreatments?.description ?? "");
  const [treatmentItems, setTreatmentItems] = useState<TreatmentCard[]>(initTreatments?.items ?? []);
  const [viewMoreText, setViewMoreText] = useState(initTreatments?.viewMoreText ?? "");
  const [viewMoreLink, setViewMoreLink] = useState(initTreatments?.viewMoreLink ?? "");
  const [uploadingTreatmentIdx, setUploadingTreatmentIdx] = useState<number | null>(null);

  // Section 4: Treatment Selection & Clinical Factors Fields
  const initAssessment = page?.assessmentSection;
  const [assessmentTagline, setAssessmentTagline] = useState(initAssessment?.tagline ?? "");
  const [assessmentHeading, setAssessmentHeading] = useState(initAssessment?.heading ?? "");
  const [assessmentDescription, setAssessmentDescription] = useState(initAssessment?.description ?? "");
  const [assessmentFactorsLead, setAssessmentFactorsLead] = useState(initAssessment?.factorsLead ?? "");
  const [assessmentFactors, setAssessmentFactors] = useState<FactorItem[]>(initAssessment?.factors ?? []);
  const [assessmentNote, setAssessmentNote] = useState(initAssessment?.note ?? "");
  const [assessmentImage, setAssessmentImage] = useState(initAssessment?.image ?? "");
  const [assessmentImageAlt, setAssessmentImageAlt] = useState(initAssessment?.imageAlt ?? "");
  const [assessmentCtaText, setAssessmentCtaText] = useState(initAssessment?.ctaText ?? "");
  const [assessmentCtaLink, setAssessmentCtaLink] = useState(initAssessment?.ctaLink ?? "");
  const [uploadingAssessmentImage, setUploadingAssessmentImage] = useState(false);

  // Section 5: Specialist / Doctor Profile Fields
  const initDoctor = page?.doctorSection;
  const [doctorTagline, setDoctorTagline] = useState(initDoctor?.tagline ?? "");
  const [doctorName, setDoctorName] = useState(initDoctor?.name ?? "");
  const [doctorDesignation, setDoctorDesignation] = useState(initDoctor?.designation ?? "");
  const [doctorExperience, setDoctorExperience] = useState(initDoctor?.experience ?? "");
  const [doctorBioText, setDoctorBioText] = useState(
    initDoctor?.bioParagraphs && initDoctor.bioParagraphs.length > 0 ? initDoctor.bioParagraphs.join("\n\n") : ""
  );
  const [doctorImage, setDoctorImage] = useState(initDoctor?.image ?? "");
  const [doctorImageAlt, setDoctorImageAlt] = useState(initDoctor?.imageAlt ?? "");
  const [doctorCtaText, setDoctorCtaText] = useState(initDoctor?.ctaText ?? "");
  const [doctorCtaLink, setDoctorCtaLink] = useState(initDoctor?.ctaLink ?? "");
  const [uploadingDoctorImage, setUploadingDoctorImage] = useState(false);

  // Dynamic Content Sections (Above FAQs) Fields
  const [contentSections, setContentSections] = useState<ServiceContentSection[]>(page?.contentSections ?? []);

  // Section 6: Frequently Asked Questions (FAQ) Fields
  const initFaq = page?.faqSection;
  const [faqHeading, setFaqHeading] = useState(initFaq?.heading ?? "");
  const [faqItems, setFaqItems] = useState<ServiceFaqItem[]>(initFaq?.items ?? []);

  // Preview tab selection
  const [previewTab, setPreviewTab] = useState<"section1" | "section2" | "section3" | "section4" | "section5" | "content" | "section6" | "full">("full");
  const [previewOpenFaq, setPreviewOpenFaq] = useState<string | null>(null); // Initially all questions closed

  // Publishing & SEO
  const [status, setStatus] = useState<ServicePageStatus>(page?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(page?.metaKeywords ?? "");

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
    const localPreview = URL.createObjectURL(f);
    setImage(localPreview);
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
    const localPreview = URL.createObjectURL(f);
    setSideCardImage(localPreview);
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
    const localPreview = URL.createObjectURL(f);
    setConcernItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], image: localPreview };
      return copy;
    });
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
        title: "",
        image: "",
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

  // Section 3: Treatments List Handlers
  function addTreatmentCard() {
    setTreatmentItems((prev) => [
      ...prev,
      {
        id: "ht_" + Math.random().toString(36).slice(2, 7),
        title: "",
        description: "",
        image: "",
        ctaText: "",
        ctaLink: "",
      },
    ]);
    setDirty(true);
  }

  function removeTreatmentCard(idx: number) {
    setTreatmentItems((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateTreatmentCard(idx: number, patch: Partial<TreatmentCard>) {
    setTreatmentItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
    setDirty(true);
  }

  async function onTreatmentFileSelected(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const localPreview = URL.createObjectURL(f);
    updateTreatmentCard(idx, { image: localPreview });
    setUploadingTreatmentIdx(idx);
    try {
      const publicPath = await uploadImage(f);
      updateTreatmentCard(idx, { image: publicPath });
      toast("Treatment card image uploaded!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingTreatmentIdx(null);
      e.target.value = "";
    }
  }

  // Section 4: Treatment Selection Handlers
  function addFactor() {
    setAssessmentFactors((prev) => [
      ...prev,
      {
        id: "f_" + Math.random().toString(36).slice(2, 7),
        text: "",
      },
    ]);
    setDirty(true);
  }

  function removeFactor(idx: number) {
    setAssessmentFactors((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateFactor(idx: number, text: string) {
    setAssessmentFactors((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
    setDirty(true);
  }

  async function onAssessmentImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const localPreview = URL.createObjectURL(f);
    setAssessmentImage(localPreview);
    setUploadingAssessmentImage(true);
    try {
      const publicPath = await uploadImage(f);
      setAssessmentImage(publicPath);
      setDirty(true);
      toast("Clinical assessment photo uploaded!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingAssessmentImage(false);
      e.target.value = "";
    }
  }

  async function onDoctorImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const localPreview = URL.createObjectURL(f);
    setDoctorImage(localPreview);
    setUploadingDoctorImage(true);
    try {
      const publicPath = await uploadImage(f);
      setDoctorImage(publicPath);
      setDirty(true);
      toast("Doctor portrait photo uploaded!");
    } catch (x) {
      toast(x instanceof Error ? x.message : "Upload failed", "error");
    } finally {
      setUploadingDoctorImage(false);
      e.target.value = "";
    }
  }

  // Dynamic Content Sections Handlers (Above FAQs)
  function addContentSection() {
    setContentSections((prev) => [
      ...prev,
      {
        id: "sec_" + Math.random().toString(36).slice(2, 7),
        title: "",
        description: "",
      },
    ]);
    setDirty(true);
  }

  function removeContentSection(idx: number) {
    setContentSections((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function updateContentSection(idx: number, patch: Partial<ServiceContentSection>) {
    setContentSections((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
    setDirty(true);
  }

  function moveContentSection(idx: number, dir: -1 | 1) {
    setContentSections((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setDirty(true);
  }

  // Section 6: FAQ Handlers
  function addFaqItem() {
    setFaqItems((prev) => [
      ...prev,
      {
        id: "faq_" + Math.random().toString(36).slice(2, 7),
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

  function updateFaqItem(idx: number, patch: Partial<ServiceFaqItem>) {
    setFaqItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const hasConcernsData =
      concernsHeading.trim().length > 0 ||
      concernsTagline.trim().length > 0 ||
      concernsDescription.trim().length > 0 ||
      concernItems.some((c) => c.title.trim().length > 0);

    const concernsSection: ServiceConcernsSection | undefined = hasConcernsData
      ? {
          tagline: concernsTagline.trim(),
          heading: concernsHeading.trim(),
          description: concernsDescription.trim(),
          items: concernItems.filter((c) => c.title.trim().length > 0),
          sideCard: {
            image: sideCardImage,
            text1: sideCardText1.trim(),
            text2: sideCardText2.trim(),
            ctaText: sideCardCtaText.trim(),
            ctaLink: sideCardCtaLink.trim(),
          },
        }
      : undefined;

    const hasTreatmentsData =
      treatmentsHeading.trim().length > 0 ||
      treatmentsTagline.trim().length > 0 ||
      treatmentsDescription.trim().length > 0 ||
      treatmentItems.some((t) => t.title.trim().length > 0);

    const treatmentsSection: ServiceTreatmentsSection | undefined = hasTreatmentsData
      ? {
          tagline: treatmentsTagline.trim(),
          heading: treatmentsHeading.trim(),
          description: treatmentsDescription.trim(),
          items: treatmentItems.filter((t) => t.title.trim().length > 0),
          viewMoreText: viewMoreText.trim(),
          viewMoreLink: viewMoreLink.trim(),
        }
      : undefined;

    const hasAssessmentData =
      assessmentHeading.trim().length > 0 ||
      assessmentTagline.trim().length > 0 ||
      assessmentDescription.trim().length > 0 ||
      assessmentFactors.some((f) => f.text.trim().length > 0);

    const assessmentSection: ServiceAssessmentSection | undefined = hasAssessmentData
      ? {
          tagline: assessmentTagline.trim(),
          heading: assessmentHeading.trim(),
          description: assessmentDescription.trim(),
          factorsLead: assessmentFactorsLead.trim(),
          factors: assessmentFactors.filter((f) => f.text.trim().length > 0),
          note: assessmentNote.trim(),
          image: assessmentImage,
          imageAlt: assessmentImageAlt.trim(),
          ctaText: assessmentCtaText.trim(),
          ctaLink: assessmentCtaLink.trim(),
        }
      : undefined;

    const hasDoctorData = doctorName.trim().length > 0;
    const doctorSection: ServiceDoctorSection | undefined = hasDoctorData
      ? {
          tagline: doctorTagline.trim(),
          name: doctorName.trim(),
          designation: doctorDesignation.trim(),
          experience: doctorExperience.trim(),
          bioParagraphs: doctorBioText
            .split("\n\n")
            .map((p) => p.trim())
            .filter((p) => p.length > 0),
          image: doctorImage,
          imageAlt: doctorImageAlt.trim(),
          ctaText: doctorCtaText.trim(),
          ctaLink: doctorCtaLink.trim(),
        }
      : undefined;

    const validContentSections = contentSections
      .map((s) => ({
        id: s.id || "sec_" + Math.random().toString(36).slice(2, 7),
        title: s.title.trim(),
        description: s.description.trim(),
      }))
      .filter((s) => s.title.length > 0 || s.description.length > 0);

    const validFaqs = faqItems.filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0);
    const hasFaqData = faqHeading.trim().length > 0 || validFaqs.length > 0;
    const faqSection: ServiceFaqSection | undefined = hasFaqData
      ? {
          heading: faqHeading.trim(),
          items: validFaqs,
        }
      : undefined;

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
      metaKeywords: metaKeywords.trim(),
      ...(concernsSection ? { concernsSection } : {}),
      ...(treatmentsSection ? { treatmentsSection } : {}),
      ...(assessmentSection ? { assessmentSection } : {}),
      ...(doctorSection ? { doctorSection } : {}),
      contentSections: validContentSections,
      ...(faqSection ? { faqSection } : {}),
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
              href={`/${slug}`}
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
            className={`rounded-lg border px-3 py-2 text-[13px] font-semibold outline-none transition ${status === "published"
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
                      className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition border ${active
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
                  <span>/</span>
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="Preview" className="h-full w-full object-cover" />
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
                  Section 2 Description (Rich Text)
                </label>
                <RichTextEditor
                  value={concernsDescription}
                  onChange={(html) => {
                    setConcernsDescription(html);
                    setDirty(true);
                  }}
                  minHeight={120}
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
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
                  <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-teal-200 bg-white flex items-center justify-center">
                    {sideCardImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sideCardImage} alt="Card image" className="h-full w-full object-cover object-top" />
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

          {/* Card 3: Section 3 - Treatments / Services Range Grid */}
          <section className="rounded-xl bg-white p-5 shadow-sm border-2 border-brand/30">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Section 3
                </span>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Treatments / Services Range Grid
                </h2>
              </div>
              <span className="text-[12px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-600/20">
                New Section
              </span>
            </div>

            {/* Section 3 Tagline, Heading & Intro */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 3 Tagline / Badge
                </label>
                <input
                  type="text"
                  value={treatmentsTagline}
                  onChange={(e) => {
                    setTreatmentsTagline(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. Our Hair Treatments"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] font-medium text-brand outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 3 Main Heading *
                </label>
                <input
                  type="text"
                  value={treatmentsHeading}
                  onChange={(e) => {
                    setTreatmentsHeading(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. Explore Our Range of Hair Restoration Services"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] font-bold text-gray-900 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section 3 Description (Rich Text)
                </label>
                <RichTextEditor
                  value={treatmentsDescription}
                  onChange={(html) => {
                    setTreatmentsDescription(html);
                    setDirty(true);
                  }}
                  minHeight={120}
                />
              </div>
            </div>

            {/* Treatment Cards Manager */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">
                    Treatment Cards ({treatmentItems.length} items)
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Displayed in a responsive 4-column service catalog with photos, descriptions &amp; CTA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTreatmentCard}
                  className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-[12px] font-semibold text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                >
                  <FaPlus className="size-3" /> Add Treatment
                </button>
              </div>

              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {treatmentItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 transition hover:border-teal-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      {/* Image Thumbnail & Upload */}
                      <div className="relative aspect-[16/10] w-28 shrink-0 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-2xs">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateTreatmentCard(idx, { title: e.target.value })}
                            placeholder="Treatment Title"
                            className="w-full rounded border border-gray-300 bg-white px-2.5 py-1 text-[13.5px] font-bold text-gray-900 outline-none focus:border-brand"
                          />
                          <button
                            type="button"
                            onClick={() => removeTreatmentCard(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition shrink-0"
                            title="Remove card"
                          >
                            <FaTrash className="size-3.5" />
                          </button>
                        </div>

                        <textarea
                          value={item.description}
                          onChange={(e) => updateTreatmentCard(idx, { description: e.target.value })}
                          rows={2}
                          placeholder="Brief description of clinical procedure..."
                          className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[12.5px] text-gray-700 outline-none focus:border-brand"
                        />

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px]">
                          <label className="cursor-pointer font-semibold text-brand hover:underline inline-flex items-center gap-1">
                            <FaCloudArrowUp className="size-3" />
                            <span>{uploadingTreatmentIdx === idx ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => onTreatmentFileSelected(idx, e)}
                              disabled={uploadingTreatmentIdx === idx}
                            />
                          </label>

                          <span className="text-gray-300">·</span>

                          <select
                            value={item.image}
                            onChange={(e) => updateTreatmentCard(idx, { image: e.target.value })}
                            className="text-[11.5px] text-gray-600 bg-transparent border-none outline-none max-w-[150px] truncate cursor-pointer hover:text-gray-900"
                          >
                            <option value="">Preset Photo</option>
                            {TREATMENT_IMAGE_PRESETS.map((p) => (
                              <option key={p.url} value={p.url}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action Button Link & Label ("Know More") */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/80">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                              Action Button Text
                            </label>
                            <input
                              type="text"
                              value={item.ctaText ?? ""}
                              onChange={(e) => updateTreatmentCard(idx, { ctaText: e.target.value })}
                              placeholder="Know More"
                              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[12px] outline-none focus:border-brand"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                              Action Button Link
                            </label>
                            <input
                              type="text"
                              value={item.ctaLink ?? ""}
                              onChange={(e) => updateTreatmentCard(idx, { ctaLink: e.target.value })}
                              placeholder="e.g. #appointment or /services/..."
                              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[12px] font-mono outline-none focus:border-brand"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom View More Button Settings */}
            <div className="mt-5 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                  Bottom Action Button Text
                </label>
                <input
                  type="text"
                  value={viewMoreText}
                  onChange={(e) => {
                    setViewMoreText(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="View More"
                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                  Bottom Action Button Link
                </label>
                <input
                  type="text"
                  value={viewMoreLink}
                  onChange={(e) => {
                    setViewMoreLink(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="#appointment"
                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Treatment Selection & Clinical Factors */}
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Section 4
                </span>
                <h2 className="text-[17px] font-bold text-gray-900 mt-1">
                  Treatment Selection &amp; Clinical Factors
                </h2>
                <p className="text-[12.5px] text-gray-500">
                  Doctor evaluation photo, factors checklist pills &amp; personalised clinical guidance note.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tagline */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Category Tagline</label>
                <input
                  type="text"
                  value={assessmentTagline}
                  onChange={(e) => {
                    setAssessmentTagline(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Which Hair Treatment Is Right for You?"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
              </div>

              {/* Heading */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Section Heading *</label>
                <input
                  type="text"
                  value={assessmentHeading}
                  onChange={(e) => {
                    setAssessmentHeading(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="The Right Solution Begins With Understanding Your Hair Loss"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Section Description (Rich Text)
                </label>
                <RichTextEditor
                  value={assessmentDescription}
                  onChange={(html) => {
                    setAssessmentDescription(html);
                    setDirty(true);
                  }}
                  minHeight={120}
                />
              </div>

              {/* Left Column Image Picker */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                <label className="mb-1 block text-[13px] font-semibold text-gray-800">
                  Left Column Clinical Examination Photo
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative aspect-[4/3.8] w-24 shrink-0 rounded-xl overflow-hidden border border-gray-300 bg-white shadow-2xs">
                    {assessmentImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={assessmentImage} alt="Assessment" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-[12px]">
                      <label className="cursor-pointer font-semibold text-brand hover:underline inline-flex items-center gap-1.5">
                        <FaCloudArrowUp className="size-3.5" />
                        <span>{uploadingAssessmentImage ? "Uploading..." : "Upload New Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onAssessmentImageSelected}
                          disabled={uploadingAssessmentImage}
                        />
                      </label>
                      <span className="text-gray-300">·</span>
                      <select
                        value={assessmentImage}
                        onChange={(e) => {
                          setAssessmentImage(e.target.value);
                          setDirty(true);
                        }}
                        className="text-[12px] text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 outline-none hover:border-brand"
                      >
                        <option value="">Preset Images</option>
                        {ASSESSMENT_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={assessmentImage}
                      onChange={(e) => {
                        setAssessmentImage(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Or enter image URL path (/images/...)"
                      className="w-full rounded border border-gray-300 bg-white px-2.5 py-1 text-[12px] font-mono outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Factors Lead-in Text */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Factors Lead-in Text</label>
                <input
                  type="text"
                  value={assessmentFactorsLead}
                  onChange={(e) => {
                    setAssessmentFactorsLead(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Several factors influence treatment selection:"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
              </div>

              {/* Factors Checklist Manager */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[13.5px] font-bold text-gray-900">
                      Factors Influencing Treatment Selection ({assessmentFactors.length})
                    </h3>
                    <p className="text-[11.5px] text-gray-500">
                      Renders as full-width interactive pills with teal accent indicators.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFactor}
                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-[12px] font-semibold text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                  >
                    <FaPlus className="size-3" /> Add Factor
                  </button>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {assessmentFactors.map((factor, idx) => (
                    <div key={factor.id || idx} className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-200 px-3 py-1.5 shadow-2xs">
                      <span className="h-3.5 w-1 rounded-full bg-brand shrink-0" />
                      <input
                        type="text"
                        value={factor.text}
                        onChange={(e) => updateFactor(idx, e.target.value)}
                        placeholder="e.g. Type and severity of hair loss"
                        className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeFactor(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 transition"
                        title="Remove factor"
                      >
                        <FaTrash className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Note / Doctor Summary */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Clinical Recommendation Note
                </label>
                <textarea
                  value={assessmentNote}
                  onChange={(e) => {
                    setAssessmentNote(e.target.value);
                    setDirty(true);
                  }}
                  rows={3}
                  placeholder="At Dr. Kumar’s Skin & Hair Transplant Center, we assess these factors..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand leading-relaxed"
                />
              </div>

              {/* Optional CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                    Optional Action Button Text
                  </label>
                  <input
                    type="text"
                    value={assessmentCtaText}
                    onChange={(e) => {
                      setAssessmentCtaText(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="e.g. Book Scalp Assessment (or leave blank)"
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                    Action Button Link
                  </label>
                  <input
                    type="text"
                    value={assessmentCtaLink}
                    onChange={(e) => {
                      setAssessmentCtaLink(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="#appointment"
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Specialist / Doctor Profile */}
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Section 5
                </span>
                <h2 className="text-[17px] font-bold text-gray-900 mt-1">
                  Specialist / Doctor Profile
                </h2>
                <p className="text-[12.5px] text-gray-500">
                  Doctor portrait with stylized backdrop, credentials header, clinical bio &amp; direct appointment CTA.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tagline */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Section Title / Tagline</label>
                <input
                  type="text"
                  value={doctorTagline}
                  onChange={(e) => {
                    setDoctorTagline(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Meet Your Hair Restoration Specialist"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-semibold outline-none focus:border-brand"
                />
              </div>

              {/* Doctor Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-gray-700">Doctor Name *</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => {
                      setDoctorName(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="Dr. Ashok Kumar"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-bold outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-gray-700">Designation / Specialty</label>
                  <input
                    type="text"
                    value={doctorDesignation}
                    onChange={(e) => {
                      setDoctorDesignation(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="Dermatologist | Hair Transplant Specialist"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Clinical Experience Badge</label>
                <input
                  type="text"
                  value={doctorExperience}
                  onChange={(e) => {
                    setDoctorExperience(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="13+ Years of Experience"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-semibold text-brand outline-none focus:border-brand"
                />
              </div>

              {/* Doctor Portrait Image Picker */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                <label className="mb-1 block text-[13px] font-semibold text-gray-800">
                  Doctor Portrait Photo (Cutout)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative aspect-[4/4] w-24 shrink-0 rounded-xl overflow-hidden border border-gray-300 bg-white shadow-2xs">
                    {doctorImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={doctorImage} alt="Doctor" className="h-full w-full object-contain object-bottom" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-[12px]">
                      <label className="cursor-pointer font-semibold text-brand hover:underline inline-flex items-center gap-1.5">
                        <FaCloudArrowUp className="size-3.5" />
                        <span>{uploadingDoctorImage ? "Uploading..." : "Upload New Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onDoctorImageSelected}
                          disabled={uploadingDoctorImage}
                        />
                      </label>
                      <span className="text-gray-300">·</span>
                      <select
                        value={doctorImage}
                        onChange={(e) => {
                          setDoctorImage(e.target.value);
                          setDirty(true);
                        }}
                        className="text-[12px] text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 outline-none hover:border-brand"
                      >
                        <option value="">Preset Images</option>
                        {DOCTOR_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={doctorImage}
                      onChange={(e) => {
                        setDoctorImage(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Or enter image URL path (/images/...)"
                      className="w-full rounded border border-gray-300 bg-white px-2.5 py-1 text-[12px] font-mono outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Paragraphs */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                  Doctor Clinical Bio (Separate paragraphs with an empty line)
                </label>
                <textarea
                  value={doctorBioText}
                  onChange={(e) => {
                    setDoctorBioText(e.target.value);
                    setDirty(true);
                  }}
                  rows={6}
                  placeholder="Enter detailed bio paragraphs..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand leading-relaxed"
                />
              </div>

              {/* Consultation CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={doctorCtaText}
                    onChange={(e) => {
                      setDoctorCtaText(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="Book a Consultation With Dr. Ashok Kumar"
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-gray-700">
                    Button Action Link
                  </label>
                  <input
                    type="text"
                    value={doctorCtaLink}
                    onChange={(e) => {
                      setDoctorCtaLink(e.target.value);
                      setDirty(true);
                    }}
                    placeholder="#appointment"
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Content Sections (Above FAQs) */}
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Content Sections (Above FAQs)
                </span>
                <h2 className="text-[17px] font-bold text-gray-900 mt-1">
                  Additional Content Sections
                </h2>
                <p className="text-[12.5px] text-gray-500">
                  Rich text sections with custom titles and formatting placed directly above FAQs.
                </p>
              </div>

              <button
                type="button"
                onClick={addContentSection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-brand-2 transition shadow-xs cursor-pointer"
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
                  Add custom rich-text sections such as Clinical Insights, Treatment Methodology, or Care Guidelines.
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
                    {/* Header */}
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

                    {/* Title */}
                    <div className="mb-3">
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateContentSection(idx, { title: e.target.value })}
                        placeholder="e.g. Clinical Examination & Procedure Methodology"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
                      />
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Section Description (Rich Text)
                      </label>
                      <RichTextEditor
                        value={sec.description}
                        onChange={(html) => updateContentSection(idx, { description: html })}
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
          </section>

          {/* Section 6: Frequently Asked Questions (FAQ) */}
          <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Section 6
                </span>
                <h2 className="text-[17px] font-bold text-gray-900 mt-1">
                  Frequently Asked Questions (FAQ)
                </h2>
                <p className="text-[12.5px] text-gray-500">
                  Interactive 2-column accordion questions. All questions start closed by default.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Heading */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Section Heading</label>
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

              {/* FAQ Items Manager */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[13.5px] font-bold text-gray-900">
                      Questions &amp; Answers ({faqItems.length})
                    </h3>
                    <p className="text-[11.5px] text-gray-500">
                      Arranged in an interactive 2-column expandable layout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-[12px] font-semibold text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                  >
                    <FaPlus className="size-3" /> Add FAQ
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {faqItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border border-gray-200 bg-white p-3 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          Q{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(idx, { question: e.target.value })}
                          placeholder="Enter patient question..."
                          className="flex-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-[13px] font-semibold text-gray-900 outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={() => removeFaqItem(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 transition shrink-0"
                          title="Remove question"
                        >
                          <FaTrash className="size-3" />
                        </button>
                      </div>

                      <textarea
                        value={item.answer}
                        onChange={(e) => updateFaqItem(idx, { answer: e.target.value })}
                        rows={2}
                        placeholder="Enter clinical answer and recommendations..."
                        className="w-full rounded border border-gray-300 bg-white px-2.5 py-1 text-[12.5px] text-gray-700 outline-none focus:border-brand"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 Placeholder for Subsequent Requests */}
          <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5 text-center">
            <div className="mx-auto max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 mb-2">
                Upcoming
              </span>
              <h3 className="text-[15px] font-semibold text-gray-800">
                Ready for Section 7
              </h3>
              <p className="mt-1 text-[12px] text-gray-500">
                Sections 1 through 6 are all live and configured. Provide Section 7 next and we will integrate it!
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
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700">Meta Keywords</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => {
                    setMetaKeywords(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="e.g. hair loss treatment, hair transplant hyderabad, best doctor"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Comma-separated keywords for search engines and SEO ranking.
                </p>
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
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mb-3 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setPreviewTab("full")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "full" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Full Page
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section1")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section1" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Hero
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section2")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section2" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Concerns
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section3")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section3" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Treatments
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section4")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section4" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Selection
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section5")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section5" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Specialist
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("content")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "content" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Content
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("section6")}
                className={`rounded py-1 text-[11px] font-bold transition ${previewTab === "section6" ? "bg-white text-brand shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                FAQs
              </button>
            </div>

            {/* Preview Container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm space-y-2 bg-white">
              {/* SECTION 1 LIVE PREVIEW */}
              {(previewTab === "section1" || previewTab === "full") && (
                <div className="relative overflow-hidden p-5 border-b border-teal-100 min-h-[220px] flex items-center bg-[#d8f5f1]">
                  {/* Background Image Layer */}
                  {image && (
                    <div className="absolute inset-0 z-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="Preview"
                        className="h-full w-full object-cover object-right"
                      />
                    </div>
                  )}

                  {/* Soft text backdrop gradient strictly on left */}
                  <div
                    className="absolute inset-0 z-10 bg-gradient-to-r from-[#d8f5f1]/90 via-[#d8f5f1]/40 to-transparent via-40% to-60% pointer-events-none"
                    aria-hidden
                  />

                  {/* Text Content */}
                  <div className="relative z-20 flex flex-col gap-2 max-w-[70%]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded w-fit">
                      Section 1 · Hero Banner
                    </span>
                    <h1 className="text-[16px] sm:text-[18px] font-bold leading-tight text-[#101828]">
                      {title || "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad"}
                    </h1>
                    <p className="text-[12px] sm:text-[13px] font-semibold text-brand leading-snug">
                      {subtitle || "Personalised Care for Hair Fall, Thinning Hair & Baldness"}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                        <FaCalendarDays className="size-3" />
                        <span>Book a Consultation</span>
                      </span>
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
                    {concernsTagline && (
                      <h3 className="text-[16px] font-bold text-brand leading-snug">
                        {concernsTagline}
                      </h3>
                    )}
                    <h4 className="text-[15px] font-bold text-[#111828] leading-tight mt-1">
                      {concernsHeading || "Understanding Your Concerns"}
                    </h4>
                    {concernsDescription && (
                      <div
                        className="blog-content text-[12px] text-gray-600 mt-1 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: concernsDescription }}
                      />
                    )}
                  </div>

                  {/* Concerns Circles Mockup */}
                  {concernItems.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {concernItems.slice(0, 8).map((item) => (
                        <div key={item.id} className="flex flex-col items-center text-center">
                          <div className="relative size-12 rounded-full overflow-hidden border border-teal-200 bg-teal-50 shadow-xs flex items-center justify-center">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-teal-100/50 flex items-center justify-center text-[9px] text-teal-600">●</div>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-800 line-clamp-2 mt-1 leading-tight">
                            {item.title || "Concern"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No concerns added yet
                    </p>
                  )}

                  {/* Right Side Card Mockup */}
                  {(sideCardText1 || sideCardText2 || sideCardImage) && (
                    <div className="rounded-xl bg-[#ecfaf7] border border-[#cbece6] p-3.5 space-y-2 mt-3">
                      {sideCardImage && (
                        <div className="relative w-full h-28 rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sideCardImage} alt="Specialist" className="h-full w-full object-cover object-top" />
                        </div>
                      )}
                      {sideCardText1 && <p className="text-[11.5px] text-gray-700 line-clamp-2">{sideCardText1}</p>}
                      {sideCardText2 && (
                        <p className="text-[11.5px] text-gray-700 line-clamp-2">
                          <span className="font-semibold text-brand">At Dr. Kumar’s: </span>
                          {sideCardText2}
                        </p>
                      )}
                      <span className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-[11px] font-semibold text-white shadow-xs">
                        {sideCardCtaText || "Consult Our Specialist"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3 LIVE PREVIEW */}
              {(previewTab === "section3" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-white space-y-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Section 3 · Treatment Range
                  </span>

                  <div className="text-center">
                    {treatmentsTagline && (
                      <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                        {treatmentsTagline}
                      </span>
                    )}
                    <h4 className="text-[15px] font-bold text-[#111828] leading-tight mt-0.5">
                      {treatmentsHeading || "Explore Our Range of Services"}
                    </h4>
                    {treatmentsDescription && (
                      <div
                        className="blog-content text-[11.5px] text-gray-600 mt-1 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: treatmentsDescription }}
                      />
                    )}
                  </div>

                  {/* 4-column Treatment Cards Mockup */}
                  {treatmentItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {treatmentItems.slice(0, 8).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col overflow-hidden rounded-xl border border-teal-200/60 bg-white shadow-2xs"
                        >
                          <div className="relative aspect-[16/10] w-full bg-gray-50 overflow-hidden flex items-center justify-center">
                            {item.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="p-2 flex flex-1 flex-col justify-between">
                            <div>
                              <h5 className="text-[10.5px] font-bold text-brand leading-tight line-clamp-1">
                                {item.title || "Treatment"}
                              </h5>
                              {item.description && (
                                <p className="text-[9.5px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="mt-2 inline-flex items-center justify-center rounded bg-brand px-2 py-0.5 text-[9px] font-semibold text-white w-fit">
                              {item.ctaText || "Know More"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No treatments added yet
                    </p>
                  )}

                  {viewMoreText && (
                    <div className="text-center pt-1">
                      <span className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-1.5 text-[11px] font-semibold text-white shadow-2xs">
                        {viewMoreText}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4 LIVE PREVIEW */}
              {(previewTab === "section4" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-[#f0faf9] space-y-3.5 border-t border-teal-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Section 4 · Treatment Selection
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Left Scalp Image */}
                    {assessmentImage && (
                      <div className="sm:col-span-5 flex justify-center">
                        <div className="relative w-full aspect-[4/3.8] rounded-xl overflow-hidden border border-white shadow-xs bg-white flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={assessmentImage} alt="Assessment" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}

                    {/* Right Content */}
                    <div className={`${assessmentImage ? "sm:col-span-7" : "sm:col-span-12"} space-y-1.5`}>
                      {assessmentTagline && (
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                          {assessmentTagline}
                        </span>
                      )}
                      <h4 className="text-[13px] font-bold text-[#111828] leading-tight">
                        {assessmentHeading || "Treatment Selection & Clinical Factors"}
                      </h4>
                      {assessmentDescription && (
                        <div
                          className="blog-content text-[10.5px] text-gray-600 line-clamp-3 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: assessmentDescription }}
                        />
                      )}

                      {assessmentFactorsLead && (
                        <p className="text-[10px] font-semibold text-gray-700 pt-0.5">
                          {assessmentFactorsLead}
                        </p>
                      )}

                      {/* Factors Pills */}
                      {assessmentFactors.length > 0 ? (
                        <div className="space-y-1 pt-0.5">
                          {assessmentFactors.slice(0, 5).map((f, i) => (
                            <div key={f.id || i} className="flex items-center gap-1.5 bg-white rounded-full border border-teal-100 px-2.5 py-0.5 text-[9.5px] text-teal-900 font-medium">
                              <span className="h-2 w-0.5 rounded-full bg-brand shrink-0" />
                              <span className="truncate">{f.text || "Factor"}</span>
                            </div>
                          ))}
                          {assessmentFactors.length > 5 && (
                            <p className="text-[9px] text-gray-400 pl-2">+{assessmentFactors.length - 5} more factors</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic py-1">No factors added yet</p>
                      )}

                      {assessmentCtaText && (
                        <div className="pt-1">
                          <span className="inline-flex items-center justify-center rounded bg-brand px-2.5 py-1 text-[9.5px] font-semibold text-white">
                            {assessmentCtaText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5 LIVE PREVIEW */}
              {(previewTab === "section5" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-white space-y-3.5 border-t border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Section 5 · Specialist Profile
                  </span>

                  {doctorTagline && (
                    <h4 className="text-[13px] font-bold text-brand leading-snug">
                      {doctorTagline}
                    </h4>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Left Doctor Photo */}
                    {doctorImage && (
                      <div className="sm:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[180px] flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doctorImage} alt="Doctor" className="w-full h-auto object-contain" />
                        </div>
                      </div>
                    )}

                    {/* Right Content */}
                    <div className={`${doctorImage ? "sm:col-span-7" : "sm:col-span-12"} space-y-2`}>
                      <div className="rounded-xl bg-[#edf8f6] p-2.5 border border-teal-100/70">
                        <h5 className="text-[13px] font-bold text-gray-900 leading-tight">
                          {doctorName || "Specialist Name"}
                        </h5>
                        {doctorDesignation && (
                          <p className="text-[10px] font-bold text-brand mt-0.5">
                            {doctorDesignation}
                          </p>
                        )}
                        {doctorExperience && (
                          <p className="text-[9.5px] font-bold text-teal-700 mt-0.5">
                            {doctorExperience}
                          </p>
                        )}
                      </div>

                      {doctorBioText && (
                        <p className="text-[10.5px] text-gray-600 line-clamp-3 leading-relaxed">
                          {doctorBioText.split("\n\n")[0]}
                        </p>
                      )}

                      {doctorCtaText && (
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-white px-3 py-1 text-[9.5px] font-semibold text-brand shadow-2xs">
                            <FaRegCalendarCheck className="size-3" />
                            <span>{doctorCtaText}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT SECTIONS LIVE PREVIEW */}
              {(previewTab === "content" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-white space-y-3.5 border-t border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Content Sections (Above FAQs)
                  </span>

                  {contentSections.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {contentSections.map((sec, idx) => (
                        <div
                          key={sec.id || idx}
                          className="rounded-xl border border-teal-100/70 bg-gradient-to-b from-[#f9fdfc] to-white p-3 shadow-2xs space-y-1.5"
                        >
                          {sec.title && (
                            <h5 className="text-[12.5px] font-bold text-gray-900 border-b border-teal-100/80 pb-1">
                              {sec.title}
                            </h5>
                          )}
                          {sec.description ? (
                            <div
                              className="blog-content text-[11px] text-gray-700 leading-relaxed max-h-36 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: sec.description }}
                            />
                          ) : (
                            <p className="text-[10px] text-gray-400 italic">No description content</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No additional content sections added
                    </p>
                  )}
                </div>
              )}

              {/* SECTION 6 LIVE PREVIEW */}
              {(previewTab === "section6" || previewTab === "full") && (
                <div className="p-4 sm:p-5 bg-[#f0faf9] space-y-3 border-t border-teal-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded w-fit block">
                    Section 6 · FAQs (Interactive)
                  </span>

                  <h4 className="text-[14px] font-bold text-brand leading-tight">
                    {faqHeading || "Frequently Asked Questions"}
                  </h4>

                  {faqItems.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {faqItems.slice(0, 6).map((item, idx) => {
                        const id = item.id || `faq-${idx}`;
                        const isOpen = previewOpenFaq === id;
                        return (
                          <div
                            key={id}
                            onClick={() => setPreviewOpenFaq(isOpen ? null : id)}
                            className={`rounded-xl p-2.5 transition cursor-pointer ${
                              isOpen
                                ? "bg-brand text-white shadow-xs"
                                : "bg-white border border-teal-500/80 hover:border-brand shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[11px] font-bold leading-tight select-none ${
                                  isOpen ? "text-white" : "text-[#0f766e]"
                                }`}
                              >
                                {item.question || "Question"}
                              </span>
                              <span className="text-[14px] font-bold leading-none select-none">
                                {isOpen ? "−" : "+"}
                              </span>
                            </div>
                            {isOpen && (
                              <p className="mt-1.5 pt-1.5 border-t border-teal-600 text-[10px] text-teal-50 leading-relaxed">
                                {item.answer || "Answer"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      {faqItems.length > 6 && (
                        <p className="text-[9.5px] text-gray-500 text-center pt-1">
                          +{faqItems.length - 6} more questions (click to test toggle or view full page)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic py-2 text-center border border-dashed border-teal-200/60 rounded-lg">
                      No FAQs added yet
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-teal-50/70 p-3 text-[12px] text-teal-900 border border-teal-100">
              <p className="font-semibold">✨ Sections 1, 2, 3, 4, 5, Content Sections &amp; FAQs integrated:</p>
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
