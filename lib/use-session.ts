"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError, type User } from "./api";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return apiFetch<{ user: User }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch((error) => {
        setUser(null);
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error(error);
        }
      });
  }, []);

  useEffect(() => {
    let active = true;
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return { user, loading, logout, refresh };
}
