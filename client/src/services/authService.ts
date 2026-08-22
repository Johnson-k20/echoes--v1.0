import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import { developmentUser } from "@/services/fixtureStore";
import type { User } from "@/types/api";

const SESSION_KEY = "echoes-development-session";
const AUTH_CHANGED_EVENT = "echoes-auth-changed";

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthChangedEventName() {
  return AUTH_CHANGED_EVENT;
}

export async function getCurrentUser(): Promise<User | null> {
  if (isRestApiEnabled) return apiRequest<User>("/api/auth/me");
  return localStorage.getItem(SESSION_KEY) === "signed-out" ? null : developmentUser;
}

/** DEVELOPMENT ONLY — replace with a real JWT login flow. */
export async function beginDevelopmentSession() {
  localStorage.setItem(SESSION_KEY, "active");
  notifyAuthChange();
  return developmentUser;
}

/**
 * Preserves the existing CTA API while intentionally avoiding a hosted OAuth
 * redirect. The future contract is POST /api/auth/login followed by JWT setup.
 */
export function startLogin() {
  void beginDevelopmentSession();
}

export async function logout() {
  if (isRestApiEnabled) await apiRequest<{ loggedOut: true }>("/api/auth/logout", { method: "POST" });
  localStorage.setItem(SESSION_KEY, "signed-out");
  notifyAuthChange();
}
