import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateSlug, getInitials, formatRelativeDate, formatDate } from "@/lib/utils";

describe("generateSlug", () => {
  it("converts to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("foo bar baz")).toBe("foo-bar-baz");
  });

  it("replaces underscores with hyphens", () => {
    expect(generateSlug("foo_bar_baz")).toBe("foo-bar-baz");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello! @World# 2024")).toBe("hello-world-2024");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a---b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles single word", () => {
    expect(generateSlug("hello")).toBe("hello");
  });

  it("preserves existing hyphens", () => {
    expect(generateSlug("hello-world")).toBe("hello-world");
  });

  it("handles mixed case with special chars", () => {
    expect(generateSlug("Mr. Beast (YouTube)")).toBe("mr-beast-youtube");
  });
});

describe("getInitials", () => {
  it("returns first and last initial for full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for single word", () => {
    expect(getInitials("Madonna")).toBe("M");
  });

  it("handles three-word names", () => {
    expect(getInitials("John Michael Doe")).toBe("JD");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("uppercases initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles single character name", () => {
    expect(getInitials("A")).toBe("A");
  });
});

describe("formatDate", () => {
  it("formats a date string in English long format", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("January 15, 2024");
  });

  it("formats another date", () => {
    const result = formatDate("2023-12-25");
    expect(result).toBe("December 25, 2023");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  it("returns 'Today' for today", () => {
    expect(formatRelativeDate("2024-06-15T10:00:00Z")).toBe("Today");
  });

  it("returns 'Yesterday' for yesterday", () => {
    expect(formatRelativeDate("2024-06-14T10:00:00Z")).toBe("Yesterday");
  });

  it("returns '2 days ago' for 2 days ago", () => {
    expect(formatRelativeDate("2024-06-13T10:00:00Z")).toBe("2 days ago");
  });

  it("returns '1 weeks ago' for 8 days ago", () => {
    expect(formatRelativeDate("2024-06-07T10:00:00Z")).toBe("1 weeks ago");
  });

  it("returns months ago for older dates", () => {
    expect(formatRelativeDate("2024-04-15T10:00:00Z")).toBe("2 months ago");
  });

  it("returns formatted date for dates over a year old", () => {
    const result = formatRelativeDate("2023-01-15T10:00:00Z");
    // Should fall back to formatDate
    expect(result).toContain("2023");
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});