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
  ticketPrice: z.coerce.number().min(0.5),
  ticketsAvailable: z.coerce.number().min(1),
  visibility: z.enum(["public", "unlisted", "private"]),
  ageRestriction: z.enum(["all_ages", "age_18_plus", "age_21_plus"]),
  dressCode: z.string().optional(),
  instructions: z.string().optional(),
  locationNote: z.string().optional(),
  showCapacityPublicly: z.boolean().optional(),
});

export const purchaseSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  quantity: z.coerce.number().min(1).max(10),
});
