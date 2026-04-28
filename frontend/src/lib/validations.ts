import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  imageUrl: z.string().url(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  location: z.string().min(3),
  capacity: z.coerce.number().min(1),
  ticketPrice: z.coerce.number().min(0),
  ticketsAvailable: z.coerce.number().min(1),
  visibility: z.enum(["public", "unlisted", "private"]),
  ageRestriction: z.enum(["all_ages", "age_18_plus", "age_21_plus"]),
  dressCode: z.string().optional(),
  instructions: z.string().optional(),
  locationNote: z.string().optional(),
  showCapacityPublicly: z.boolean().optional(),
}).superRefine((val, ctx) => {
  if (val.ticketPrice > 0 && val.ticketPrice < 0.5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ticketPrice"],
      message: "Paid events must be at least $0.50 per ticket (or set price to $0 for a free event).",
    });
  }
});

export const purchaseSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  quantity: z.coerce.number().min(1).max(10),
});

/** Public contact form (+ honeypot `company`, must stay empty). */
export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(8000),
  company: z.string().optional(),
});
