import Cookies from "js-cookie";

import { apiFetch } from "./api";
import type { LoginRequest, LoginResponse, User } from "@/types/api";

export async function login(data: LoginRequest): Promise<void> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  Cookies.set("auth-token", response.access_token, {
    expires: 1,
    sameSite: "lax",
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export function logout(): void {
  Cookies.remove("auth-token");
  window.location.href = "/login";
}
