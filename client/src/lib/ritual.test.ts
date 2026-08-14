import { describe, expect, it } from "vitest";
import { getRitualGreeting, getRitualPrompt } from "./ritual";

describe("recording ritual copy", () => {
  it("selects a calm time-aware greeting", () => {
    expect(getRitualGreeting(4)).toBe("Still awake?");
    expect(getRitualGreeting(8)).toBe("Good morning.");
    expect(getRitualGreeting(13)).toBe("Good afternoon.");
    expect(getRitualGreeting(19)).toBe("Good evening.");
    expect(getRitualGreeting(22)).toBe("It's late.");
  });

  it("keeps the Vault and Future Self prompts distinct", () => {
    expect(getRitualPrompt("vault")).toContain("memory");
    expect(getRitualPrompt("future_self")).toContain("later");
  });
});
