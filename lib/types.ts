import { z } from "zod";

export const BusinessType = z.enum([
  "salon",
  "day_spa",
  "med_spa",
  "hotel_spa",
  "wellness_clinic",
]);
export type BusinessType = z.infer<typeof BusinessType>;

export const AestheticTag = z.enum([
  "modern-minimal",
  "classic-luxe",
  "organic-wellness",
  "clinical-medical",
  "celebrity-haunt",
]);
export type AestheticTag = z.infer<typeof AestheticTag>;

export const TestimonialArchetype = z.enum([
  "boutique-multi-location",
  "flagship-single-location",
  "resort-spa",
  "celebrity-stylist",
  "medical-wellness",
]);
export type TestimonialArchetype = z.infer<typeof TestimonialArchetype>;

export const SalonSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  website: z.string().url().or(z.literal("")),
  instagram: z.string().nullable(),
  business_type: BusinessType,
  revenue_tier: z.string(),
  location_count: z.number().int().nonnegative(),
  aesthetic: z.array(AestheticTag),
  personalization_hook: z.string(),
  fit_score: z.number().min(0).max(100),
  score_reasons: z.array(z.string()),
  estimated_weekly_clients: z.number().int().nonnegative(),
  projected_retail_uplift_annual_usd: z.number().nonnegative(),
  testimonial_archetype: TestimonialArchetype,
});
export type Salon = z.infer<typeof SalonSchema>;

export const GeneratedEmailSchema = z.object({
  salon_id: z.string(),
  subject: z.string().min(1).max(120),
  body: z.string().min(1),
});
export type GeneratedEmail = z.infer<typeof GeneratedEmailSchema>;

export const MicrositeContentSchema = z.object({
  salon_id: z.string(),
  hero_headline: z.string().min(1),
  hero_subhead: z.string().min(1),
  why_you_bullets: z.array(z.string().min(1)).length(3),
  roi_copy: z.string().min(1),
  testimonial_match: TestimonialArchetype,
});
export type MicrositeContent = z.infer<typeof MicrositeContentSchema>;
