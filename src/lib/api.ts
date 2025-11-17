"use client";

/**
 * Minimal API client for browser-side usage.
 * - Reads base URL from NEXT_PUBLIC_API_URL
 * - Attaches Authorization header with Bearer token from localStorage if present
 * - Provides typed helpers for GET/POST/PUT/DELETE
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  withCredentials?: boolean;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

export function getBaseUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  // Fallback to repo1 observed default if unset. Adjust in .env.local
  return envBase && envBase.length > 0 ? envBase : "http://localhost:5000";
}

export function getAuthBaseUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_API_URL_SMARTHIRING?.trim();
  // Fallback to repo1 observed default if unset. Adjust in .env.local
  return envBase && envBase.length > 0 ? envBase : "http://localhost:8080";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("Company_token");
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("Company_token", token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("Company_token");
}

export async function apiFetch<TResponse = unknown, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const baseUrl = getBaseUrl();
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't stringify FormData - it needs to be sent as-is
  const body = options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined);

  // Remove Content-Type header for FormData to let browser set it automatically
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body,
    signal: options.signal,
    // Send cookies by default to support httpOnly-cookie auth across API calls
    credentials: options.withCredentials === false ? "omit" : "include",
  });

  if (response.status === 204) {
    // No Content
    return undefined as unknown as TResponse;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const errorPayload = isJson ? await response.json().catch(() => undefined) : undefined;
    throw new Error(
      errorPayload?.message || errorPayload?.error || `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (isJson ? await response.json() : (await response.text())) as unknown as TResponse;
}

export async function smartHiringApiFetch<TResponse = unknown, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const baseUrl = getAuthBaseUrl();
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't stringify FormData - it needs to be sent as-is
  const body = options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined);

  // Remove Content-Type header for FormData to let browser set it automatically
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body,
    signal: options.signal,
    // Send cookies by default to support httpOnly-cookie auth across API calls
    credentials: options.withCredentials === false ? "omit" : "include",
  });

  if (response.status === 204) {
    // No Content
    return undefined as unknown as TResponse;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const errorPayload = isJson ? await response.json().catch(() => undefined) : undefined;
    throw new Error(
      errorPayload?.message || errorPayload?.error || `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (isJson ? await response.json() : (await response.text())) as unknown as TResponse;
}


// Raw response variant when headers/cookies need to be inspected by caller (e.g., login)
export async function apiFetchRaw<TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<Response> {
  const baseUrl = getAuthBaseUrl();
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: options.withCredentials ? "include" : "omit",
  });

  return response;
}



// Convenience wrappers
export const api = {
  get: <T>(endpoint: string, signal?: AbortSignal) => apiFetch<T>(endpoint, { method: "GET", signal }),
  post: <T, B = unknown>(endpoint: string, body?: B, signal?: AbortSignal) =>
    apiFetch<T, B>(endpoint, { method: "POST", body, signal }),
  put: <T, B = unknown>(endpoint: string, body?: B, signal?: AbortSignal) =>
    apiFetch<T, B>(endpoint, { method: "PUT", body, signal }),
  patch: <T, B = unknown>(endpoint: string, body?: B, signal?: AbortSignal) =>
    apiFetch<T, B>(endpoint, { method: "PATCH", body, signal }),
  delete: <T>(endpoint: string, signal?: AbortSignal) => apiFetch<T>(endpoint, { method: "DELETE", signal }),
};

export const smartHiringApi = {
  get: <T>(endpoint: string, signal?: AbortSignal) => smartHiringApiFetch<T>(endpoint, { method: "GET", signal }),
  post: <T, B = unknown>(endpoint: string, body?: B, signal?: AbortSignal) =>
    smartHiringApiFetch<T, B>(endpoint, { method: "POST", body, signal }),
};


