import { z } from "zod";

export const influencerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  social_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().optional(),
  bio: z.string().optional(),
  profile_image_url: z.string().optional(),
  social_links: z.record(z.string(), z.string()).optional(),
  website: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
});
