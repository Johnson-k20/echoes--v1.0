import type { Express, Request, Response } from "express";
import { ONE_YEAR_MS, decodeOAuthState } from "@shared/const";
import * as db from "./db";
import { sdk } from "./_core/sdk";

/**
 * Mobile session handoff endpoints.
 *
 * The web app's OAuth flow binds a one-time CSRF cookie to the browser that
 * started the login, which a React Native WebView cannot participate in.
 * Instead the mobile app launches the same Manus OAuth sign-in URL from an
 * in-app browser, with its `redirectUri` set to the app's deep link
 * (`echoes://session`). The standard `/api/oauth/callback` flow then
 * exchanges the code for an access token, looks up the user, and issues a
 * session token (HS256 JWT) — exactly the same token the web client gets.
 * Because the redirect target is the mobile deep link rather than "/", the
 * callback appends the session token so the app can capture it.
 *
 * Mobile flow:
 *  1. App mints state = base64({ redirectUri: "echoes://session", nonce })
 *  2. App opens `${portal}/app-auth?appId=&redirectUri=${redirectUri}&state=&type=signIn`
 *  3. User signs in; portal redirects to /api/oauth/callback?code=&state=
 *  4. Server exchanges code, mints session token, redirects to
 *     echoes://session?sessionToken=... (deep link reopens the app)
 *  5. App stores token and sends `Authorization: Bearer <token>` on all requests.
 *
 * POST /api/mobile/session/verify  (optional) — server-side verification of
 * a stored token, useful for the app to confirm its saved session is still valid.
 * GET  /api/mobile/me               — returns the current authenticated user.
 */
export function registerMobileSessionRoutes(app: Express) {
  app.get("/api/mobile/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/mobile/session/verify", async (req: Request, res: Response) => {
    try {
      const token =
        (req.body?.sessionToken as string | undefined) || extractBearerToken(req);
      const session = await sdk.verifySession(token);
      if (!session) return res.status(401).json({ error: "Invalid session" });
      const user = await db.getUserByOpenId(session.openId);
      res.json({ valid: true, user: user ? { id: user.id, name: user.name } : null });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return undefined;
}

/**
 * Deep-link redirect helper used by the OAuth callback for mobile logins.
 * The OAuth portal forwards the code to our callback; after a successful
 * exchange, if the state's redirectUri is a custom scheme (not http(s)),
 * we hand the session token straight to the app via that deep link instead
 * of setting a web cookie.
 */
export function redirectUriIsDeepLink(state: string): {
  isDeepLink: boolean;
  redirectUri?: string;
} {
  const { redirectUri } = decodeOAuthState(state);
  if (!redirectUri) return { isDeepLink: false };
  const isDeepLink = !/^https?:\/\//i.test(redirectUri);
  return { isDeepLink, redirectUri: isDeepLink ? redirectUri : undefined };
}

// Re-export so the OAuth callback can share the deep-link logic
export { decodeOAuthState };
