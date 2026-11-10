import { z } from "zod";

/** Appointment request submitted from the public home page. Shared by the form (client) and API (server). */
export const appointmentSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number"),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date"),
  message: z.string().trim().max(1000).optional().default(""),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().default(""),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
