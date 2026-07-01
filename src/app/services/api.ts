const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3636/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: unknown;
  errors?: unknown;
};

export type User = {
  id: string;
  email?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  usedStorage?: number;
  storageLimit?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type UserListResult = {
  users: User[];
  pagination?: unknown;
};

export type CategoryItem = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  _count?: { documents: number };
};

export type DocumentVersionItem = {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string | null;
  createdAt: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  description?: string | null;
  contentPreview?: string | null;
  subject?: string | null;
  subjectId?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  categoryId?: string | null;
  folderId?: string | null;
  isPublic?: boolean;
  downloadCount?: number;
  currentVersion?: number;
  createdAt: string;
  updatedAt?: string;
  category?: { id: string; name: string } | null;
  subjectRef?: { id: string; name: string; code?: string | null } | null;
  user?: { id: string; fullName?: string; avatarUrl?: string | null } | null;
  versions?: DocumentVersionItem[];
};

export type DocumentMetadata = {
  title: string;
  description?: string;
  subject?: string;
  categoryId?: string;
  isPublic?: boolean;
};

export type ChatSession = {
  id: string;
  userId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | string;
  content: string;
  createdAt: string;
};

export function getToken() {
  return localStorage.getItem('authToken');
}

export function saveAuth(data: LoginResponse) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(data.user));
  window.dispatchEvent(new Event('authChange'));
}

export function logoutLocal() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
}

function buildHeaders(body?: BodyInit | null): HeadersInit {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const body = options.body ?? null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...buildHeaders(body),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }

  return payload as T;
}


export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const result = await request<ApiResponse<T> | T>(endpoint, options);
  const payload = result as any;
  return payload?.data !== undefined ? payload.data : payload;
}

export async function login(email: string, password: string) {
  const result = await request<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result.data;
}

export async function register(fullName: string, email: string, password: string) {
  const result = await request<ApiResponse<LoginResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
  return result.data;
}

export async function forgotPassword(email: string) {
  const result = await request<ApiResponse<{ emailSent: boolean | null }>>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return {
    message: result.message,
    emailSent: result.data?.emailSent ?? null,
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const result = await request<ApiResponse<null>>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
  return result.message;
}

export async function getMe() {
  const result = await request<ApiResponse<{ user: User }>>('/auth/me');
  return result.data.user;
}

export async function updateProfile(data: Pick<User, 'fullName' | 'avatarUrl'>) {
  const result = await request<ApiResponse<{ user: User }>>('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  localStorage.setItem('user', JSON.stringify(result.data.user));
  window.dispatchEvent(new Event('authChange'));
  return result.data.user;
}

export async function getCategories() {
  const result = await request<ApiResponse<{ categories: CategoryItem[] }>>('/categories');
  return result.data.categories || [];
}

export async function getDocuments(params: Record<string, string | number | undefined> = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const result = await request<ApiResponse<DocumentItem[]>>(`/documents${query ? `?${query}` : ''}`);
  return { documents: result.data, pagination: result.pagination };
}

export async function getDocumentById(id: string) {
  const result = await request<ApiResponse<{ document: DocumentItem }>>(`/documents/${id}`);
  return result.data.document;
}

export async function uploadDocument(file: File, metadata: DocumentMetadata | string) {
  const formData = new FormData();
  const normalized: DocumentMetadata = typeof metadata === 'string' ? { title: metadata } : metadata;

  formData.append('file', file);
  formData.append('title', normalized.title);
  formData.append('description', normalized.description || '');
  formData.append('subject', normalized.subject || '');
  formData.append('isPublic', String(normalized.isPublic ?? true));

  if (normalized.categoryId) {
    formData.append('categoryId', normalized.categoryId);
  }

  const result = await request<ApiResponse<{ document: DocumentItem }>>('/documents', {
    method: 'POST',
    body: formData,
  });
  return result.data.document;
}

export async function updateDocument(id: string, metadata: Partial<DocumentMetadata>, file?: File | null) {
  const body = file ? new FormData() : JSON.stringify(metadata);

  if (file && body instanceof FormData) {
    body.append('file', file);
    body.append('title', metadata.title || '');
    body.append('description', metadata.description || '');
    body.append('subject', metadata.subject || '');
    body.append('isPublic', String(metadata.isPublic ?? true));

    if (metadata.categoryId) {
      body.append('categoryId', metadata.categoryId);
    }
  }

  const result = await request<ApiResponse<{ document: DocumentItem }>>(`/documents/${id}`, {
    method: 'PUT',
    body,
  });
  return result.data.document;
}

export async function getDocumentVersions(id: string) {
  const result = await request<ApiResponse<{ versions: DocumentVersionItem[] } | DocumentVersionItem[]> | { versions: DocumentVersionItem[] } | DocumentVersionItem[]>(`/documents/${id}/versions`);
  const payload = result as any;

  if (Array.isArray(payload)) return payload as DocumentVersionItem[];
  if (Array.isArray(payload?.data)) return payload.data as DocumentVersionItem[];
  if (Array.isArray(payload?.data?.versions)) return payload.data.versions as DocumentVersionItem[];
  if (Array.isArray(payload?.versions)) return payload.versions as DocumentVersionItem[];

  return [];
}

export async function deleteDocument(id: string) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }
}

export function toAbsoluteFileUrl(fileUrl?: string | null) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${BACKEND_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

type FilePreviewSource = {
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
};

export function getFilePreviewUrl(file: FilePreviewSource) {
  const absoluteUrl = toAbsoluteFileUrl(file.fileUrl);
  if (!absoluteUrl) return '';

  const mimeType = file.mimeType || '';
  const fileName = file.fileName || '';
  const isOfficeFile = /\.(doc|docx|ppt|pptx|xls|xlsx)$/i.test(fileName)
    || mimeType.includes('officedocument')
    || mimeType.includes('msword')
    || mimeType.includes('ms-powerpoint')
    || mimeType.includes('ms-excel');

  // Trình duyệt thường sẽ tải thẳng file Word/PowerPoint/Excel.
  // Với file public trên Cloudinary/internet, dùng Google Viewer để nút "Xem" là xem trước thật.
  if (isOfficeFile && /^https?:\/\//i.test(absoluteUrl) && !absoluteUrl.includes('localhost') && !absoluteUrl.includes('127.0.0.1')) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absoluteUrl)}`;
  }

  return absoluteUrl;
}

export function getDocumentPreviewUrl(document: DocumentItem) {
  return getFilePreviewUrl(document);
}

export function openFilePreview(file: FilePreviewSource) {
  const previewUrl = getFilePreviewUrl(file);
  if (!previewUrl) {
    throw new Error('File này chưa có đường dẫn để mở.');
  }
  window.open(previewUrl, '_blank', 'noopener,noreferrer');
}

export function openDocumentPreview(document: DocumentItem) {
  openFilePreview(document);
}

function getDownloadUrl(fileUrl: string) {
  // Với Cloudinary, thêm fl_attachment để ưu tiên tải file thay vì mở preview.
  if (fileUrl.includes('res.cloudinary.com') && fileUrl.includes('/upload/') && !fileUrl.includes('/fl_attachment/')) {
    return fileUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  return fileUrl;
}

export function downloadFileFromUrl(fileUrl?: string | null, fallbackFileName = 'file') {
  const absoluteUrl = toAbsoluteFileUrl(fileUrl);
  if (!absoluteUrl) {
    throw new Error('File này chưa có đường dẫn để tải.');
  }

  const anchor = document.createElement('a');
  anchor.href = getDownloadUrl(absoluteUrl);
  anchor.download = fallbackFileName;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadDocument(id: string, fallbackFileName: string) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await response.json();
    const url = payload?.data?.downloadUrl;
    if (url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = payload?.data?.fileName || fallbackFileName;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      return;
    }
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fallbackFileName;
  anchor.click();
  URL.revokeObjectURL(url);
}


export async function getUsers(params: Record<string, string | number | undefined> = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const result = await request<ApiResponse<User[]>>(`/users${query ? `?${query}` : ''}`);
  return { users: result.data || [], pagination: result.pagination };
}

export async function updateUserRole(id: string, role: 'GUEST' | 'USER' | 'ADMIN' | string) {
  const result = await request<ApiResponse<{ user: User }>>(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  return result.data.user;
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }
}

export async function getChatSessions() {
  const result = await request<ApiResponse<{ sessions: ChatSession[] }>>('/ai/sessions');
  return result.data.sessions || [];
}

export async function createChatSession(title?: string) {
  const result = await request<ApiResponse<{ session: ChatSession }>>('/ai/sessions', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return result.data.session;
}

export async function getChatMessages(sessionId: string) {
  const result = await request<ApiResponse<{ messages: ChatMessage[] }>>(`/ai/sessions/${sessionId}/messages`);
  return result.data.messages || [];
}

export async function sendChatMessage(message: string, sessionId?: string | null) {
  const result = await request<ApiResponse<{ session: ChatSession; messages: ChatMessage[]; reply: string }>>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
  return result.data;
}

export async function deleteChatSession(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }
}
// Thêm vào cuối file api.ts của bạn

export async function getPublicDocuments(params: Record<string, string | number | undefined> = {}) {
  const searchParams = new URLSearchParams();

  // Tự động đẩy isPublic = true để backend lọc đúng tài liệu công khai
  searchParams.set('isPublic', 'true');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  // Gọi tới endpoint /documents kèm theo query string
  const result = await request<ApiResponse<DocumentItem[]>>(`/documents${query ? `?${query}` : ''}`);
  return { documents: result.data, pagination: result.pagination };
}