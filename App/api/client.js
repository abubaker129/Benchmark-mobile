import { getToken, removeToken } from "../utils/token";

const BASE_URL = "https://portal.benchmarkstudio.biz/mobile/api";

/**
 * Main API helper
 * - Supports JSON requests
 * - Supports multipart/form-data (file uploads)
 * - Handles auth + 401 logout
 */
export async function apiFetch(path, options = {}, onUnauthorized) {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      // IMPORTANT: only set JSON header if NOT FormData
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Logout ONLY on 401
  if (res.status === 401) {
    await removeToken();
    if (onUnauthorized) await onUnauthorized();
    throw new Error("Unauthorized");
  }

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

// Optional alias
export const apiRequest = apiFetch;
