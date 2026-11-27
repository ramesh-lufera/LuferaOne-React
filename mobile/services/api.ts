const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

type ApiOptions = RequestInit & {
  token?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL is missing.');
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
  });

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new ApiError(
        response.status,
        `Invalid server response: HTTP ${response.status}`
      );
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : `API error: HTTP ${response.status}`;

    const errors = typeof data === 'object' && data !== null && 'errors' in data
      && typeof data.errors === 'object' && data.errors !== null
      ? data.errors as Record<string, string[]>
      : undefined;
    throw new ApiError(response.status, message, errors);
  }

  return data as T;
}
