import { describe, it, expect, vi, beforeEach } from "vitest";

// Must use vi.hoisted for variables used in vi.mock factories
const { mockAuthGetUser, mockFromServer, mockFromAdmin } = vi.hoisted(() => ({
  mockAuthGetUser: vi.fn(),
  mockFromServer: vi.fn(),
  mockFromAdmin: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockAuthGetUser },
    from: mockFromServer,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFromAdmin,
  }),
}));

import { GET } from "@/app/api/admin/reviews/route";

describe("GET /api/admin/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if no user is authenticated", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 403 if user is not an admin", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockFromServer.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: false } }),
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe("Forbidden");
  });

  it("returns reviews with profiles for admin user", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "admin1" } } });

    // Server client: profile check
    mockFromServer.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: true } }),
    });

    const reviews = [
      { id: "r1", user_id: "u1", title: "Great", body: "Nice", rating: 5, influencer_id: "i1", is_flagged: false, created_at: "2024-01-01", updated_at: "2024-01-01" },
      { id: "r2", user_id: "u2", title: "OK", body: "Decent", rating: 3, influencer_id: "i2", is_flagged: true, created_at: "2024-01-02", updated_at: "2024-01-02" },
    ];

    const profiles = [
      { id: "u1", display_name: "Alice", username: "alice", avatar_url: null },
      { id: "u2", display_name: null, username: "bob", avatar_url: "https://img.example.com/bob.jpg" },
    ];

    const reviewChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: reviews, error: null }),
    };

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: profiles, error: null }),
    };

    mockFromAdmin.mockImplementation((table: string) => {
      if (table === "reviews") return reviewChain;
      if (table === "profiles") return profileChain;
      return reviewChain;
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].profiles).toEqual({ id: "u1", display_name: "Alice", username: "alice", avatar_url: null });
    expect(json.data[1].profiles).toEqual({ id: "u2", display_name: null, username: "bob", avatar_url: "https://img.example.com/bob.jpg" });
  });

  it("returns 500 if database query fails", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "admin1" } } });

    mockFromServer.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: true } }),
    });

    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
    };

    mockFromAdmin.mockReturnValue(chain);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("DB error");
  });
});