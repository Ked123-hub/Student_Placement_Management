import { API_BASE_URL } from "../config/env";

const TOKEN_KEY = "placement_access_token";
export const AUTH_SESSION_EXPIRED_EVENT = "placement:auth-session-expired";

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthSession() {
  setAccessToken(null);
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || body?.success === false) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const error = new Error(
      body?.error?.message ?? "Something went wrong. Please try again.",
    );
    error.code = body?.error?.code ?? "REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }

  return body?.data ?? body;
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const token = getAccessToken();
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      isFormData || typeof body === "string"
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });

  return parseResponse(response);
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiRequest(path, { ...options, method: "POST", body }),
  patch: (path, body, options) =>
    apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
