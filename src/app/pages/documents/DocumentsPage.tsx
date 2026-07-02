import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Download, Eye, FileText, History, Pencil, Search, Trash2, Upload, Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { DocumentMetadataDialog } from '../../components/documents/DocumentMetadataDialog';
import {
  deleteDocument,
  downloadDocument,
  getCategories,
  getDocuments,
  getToken,
  toAbsoluteFileUrl,
  updateDocument,
  type CategoryItem,
  type DocumentItem,
  type DocumentMetadata,
} from '../../services/api';

type SubjectItem = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
};

type DocumentWithImage = DocumentItem & {
  imgUrl?: string | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T | { subjects?: T; categories?: T; documents?: T; versions?: T };
  subjects?: T;
  categories?: T;
  documents?: T;
  versions?: T;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3636/api').replace(/\/$/, '');

// Lấy id user hiện tại từ localStorage (đã lưu lúc login, xem hàm saveAuth trong services/api.ts)
function getCurrentUserId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id || null;
  } catch {
    return null;
  }
}

function formatBytes(bytes?: number, decimals = 2) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function extractArray<T>(payload: ApiEnvelope<T[]> | T[] | unknown, key: 'subjects' | 'categories' | 'documents' | 'versions'): T[] {
  if (Array.isArray(payload)) return payload;
  const envelope = payload as ApiEnvelope<T[]> | undefined;
  if (Array.isArray(envelope?.[key])) return envelope[key] as T[];
  const data = envelope?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested[key])) return nested[key] as T[];
  }
  return [];
}

async function fetchSubjects(): Promise<SubjectItem[]> {
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/subjects`, { headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Lỗi API ${response.status}`);
  return extractArray<SubjectItem>(payload, 'subjects');
}

function getImageUrl(doc: DocumentWithImage) {
  return doc.imgUrl ? toAbsoluteFileUrl(doc.imgUrl) : '';
}

function getVersionCount(doc: DocumentWithImage) {
  const apiCount = (doc as { _count?: { versions?: number } })._count?.versions || 0;
  return Math.max(doc.currentVersion || 0, doc.versions?.length || 0, apiCount, 1);
}

const glowCard =
  "border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 " +
  "shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] " +
  "dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] " +
  "hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] " +
  "dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] " +
  "transition-all duration-300";

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithImage[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Upload form states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState('');
  // uploadSubjectId: ID môn học chọn từ dropdown (liên kết bảng Subject của admin)
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Edit states
  const [editingDocument, setEditingDocument] = useState<DocumentWithImage | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadOptions = useCallback(async () => {
    try {
      const [categoryData, subjectData] = await Promise.all([
        getCategories(),
        fetchSubjects().catch(() => []),
      ]);
      setCategories(categoryData);
      setSubjects(subjectData);
      setCategoryId((current) => current || categoryData[0]?.id || '');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh mục và môn học');
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserId = getCurrentUserId();
      const result = await getDocuments({
        search: debouncedSearch.trim() || undefined,
        categoryId: selectedCategory !== 'All' ? selectedCategory : undefined,
        // Gửi subjectId (UUID) để backend lọc chính xác
        subjectId: selectedSubject !== 'All' ? selectedSubject : undefined,
        // Backend không chấp nhận uploadedBy qua query cho endpoint này.
        // Lọc thêm phía client vẫn đảm bảo chỉ hiện tài liệu của người dùng hiện tại.
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const rawDocuments = result.documents as unknown;
      const documentList = Array.isArray(rawDocuments)
        ? rawDocuments
        : extractArray<DocumentWithImage>(rawDocuments, 'documents');

      // Lọc thêm ở phía client để đảm bảo chắc chắn không hiện tài liệu của người khác
      // dù backend có hỗ trợ param uploadedBy hay không.
      const ownDocumentsOnly = currentUserId
        ? (documentList as DocumentWithImage[]).filter(
          (doc) => (doc.uploadedBy || doc.user?.id) === currentUserId
        )
        : (documentList as DocumentWithImage[]);

      setDocuments(ownDocumentsOnly);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách tài liệu.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedSubject]);

  useEffect(() => { loadOptions(); }, [loadOptions]);
  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleTogglePublic = async (doc: DocumentWithImage) => {
    if (togglingId) return;
    setTogglingId(doc.id);
    try {
      const targetState = !doc.isPublic;
      const metadata: DocumentMetadata = {
        title: doc.title,
        description: doc.description || '',
        categoryId: doc.categoryId || doc.category?.id || '',
        subject: doc.subjectRef?.name || doc.subject || '',
        isPublic: targetState,
      };
      const updated = await updateDocument(doc.id, metadata, null);
      setDocuments((prev) =>
        prev.map((item) => (item.id === doc.id ? { ...item, ...updated } : item))
      );
      toast.success(targetState ? 'Đã chuyển sang chế độ CÔNG KHAI!' : 'Đã ẩn tài liệu thành RIÊNG TƯ!');
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật quyền riêng tư.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title.trim()) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const resetUploadForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setIsPublic(true);
    setCategoryId(categories[0]?.id || '');
    setUploadSubjectId('');
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!getToken()) { toast.error('Bạn cần đăng nhập để tải tài liệu lên.'); return; }
    if (!file) { toast.error('Vui lòng chọn file tài liệu cần tải lên!'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề tài liệu.'); return; }
    if (!uploadSubjectId) { toast.error('Vui lòng chọn môn học.'); return; }

    const selectedSubjectObj = subjects.find((s) => s.id === uploadSubjectId);

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('isPublic', String(isPublic));
      // Gửi subjectId để liên kết đúng bảng Subject của admin
      formData.append('subjectId', uploadSubjectId);
      // Gửi kèm tên text để tương thích hiển thị fallback
      if (selectedSubjectObj) formData.append('subject', selectedSubjectObj.name);
      if (categoryId) formData.append('categoryId', categoryId);

      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Lỗi tải lên tài liệu.');

      toast.success('Tải lên tài liệu thành công!');
      setIsUploadOpen(false);
      resetUploadForm();
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải lên tài liệu.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi hệ thống?')) return;
    try {
      await deleteDocument(docId);
      toast.success('Đã xóa tài liệu thành công!');
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xóa tài liệu.');
    }
  };

  const handleDownload = async (doc: DocumentWithImage) => {
    try {
      await downloadDocument(doc.id, doc.fileName || doc.title);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải tài liệu.');
    }
  };

  const handleEditSubmit = async (metadata: DocumentMetadata, file?: File | null) => {
    if (!editingDocument) return;
    setEditLoading(true);
    try {
      const updatedDocument = await updateDocument(editingDocument.id, metadata, file);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === editingDocument.id ? { ...doc, ...updatedDocument } : doc)),
      );
      toast.success('Đã sửa thông tin tài liệu!');
      setEditingDocument(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi sửa tài liệu.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUploadOpenChange = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open && !uploadLoading) resetUploadForm();
  };

  return (
    <div className="space-y-6 p-1 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Quản lý các tài liệu học tập bạn đã tải lên.
          </p>
        </div>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload tài liệu
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            aria-label="Tìm kiếm tài liệu"
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Lọc theo danh mục"
            title="Lọc theo danh mục"
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            aria-label="Lọc theo môn học"
            title="Lọc theo môn học"
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ` : ''}{s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-semibold">
        {loading ? 'Đang tải danh sách tài liệu...' : (
          <>Tìm thấy <span className="text-indigo-500">{documents.length}</span> tài liệu của bạn</>
        )}
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Đang tải danh sách tài liệu...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Bạn chưa có tài liệu nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thử thay đổi bộ lọc tìm kiếm hoặc upload tài liệu mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const imageUrl = getImageUrl(doc);
            const versionCount = getVersionCount(doc);
            const isToggling = togglingId === doc.id;

            return (
              <div key={doc.id} className={`${glowCard} rounded-2xl p-5 hover:-translate-y-1 flex flex-col justify-between overflow-hidden group`}>
                <div className="space-y-3">
                  {imageUrl && (
                    <div className="w-full h-32 overflow-hidden rounded-xl border border-border dark:border-slate-700 mb-3">
                      <img src={imageUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 w-full pt-1">
                    {!imageUrl && (
                      <div className="p-1.5 bg-sky-50 dark:bg-sky-500/10 rounded-md border border-sky-100 dark:border-sky-500/20">
                        <FileText className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                    )}
                    <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
                      {doc.category?.name || 'Tài liệu'}
                    </span>
                    <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 whitespace-nowrap">
                      {doc.subjectRef?.code || doc.subject || 'Môn học'}
                    </span>
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleTogglePublic(doc)}
                      title={doc.isPublic ? 'Đang công khai — nhấn để ẩn' : 'Đang riêng tư — nhấn để công khai'}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap transition-all active:scale-95 disabled:opacity-60 cursor-pointer ${doc.isPublic
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 hover:bg-teal-500/20'
                        : 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                    >
                      {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : doc.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {doc.isPublic ? 'Công khai' : 'Riêng tư'}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 transition-colors group-hover:text-cyan-500 dark:group-hover:text-cyan-400">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      <span className="text-sky-600 dark:text-cyan-300">
                        {doc.subjectRef?.name || doc.subject || 'Môn khác'}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-950 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                      <History className="w-3.5 h-3.5" />
                      <span>{versionCount} version</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 border-t border-slate-100 dark:border-slate-800 pt-4 mt-5 text-muted-foreground dark:text-slate-400 text-xs font-semibold text-center">
                  <button type="button" onClick={() => handleDownload(doc)} className="flex flex-col items-center gap-1 py-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Tải về</span>
                  </button>
                  <Link to={`/documents/${doc.id}`} className="flex flex-col items-center gap-1 py-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-center justify-center">
                    <Eye className="w-4 h-4 mx-auto" />
                    <span>Chi tiết</span>
                  </Link>
                  <button type="button" onClick={() => setEditingDocument(doc)} className="flex flex-col items-center gap-1 py-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(doc.id)} className="flex flex-col items-center gap-1 py-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={handleUploadOpenChange}>
        <DialogContent className={`${glowCard} sm:max-w-[500px] rounded-3xl p-6`}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Tải lên tài liệu học tập</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Chọn tài liệu học tập của bạn (PDF, DOCX, ZIP...) để chia sẻ hoặc lưu trữ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="file" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chọn tệp tin *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                className="rounded-xl border-slate-200 dark:border-slate-800 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 file:dark:bg-slate-800 file:dark:text-cyan-300"
              />
              {file && <p className="text-[10px] text-muted-foreground">Kích thước file: {formatBytes(file.size)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiêu đề tài liệu *</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Đề thi Toán cao cấp Đại học FPT"
                required
                className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả nội dung tài liệu học tập..."
                className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="categoryUpload" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Danh mục *</Label>
                <select
                  id="categoryUpload"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  aria-label="Chọn danh mục tài liệu"
                  title="Chọn danh mục tài liệu"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                >
                  {categories.length === 0 ? (
                    <option value="">Chưa có danh mục</option>
                  ) : categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="uploadSubject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Môn học *</Label>
                {/* Dropdown chọn từ danh sách môn học admin quản lý — gửi subjectId lên API */}
                <select
                  id="uploadSubject"
                  value={uploadSubjectId}
                  onChange={(event) => setUploadSubjectId(event.target.value)}
                  aria-label="Chọn môn học"
                  title="Chọn môn học"
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `[${s.code}] ` : ''}{s.name}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="text-[10px] text-amber-500">Chưa có môn học. Admin cần thêm môn học trước.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                aria-label="Công khai tài liệu cho mọi học sinh"
                title="Công khai tài liệu cho mọi học sinh"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-cyan-500"
              />
              <Label htmlFor="isPublic" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Công khai cho mọi học sinh xem và tải về
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUploadOpenChange(false)}
                className="rounded-xl border-slate-200 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
                disabled={uploadLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={uploadLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15"
              >
                {uploadLoading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DocumentMetadataDialog
        open={Boolean(editingDocument)}
        title="Sửa tài liệu"
        submitLabel="Lưu thay đổi"
        fileName={editingDocument?.fileName || editingDocument?.title}
        categories={categories}
        submitting={editLoading}
        allowFileChange
        initialValues={editingDocument ? {
          title: editingDocument.title,
          description: editingDocument.description || '',
          subject: editingDocument.subjectRef?.name || editingDocument.subject || '',
          categoryId: editingDocument.categoryId || editingDocument.category?.id || '',
          isPublic: editingDocument.isPublic ?? true,
        } : undefined}
        onClose={() => { if (!editLoading) setEditingDocument(null); }}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}