const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export interface ApiRequestOptions extends RequestInit {
  // Custom request options can be added here
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Skip ngrok warning page for API requests
  headers.set('ngrok-skip-browser-warning', 'true');

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.message || `API Error (${response.status})`);
  }

  // Return nested data field if it is present (corresponds to our backend's sendSuccess wrapper)
  return data.data !== undefined ? data.data : data;
}
