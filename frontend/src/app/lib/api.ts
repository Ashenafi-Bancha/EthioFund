// API helper: centralizes base URL and request helper so headers and error
// handling are consistently applied across the frontend.
const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');

export const resolveApiUrl = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${apiBaseUrl.replace(/\/api$/, '')}${value}`;
  }

  return value;
};

type RequestOptions = RequestInit & {
  authToken?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === 'string'
      ? body || response.statusText
      : body?.message || body?.error || response.statusText;
    throw new Error(message || 'Request failed');
  }

  return body as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const hasFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!headers.has('Content-Type') && options.body && !hasFormDataBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}