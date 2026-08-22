import { getAuthChangedEventName, getCurrentUser, logout as endSession, startLogin } from "@/services/authService";
import type { User } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await getCurrentUser());
    } catch (reason) {
      setUser(null);
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onAuthChanged = () => void refresh();
    window.addEventListener(getAuthChangedEventName(), onAuthChanged);
    return () => window.removeEventListener(getAuthChangedEventName(), onAuthChanged);
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await endSession();
    } finally {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading || user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [loading, redirectOnUnauthenticated, redirectPath, user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
