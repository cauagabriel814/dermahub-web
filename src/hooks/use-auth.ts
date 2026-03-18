"use client";

import { useEffect, useState } from "react";

import { getMe, logout } from "@/services/auth";
import type { User } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, logout };
}
