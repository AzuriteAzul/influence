import { describe, it, expect } from "vitest";
import { influencerSchema, reviewSchema } from "@/lib/validations";

describe("influencerSchema", () => {
  it("validates a valid influencer input", () => {
    const result = influencerSchema.safeParse({
      name: "Test Influencer",
    });
    expect(result.success).toBe(true);
  });

  it("validates with all optional fields", () => {
    const result = influencerSchema.safeParse({
      name: "Test Influencer",
      social_link: "https://example.com",
      category: "Tech",
      bio: "A tech influencer",
      profile_image_url: "https://img.example.com/pic.jpg",
      social_links: { twitter: "https://twitter.com/test" },
      website: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = influencerSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 2");
    }
  });

  it("rejects name longer than 100 characters", () => {
    const result = influencerSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL for social_link", () => {
    const result = influencerSchema.safeParse({
      name: "Test",
      social_link: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for social_link", () => {
    const result = influencerSchema.safeParse({
      name: "Test",
      social_link: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined optional fields", () => {
    const result = influencerSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
  });
});

describe("reviewSchema", () => {
  it("validates a valid review", () => {
    const result = reviewSchema.safeParse({
      rating: 5,
      title: "Great influencer",
      body: "This is a detailed review of the influencer.",
    });
    expect(result.success).toBe(true);
  });

  it("validates minimum rating of 1", () => {
    const result = reviewSchema.safeParse({
      rating: 1,
      title: "Terrible",
      body: "Not a good experience at all.",
    });
    expect(result.success).toBe(true);
  });

  it("validates maximum rating of 5", () => {
    const result = reviewSchema.safeParse({
      rating: 5,
      title: "Amazing",
      body: "Best influencer I have ever seen.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({
      rating: 0,
      title: "Bad",
      body: "This is a review body text.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({
      rating: 6,
      title: "Too good",
      body: "This is a review body text.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = reviewSchema.safeParse({
      rating: 3.5,
      title: "Decent",
      body: "This is a review body text.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = reviewSchema.safeParse({
      rating: 3,
      title: "AB",
      body: "This is a review body text.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 100 characters", () => {
    const result = reviewSchema.safeParse({
      rating: 3,
      title: "A".repeat(101),
      body: "This is a review body text.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body shorter than 10 characters", () => {
    const result = reviewSchema.safeParse({
      rating: 3,
      title: "Short review",
      body: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body longer than 2000 characters", () => {
    const result = reviewSchema.safeParse({
      rating: 3,
      title: "Long review",
      body: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = reviewSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});