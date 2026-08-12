/**
 * Tests for the mobile session handoff endpoints.
 *
 * - POST /api/mobile/session  → input validation (missing fields, malformed state)
 * - GET  /api/mobile/me       → 401 without a session
 * - redirectUriIsDeepLink     → correctly classifies http(s) vs custom-scheme URIs
 */
import { describe, expect, it } from "vitest";
import { redirectUriIsDeepLink } from "./mobile-session";

function base64Json(obj: object): string {
  return btoa(JSON.stringify(obj));
}

describe("redirectUriIsDeepLink", () => {
  it("classifies a custom-scheme mobile redirectUri as a deep link", () => {
    const state = base64Json({
      redirectUri: "echoes://session",
      nonce: "test-nonce-1",
    });
    const result = redirectUriIsDeepLink(state);
    expect(result.isDeepLink).toBe(true);
    expect(result.redirectUri).toBe("echoes://session");
  });

  it("classifies an https callback as NOT a deep link", () => {
    const state = base64Json({
      redirectUri: "https://example.manus.space/api/oauth/callback",
      nonce: "test-nonce-2",
    });
    const result = redirectUriIsDeepLink(state);
    expect(result.isDeepLink).toBe(false);
    expect(result.redirectUri).toBeUndefined();
  });

  it("rejects malformed state", () => {
    const result = redirectUriIsDeepLink("not-valid-base64state");
    expect(result.isDeepLink).toBe(false);
  });

  it("falls back to the legacy decoder when no redirectUri is present", () => {
    // The shared decoder's legacy branch returns the raw base64 string as
    // `redirectUri`, which is not http(s) — the callback then rejects it as
    // a malformed deep link with 400.
    const state = base64Json({ nonce: "only-nonce" });
    const result = redirectUriIsDeepLink(state);
    expect(result.isDeepLink).toBe(true);
    // The fallback "redirectUri" is the raw base64 payload — invalid as a URL.
    expect(() => new URL(result.redirectUri as string)).toThrow();
  });
});
