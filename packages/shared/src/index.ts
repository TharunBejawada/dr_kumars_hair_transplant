import { z } from "zod";

/* ───────────── Appointments ───────────── */

export const appointmentStatuses = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

/** Appointment request submitted from the public home page. Shared by the form (client) and API (server). */
export const appointmentSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date"),
  message: z.string().trim().max(1000).optional().default(""),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().default(""),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

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
