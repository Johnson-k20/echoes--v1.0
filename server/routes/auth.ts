import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const authRouter = Router();

/**
 * DEVELOPMENT-ONLY response used by the preserved UI shell. Replace this with
 * JWT verification and a user lookup before treating it as authentication.
 */
authRouter.get("/me", (_request, response) => {
  response.json({
    success: true,
    data: {
      id: "dev-user-echoes",
      name: "Echoes Developer",
      email: "developer@local.echoes",
      role: "user",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });
});

authRouter.post("/login", notImplemented("JWT login"));
authRouter.post("/register", notImplemented("Account registration"));

// This returns a harmless development response. A real implementation must
// revoke or expire the JWT rather than relying on this placeholder.
authRouter.post("/logout", (_request, response) => {
  response.json({ success: true, data: { loggedOut: true } });
});
