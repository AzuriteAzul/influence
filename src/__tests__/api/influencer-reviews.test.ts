import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

import { GET, POST } from "@/app/api/influencers/[slug]/reviews/route";

function createGetRequest(url: string) {
  return new NextRequest(new URL(url));
}

function createPostRequest(url: string, body: unknown) {
  return new NextRequest(new URL(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/influencers/[slug]/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 if influencer not found", async () => {
    mockFromServer.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    });

    const req = createGetRequest("http://localhost:3000/api/influencers/nonexistent/reviews");
    const response = await GET(req, { params: Promise.resolve({ slug: "nonexistent" }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Influencer not found");
  });
});

describe("POST /api/influencers/[slug]/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null } });

    const req = createPostRequest(
      "http://localhost:3000/api/influencers/test/reviews",
      { rating: 5, title: "Great", body: "This is a detailed review." }
    );

    const response = await POST(req, { params: Promise.resolve({ slug: "test" }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Authentication required");
  });

  it("returns 400 for invalid review data", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const req = createPostRequest(
      "http://localhost:3000/api/influencers/test/reviews",
      { rating: 0, title: "AB", body: "Short" }
    );

    const response = await POST(req, { params: Promise.resolve({ slug: "test" }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Validation failed");
  });
});