/**
 * DEVELOPMENT ONLY — deliberately insecure.
 *
 * Attach this while you learn the rest of the API. Replace it with middleware
 * that reads a Bearer token, verifies JWT_SECRET, loads the user, and rejects
 * invalid or expired credentials before a production release.
 */
export function developmentAuthBypass(request, _response, next) {
  request.user = {
    id: "dev-user-echoes",
    name: "Echoes Developer",
    email: "developer@local.echoes",
    role: "user",
  };
  next();
}
