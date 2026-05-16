import { z } from "zod";

export const influencerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: z.string().min(1, "Category is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000).optional(),
  profile_image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  social_links: z.object({
    instagram: z.string().optional().or(z.literal("")),
    youtube: z.string().optional().or(z.literal("")),
    tiktok: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
  }).optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export type InfluencerInput = z.infer<typeof influencerSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
