import { describe, it, expect } from "vitest";
import { PAGE_SIZE, REVIEW_PAGE_SIZE, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

describe("constants", () => {
  it("exports PAGE_SIZE as 12", () => {
    expect(PAGE_SIZE).toBe(12);
  });

  it("exports REVIEW_PAGE_SIZE as 10", () => {
    expect(REVIEW_PAGE_SIZE).toBe(10);
  });

  it("exports SITE_NAME", () => {
    expect(SITE_NAME).toBe("Influence");
  });

  it("exports SITE_DESCRIPTION", () => {
    expect(SITE_DESCRIPTION).toBe("The platform for influencer discovery and reviews");
  });

  it("does not export SORT_OPTIONS", async () => {
    // Verify SORT_OPTIONS was removed — this test ensures it stays removed
    const constants = await import("@/lib/constants");
    expect(constants).not.toHaveProperty("SORT_OPTIONS");
  });
});