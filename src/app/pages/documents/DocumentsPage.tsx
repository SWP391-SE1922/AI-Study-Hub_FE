import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Upload, Eye, Trash2, Download, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { apiRequest } from '../../services/api';
import { toast } from 'sonner';

interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  imgUrl?: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  subjectRef: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Modal Upload states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imgUrl, setImgUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories & subjects for filters and form
      const categoriesData = await apiRequest('/categories');
      const catsArray = categoriesData.categories || categoriesData;
      setCategories(catsArray);
      if (catsArray.length > 0) setCategoryId(catsArray[0].id);

      const subjectsData = await apiRequest('/subjects');
      const subsArray = subjectsData.subjects || subjectsData;
      setSubjects(subsArray);
      if (subsArray.length > 0) setSubjectId(subsArray[0].id);

      // Fetch documents
      let query = '/documents?';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory !== 'All') query += `categoryId=${selectedCategory}&`;
      if (selectedSubject !== 'All') query += `subjectId=${selectedSubject}&`;

      const docsData = await apiRequest(query);
      setDocuments(docsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedSubject]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      if (!title) {
        // Auto fill title with file name without extension
        const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn file tài liệu cần tải lên!');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('subjectId', subjectId);
      formData.append('isPublic', String(isPublic));
      if (imgUrl) formData.append('imgUrl', imgUrl);

      // Call API manually because apiRequest handles application/json content-type by default
      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('ngrok-skip-browser-warning', 'true');

      const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const apiUrl = `${cleanUrl}/api/documents`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Lỗi tải lên tài liệu.');
      }

      toast.success('Tải lên tài liệu thành công!');
      setIsUploadOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setImgUrl('');
      setFile(null);
      
      // Reload documents
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải lên tài liệu.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi hệ thống?')) {
      try {
        await apiRequest(`/documents/${docId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa tài liệu thành công!');
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa tài liệu.');
      }
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const data = await apiRequest(`/documents/${docId}/download`);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        toast.error('Không lấy được link tải tệp tin.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải tài liệu.');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-1 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu học tập</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Tìm kiếm, chia sẻ và tham khảo tài liệu học tập của học sinh.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10 self-start sm:self-auto">
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

      {/* Bộ lọc & Tìm kiếm */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">Tất cả môn học</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.code ? `[${sub.code}] ` : ''}{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-semibold">Tìm thấy <span className="text-indigo-500">{documents.length}</span> tài liệu</p>

      {/* Danh sách tài liệu */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
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
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/40 transition-all shadow-sm flex flex-col justify-between group">
              <div className="space-y-3">
                {doc.imgUrl && (
                  <div className="w-full h-32 overflow-hidden rounded-xl border border-border mb-3">
                    <img src={doc.imgUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  {!doc.imgUrl && (
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
                    <span className="text-indigo-500 dark:text-indigo-400">{doc.subjectRef?.name || 'Môn khác'}</span>
                    <span>•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Khối Action Buttons */}
              <div className="grid grid-cols-3 gap-1 border-t border-border pt-4 mt-5 text-muted-foreground text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleDownload(doc.id)}
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
          ))}
        </div>
      )}

      {/* Upload Modal Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
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
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-semibold text-foreground">Môn học *</Label>
                <select
                  id="subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code ? `[${sub.code}] ` : ''}{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imgUrl" className="text-sm font-semibold text-foreground">Link ảnh đại diện (imgUrl)</Label>
              <Input
                id="imgUrl"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-... hoặc /uploads/ảnh.png"
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="isPublic" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Công khai cho mọi học sinh xem và tải về
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="rounded-xl border-slate-200">
                Hủy
              </Button>
              <Button type="submit" disabled={uploadLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {uploadLoading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}