import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Must use vi.hoisted for variables used in vi.mock factories
const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/reviews/user/route";

function createRequest(url: string) {
  return new NextRequest(new URL(url));
}

describe("GET /api/reviews/user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if userId is missing", async () => {
    const req = createRequest("http://localhost:3000/api/reviews/user");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("userId required");
  });

  it("returns reviews with profiles for a valid userId", async () => {
    const reviews = [
      { id: "r1", user_id: "u1", title: "Great", body: "Nice", rating: 5, influencer_id: "i1", is_flagged: false, created_at: "2024-01-01", updated_at: "2024-01-01", influencers: { slug: "test-influencer", name: "Test" } },
      { id: "r2", user_id: "u1", title: "OK", body: "Decent", rating: 3, influencer_id: "i2", is_flagged: false, created_at: "2024-01-02", updated_at: "2024-01-02", influencers: { slug: "another-influencer", name: "Another" } },
    ];

    const profiles = [
      { id: "u1", display_name: "John Doe", username: "johndoe", avatar_url: null },
    ];

    const reviewChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: reviews, error: null }),
    };

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: profiles, error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "reviews") return reviewChain;
      if (table === "profiles") return profileChain;
      return reviewChain;
    });

    const req = createRequest("http://localhost:3000/api/reviews/user?userId=u1");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].profiles).toEqual({ id: "u1", display_name: "John Doe", username: "johndoe", avatar_url: null });
  });

  it("returns 500 if database query fails", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
    };

    mockFrom.mockReturnValue(chain);

    const req = createRequest("http://localhost:3000/api/reviews/user?userId=u1");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("DB error");
  });

  it("returns null profiles for reviews with no matching profile", async () => {
    const reviews = [
      { id: "r1", user_id: "u1", title: "Great", body: "Nice", rating: 5, influencer_id: "i1", is_flagged: false, created_at: "2024-01-01", updated_at: "2024-01-01", influencers: { slug: "test", name: "Test" } },
    ];

    const reviewChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: reviews, error: null }),
    };

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "reviews") return reviewChain;
      if (table === "profiles") return profileChain;
      return reviewChain;
    });

    const req = createRequest("http://localhost:3000/api/reviews/user?userId=u1");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].profiles).toBeNull();
  });
});