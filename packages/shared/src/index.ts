import { z } from "zod";

/* ───────────── Appointments ───────────── */

export const appointmentStatuses = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const appointmentConcerns = [
  "Hair Loss & Thinning",
  "Acne & Skin Problems",
  "Pigmentation & Dark Spots",
  "Anti-Ageing & Aesthetic Care",
  "Other",
] as const;

/**
 * Server-side schema for appointment requests (home-page form and the consultation popup).
 * Lenient on email/date (the popup doesn't require them); each form enforces its own stricter rules client-side.
 */
export const appointmentSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(200)]).optional().default(""),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number"),
  preferredDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")]).optional().default(""),
  concern: z.enum(appointmentConcerns).optional(),
  message: z.string().trim().max(1000).optional().default(""),
  source: z.enum(["home", "popup"]).optional().default("home"),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().default(""),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

/** Home-page form: email and preferred date are mandatory. */
export const appointmentFormSchema = appointmentSchema.extend({
  email: z.string().trim().email("Enter a valid email").max(200),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date"),
});

/** Consultation popup: name, phone and concern are mandatory. */
export const popupFormSchema = appointmentSchema.extend({
  concern: z.enum(appointmentConcerns, { message: "Select your concern" }),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(appointmentStatuses).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export interface Appointment extends Omit<AppointmentInput, "website"> {
  id: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

/* ───────────── Auth ───────────── */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

/** Password rules for admin accounts. */
export const passwordRules = [
  { id: "len", label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { id: "lower", label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "special", label: "A special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: z.string().max(128, "Too long"),
  })
  .superRefine((v, ctx) => {
    if (!passwordRules.every((r) => r.test(v.newPassword))) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Password doesn't meet the requirements" });
    }
    if (v.newPassword === v.currentPassword) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: "New password must be different from the current one" });
    }
  });

/* ───────────── Blogs ───────────── */

/** draft = not public · scheduled = goes live at publishAt · published = live · inactive = hidden */
export const blogStatuses = ["draft", "scheduled", "published", "inactive"] as const;
export type BlogStatus = (typeof blogStatuses)[number];

const richSection = z.object({
  heading: z.string().trim().max(300).default(""),
  description: z.string().max(200_000).default(""),
});
const faq = z.object({
  question: z.string().trim().max(500).default(""),
  answer: z.string().max(50_000).default(""),
});

/** Same fields as the TX Hospitals blog (minus branch/location), plus scheduling. */
export const blogInputSchema = z
  .object({
    blogTitle: z.string().trim().min(3, "Title is required").max(250),
    blogImage: z.string().max(500).default(""),
    categories: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
    author: z.string().trim().max(120).default(""),
    /** Date (YYYY-MM-DD) shown on the blog, as in the reference admin. */
    timeline: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date").default(""),
    extraFields: z.array(richSection).max(60).default([]),
    faqs: z.array(faq).max(60).default([]),
    seoTitle: z.string().trim().max(200).default(""),
    metaDescription: z.string().trim().max(400).default(""),
    metaKeywords: z.string().trim().max(400).default(""),
    /** URL slug, e.g. "hair-transplant-recovery-guide". */
    url: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
      .max(150),
    status: z.enum(blogStatuses).default("draft"),
    /** ISO-8601 UTC timestamp. Required when status = scheduled. */
    publishAt: z.string().datetime().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status === "scheduled" && !v.publishAt) {
      ctx.addIssue({ code: "custom", path: ["publishAt"], message: "Pick a publish date & time" });
    }
  });
export type BlogInput = z.infer<typeof blogInputSchema>;

export interface Blog extends Omit<BlogInput, "publishAt"> {
  id: string;
  publishAt: string | null;
  createdAt: string;
  modifiedAt: string;
}

/** A blog is public when published (or scheduled) and its publish time has passed. */
export function isBlogLive(b: Pick<Blog, "status" | "publishAt">, now: Date = new Date()): boolean {
  if (b.status !== "published" && b.status !== "scheduled") return false;
  if (!b.publishAt) return b.status === "published";
  return new Date(b.publishAt).getTime() <= now.getTime();
}

export type BlogDisplayState = "draft" | "scheduled" | "live" | "inactive";
/** What an admin sees in lists: scheduled blogs flip to "live" automatically once due. */
export function blogDisplayState(b: Pick<Blog, "status" | "publishAt">, now: Date = new Date()): BlogDisplayState {
  if (b.status === "draft") return "draft";
  if (b.status === "inactive") return "inactive";
  return isBlogLive(b, now) ? "live" : "scheduled";
}

/* ───────────── Services & Details Pages ───────────── */

export const serviceCategories = [
  { id: "hair", label: "Hair", description: "Advanced hair loss, restoration, FUE, DHI and scalp treatments." },
  { id: "skin-cosmetic", label: "Skin & Cosmetic", description: "Cosmetic enhancements, rejuvenation, peels and aesthetic care." },
  { id: "dermatology", label: "Dermatology", description: "Clinical dermatology, skin disease management and clinical care." },
  { id: "std", label: "STD", description: "Confidential diagnosis and management of sexually transmitted infections." },
] as const;

export const serviceCategoryIds = ["hair", "skin-cosmetic", "dermatology", "std"] as const;
export type ServiceCategoryId = (typeof serviceCategoryIds)[number];

export const servicePageStatuses = ["draft", "published", "inactive"] as const;
export type ServicePageStatus = (typeof servicePageStatuses)[number];

export const servicePageInputSchema = z.object({
  serviceCategory: z.enum(serviceCategoryIds, {
    message: "Select a valid service category (Hair, Skin & Cosmetic, Dermatology, STD)",
  }),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(250),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .max(150),
  subtitle: z.string().trim().max(300).default(""),
  image: z.string().max(500).default(""),
  imageAlt: z.string().trim().max(200).default(""),
  ctaText: z.string().trim().max(60).default("Book a Consultation"),
  ctaLink: z.string().trim().max(300).default("#appointment"),
  status: z.enum(servicePageStatuses).default("draft"),
  order: z.number().int().default(0),
  seoTitle: z.string().trim().max(200).default(""),
  metaDescription: z.string().trim().max(400).default(""),
  /** Extensible container for subsequent sections (Section 2, Section 3, etc.) */
  sections: z.record(z.any()).optional().default({}),
});

export type ServicePageInput = z.infer<typeof servicePageInputSchema>;

export interface ServicePage extends ServicePageInput {
  id: string;
  createdAt: string;
  modifiedAt: string;
}

export function isServicePageLive(page: Pick<ServicePage, "status">): boolean {
  return page.status === "published";
}
