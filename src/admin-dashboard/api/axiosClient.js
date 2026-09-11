/**
 * Centralized Axios instance for the entire project.
 * - Reads the base URL from VITE_API_BASE_URL (defaults to /api/v1).
 * - Attaches the stored auth token on every request via an interceptor.
 * - On 401 responses, clears the stored session and redirects to /login.
 */
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ar",
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  // Axios serializes FormData as JSON when a JSON content type is forced.
  // Remove only that request header and let the browser add multipart/form-data
  // with the correct boundary.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Enforce Arabic language globally on every request
  config.headers["Accept-Language"] = "ar";
  
  return config;
});

/** Returns the first readable message from supported Backend validation shapes. */
export function extractBackendValidationMessage(errors) {
  if (!errors) return "";
  const entries = Array.isArray(errors) ? errors : Object.values(errors);
  for (const entry of entries) {
    if (typeof entry === "string" && entry.trim()) return entry;
    if (Array.isArray(entry)) {
      const message = entry.find(
        (value) => typeof value === "string" && value.trim(),
      );
      if (message) return message;
      continue;
    }
    const message = entry?.messages?.find?.(
      (value) => typeof value === "string" && value.trim(),
    );
    if (message) return message;
    if (typeof entry?.message === "string" && entry.message.trim()) {
      return entry.message;
    }
  }
  return "";
}

/**
 * Extracts a human-readable error message from an Axios error object.
 *
 * Checks the following in order:
 *  1. `error.response.data.message` (string or array of validation messages)
 *  2. `error.response.data.errors`  (delegated to extractBackendValidationMessage)
 *  3. `error.response.data.error`   (some APIs use this key)
 *  4. Falls back to the provided `fallback` string, or a default Arabic generic.
 *
 * @param {Error}  error    – The Axios error (or any Error) caught in a catch/onError.
 * @param {string} [fallback] – Optional context-specific fallback message.
 * @returns {string} A readable error message suitable for toast / UI display.
 */
export function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const defaultMsg = fallback || "حدث خطأ غير متوقع";

  if (!data) return defaultMsg;

  // 1. data.message — string or array (NestJS class-validator returns arrays)
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (Array.isArray(data.message) && data.message.length > 0) {
    const parts = data.message.map((m) => {
      if (typeof m === "string") return m;
      if (typeof m === "object" && m?.constraints) {
        return Object.values(m.constraints).join("، ");
      }
      return typeof m === "object" ? JSON.stringify(m) : String(m);
    });
    return parts.join(" | ");
  }

  // 2. data.errors — delegate to the existing shape-aware helper
  const fromErrors = extractBackendValidationMessage(data.errors);
  if (fromErrors) return fromErrors;

  // 3. data.error — some endpoints use this key
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  if (data.error && typeof data.error === "object") {
    return JSON.stringify(data.error);
  }

  return defaultMsg;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    if (error.response?.status === 400 && error.response?.data) {
      const data = error.response.data;
      let detailedErrorString = extractBackendValidationMessage(data.errors);

      if (detailedErrorString) {
        error.response.data.message = detailedErrorString;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
