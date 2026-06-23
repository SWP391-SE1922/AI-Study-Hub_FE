import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Download, Eye, FileText, Search, Trash2, Upload } from 'lucide-react';
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
import {
  deleteDocument,
  downloadDocument,
  getCategories,
  getDocuments,
  getToken,
  toAbsoluteFileUrl,
  type CategoryItem,
  type DocumentItem,
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
  data?: T | { subjects?: T; categories?: T; documents?: T };
  subjects?: T;
  categories?: T;
  documents?: T;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3636/api').replace(/\/$/, '');

function formatBytes(bytes?: number, decimals = 2) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function extractArray<T>(payload: ApiEnvelope<T[]> | T[] | unknown, key: 'subjects' | 'categories' | 'documents'): T[] {
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
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/subjects`, { headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Lỗi API ${response.status}`);
  }

  return extractArray<SubjectItem>(payload, 'subjects');
}

function getImageUrl(doc: DocumentWithImage) {
  return doc.imgUrl ? toAbsoluteFileUrl(doc.imgUrl) : '';
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithImage[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imgUrl, setImgUrl] = useState('');

  const loadOptions = useCallback(async () => {
    try {
      const [categoryData, subjectData] = await Promise.all([
        getCategories(),
        fetchSubjects().catch(() => []),
      ]);

      setCategories(categoryData);
      setSubjects(subjectData);

      setCategoryId((current) => current || categoryData[0]?.id || '');
      setSubjectId((current) => current || subjectData[0]?.id || '');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh mục và môn học');
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDocuments({
        search: search.trim() || undefined,
        categoryId: selectedCategory !== 'All' ? selectedCategory : undefined,
        subjectId: selectedSubject !== 'All' ? selectedSubject : undefined,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const rawDocuments = result.documents as unknown;
      const documentList = Array.isArray(rawDocuments)
        ? rawDocuments
        : extractArray<DocumentWithImage>(rawDocuments, 'documents');

      setDocuments(documentList as DocumentWithImage[]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Lỗi khi tải danh sách tài liệu.';
      setError(message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedSubject]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const resetUploadForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setImgUrl('');
    setIsPublic(true);
    setCategoryId(categories[0]?.id || '');
    setSubjectId(subjects[0]?.id || '');
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!getToken()) {
      toast.error('Bạn cần đăng nhập để tải tài liệu lên.');
      return;
    }

    if (!file) {
      toast.error('Vui lòng chọn file tài liệu cần tải lên!');
      return;
    }

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu.');
      return;
    }

    setUploadLoading(true);
    try {
      const selectedSubjectItem = subjects.find((subject) => subject.id === subjectId);
      const formData = new FormData();

      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('isPublic', String(isPublic));

      if (categoryId) formData.append('categoryId', categoryId);
      if (subjectId) formData.append('subjectId', subjectId);
      if (selectedSubjectItem?.name) formData.append('subject', selectedSubjectItem.name);
      if (imgUrl.trim()) formData.append('imgUrl', imgUrl.trim());

      const headers: Record<string, string> = {
        Authorization: `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': 'true',
      };

      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || 'Lỗi tải lên tài liệu.');
      }

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

  const handleUploadOpenChange = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open && !uploadLoading) resetUploadForm();
  };

  return (
    <div className="space-y-6 p-1 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu học tập</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Tìm kiếm, chia sẻ và tham khảo tài liệu học tập của học sinh.
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

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
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
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code ? `[${subject.code}] ` : ''}{subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-semibold">
        {loading ? 'Đang tải danh sách tài liệu...' : (
          <>Tìm thấy <span className="text-indigo-500">{documents.length}</span> tài liệu</>
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
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Không tìm thấy tài liệu nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thử thay đổi bộ lọc tìm kiếm hoặc upload tài liệu mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const imageUrl = getImageUrl(doc);

            return (
              <div key={doc.id} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/40 transition-all shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  {imageUrl && (
                    <div className="w-full h-32 overflow-hidden rounded-xl border border-border mb-3">
                      <img
                        src={imageUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    {!imageUrl && (
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                    )}
                    <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {doc.category?.name || 'Tài liệu'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 transition-colors group-hover:text-indigo-500">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-2 font-medium">
                      <span className="text-indigo-500 dark:text-indigo-400">
                        {doc.subjectRef?.name || doc.subject || 'Môn khác'}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 border-t border-border pt-4 mt-5 text-muted-foreground text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="flex flex-col items-center gap-1 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải về</span>
                  </button>

                  <Link
                    to={`/documents/${doc.id}`}
                    className="flex flex-col items-center gap-1 py-1 hover:text-indigo-500 transition-colors text-center"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Chi tiết</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="flex flex-col items-center gap-1 py-1 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isUploadOpen} onOpenChange={handleUploadOpenChange}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Tải lên tài liệu học tập</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Chọn tài liệu học tập của bạn (PDF, DOCX, ZIP...) để chia sẻ hoặc lưu trữ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="file" className="text-sm font-semibold text-foreground">Chọn tệp tin *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                className="rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-400"
              />
              {file && (
                <p className="text-[10px] text-muted-foreground">Kích thước file: {formatBytes(file.size)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold text-foreground">Tiêu đề tài liệu *</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Đề thi Toán cao cấp Đại học FPT"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold text-foreground">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả nội dung tài liệu học tập..."
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-foreground">Danh mục *</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {categories.length === 0 ? (
                    <option value="">Chưa có danh mục</option>
                  ) : categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-semibold text-foreground">Môn học *</Label>
                <select
                  id="subject"
                  value={subjectId}
                  onChange={(event) => setSubjectId(event.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {subjects.length === 0 ? (
                    <option value="">Chưa có môn học</option>
                  ) : subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `[${subject.code}] ` : ''}{subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imgUrl" className="text-sm font-semibold text-foreground">Link ảnh đại diện (imgUrl)</Label>
              <Input
                id="imgUrl"
                value={imgUrl}
                onChange={(event) => setImgUrl(event.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-... hoặc /uploads/ảnh.png"
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                className="rounded-xl border-slate-200"
                disabled={uploadLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={uploadLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {uploadLoading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
