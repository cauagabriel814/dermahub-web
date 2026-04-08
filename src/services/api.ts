import Cookies from "js-cookie";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = Cookies.get("auth-token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function apiUpload(
  path: string,
  file: File,
): Promise<{ url: string; object_name: string }> {
  const token = Cookies.get("auth-token");
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload error: ${response.status}`);
  }

  return response.json();
}
