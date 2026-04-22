import { Platform } from "react-native";

const localApiHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${localApiHost}:4000/api/v1`;
let authToken: string | null = null;

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors: string[];
  meta: {
    request_id: string;
    timestamp: string;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers
    }
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? payload.errors.join(", ") ?? "API request failed");
  }

  return payload.data;
}

export const api = {
  baseUrl: API_BASE_URL,
  clearAuthToken: () => {
    authToken = null;
  },
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  setAuthToken: (token: string | null) => {
    authToken = token;
  }
};
