type ApiEnvelope<T> = {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[];
};

export type ApiRequestOptions = {
  token?: string | null;
  method?: 'GET' | 'POST' | 'PATCH';
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export class ApiRequestError extends Error {
  status: number;
  errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
  const method = options.method ?? (body === undefined ? 'GET' : 'POST');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || envelope?.success === false) {
    throw new ApiRequestError(envelope?.message ?? 'Request failed.', response.status, envelope?.errors ?? []);
  }

  if (!envelope) {
    throw new ApiRequestError('Invalid API response.', response.status);
  }

  return envelope.data;
}
