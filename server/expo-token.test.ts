import { describe, expect, it } from "vitest";

/**
 * Validates the EXPO_TOKEN against the Expo public GraphQL API.
 * Auth flow: an authenticated token reaches the GraphQL engine (even a bad
 * query returns a GRAPHQL_VALIDATION_FAILED error), while an invalid/missing
 * token returns UNAUTHENTICATED before any query parsing.
 */
describe("EXPO_TOKEN", () => {
  it("authenticates against the Expo public GraphQL API", async () => {
    const token = process.env.EXPO_TOKEN;
    expect(token, "EXPO_TOKEN must be set").toBeTruthy();

    const run = async (): Promise<{ status: number; body: string }> => {
      const resp = await fetch("https://api.expo.dev/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: "{viewerAccount{username}}" }),
      });
      return { status: resp.status, body: await resp.text() };
    };

    let result: { status: number; body: string } | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        result = await run();
        if (result.body.length > 0 && result.body.includes("errors") === false || (result.body.length > 0 && !result.body.includes("ENOTFOUND") && !result.body.includes("EAI_AGAIN"))) break;
      } catch (err) {
        lastError = err;
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    expect(result, `Expo API unreachable: ${String(lastError)}`).toBeTruthy();
    // The Expo GraphQL API may use HTTP 200 or 400 for GraphQL errors; what matters is the JSON body.
    expect(
      [200, 400].includes(result!.status),
      `Unexpected Expo API HTTP status ${result!.status}`,
    ).toBe(true);

    const parsed = JSON.parse(result!.body) as {
      errors?: { extensions?: { code?: string } }[];
    };
    const code = parsed?.errors?.[0]?.extensions?.code;
    const type = parsed?.errors?.[0]?.type;

    // Authenticated tokens reach GraphQL processing; invalid tokens are rejected with AUTHENTICATION_ERROR.
    expect(
      { code, type },
      "Token appears invalid — expected the request to pass authentication (GRAPHQL_VALIDATION_FAILED or a data response)",
    ).not.toEqual({ code: "AUTHENTICATION_ERROR", type: "USER" });
  }, 40_000);
});
