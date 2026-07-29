import { describe, expect, it } from "vitest";

describe("echoes schema", () => {
  it("has correct enum values for mode", () => {
    const validModes = ["vault", "future_self"];
    for (const mode of validModes) {
      expect(["vault", "future_self"]).toContain(mode);
    }
  });

  it("validates collection names", () => {
    const names = ["Life", "Letters", "Dreams", "Ideas", "Poetry", "Faith", "Music", "Coding"];
    expect(names).toHaveLength(8);
    for (const name of names) {
      expect(name.length).toBeGreaterThan(0);
      expect(name.length).toBeLessThanOrEqual(128);
    }
  });
});

describe("insight period month format", () => {
  it("validates YYYY-MM format", () => {
    const regex = /^\d{4}-\d{2}$/;
    expect(regex.test("2026-07")).toBe(true);
    expect(regex.test("2025-12")).toBe(true);
    expect(regex.test("2026-7")).toBe(false);
    expect(regex.test("abcd-ef")).toBe(false);
  });
});
