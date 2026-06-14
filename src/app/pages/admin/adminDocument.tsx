import React, { useEffect, useState } from 'react';
import { Download, FileText, Eye, Trash2, Search, Filter, AlertCircle, RefreshCw, ToggleLeft, ToggleRight, Upload, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '@/app/components/ui/label';
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
  categoryId?: string | null;
  subjectId?: string | null;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
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

export function DocumentPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories & Subjects states
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Modals Open State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Loading States
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategoryId, setUploadCategoryId] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadIsPublic, setUploadIsPublic] = useState(true);

  // Edit Form State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  const fetchCategoriesAndSubjects = async () => {
    try {
      const categoriesData = await apiRequest('/categories');
      const catsArray = categoriesData.categories || categoriesData;
      setCategories(catsArray);
      if (catsArray.length > 0) {
        setUploadCategoryId(catsArray[0].id);
        setEditCategoryId(catsArray[0].id);
      }

      const subjectsData = await apiRequest('/subjects');
      const subsArray = subjectsData.subjects || subjectsData;
      setSubjects(subsArray);
      if (subsArray.length > 0) {
        setUploadSubjectId(subsArray[0].id);
        setEditSubjectId(subsArray[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh mục/môn học:', err);
    }
  };

  const fetchDocuments = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = search ? `/documents?search=${encodeURIComponent(search)}` : '/documents';
      const data = await apiRequest(endpoint);
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndSubjects();
  }, []);

  useEffect(() => {
    fetchDocuments(searchQuery);
  }, [searchQuery]);

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setUploadFile(selected);
      if (!uploadTitle) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
        setUploadTitle(nameWithoutExt);
      }
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Vui lòng chọn file tài liệu cần tải lên!');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('categoryId', uploadCategoryId);
      formData.append('subjectId', uploadSubjectId);
      formData.append('isPublic', String(uploadIsPublic));

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

      toast.success('Admin tải lên tài liệu thành công!');
      setIsUploadOpen(false);
      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      fetchDocuments(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải lên tài liệu.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDocId(doc.id);
    setEditTitle(doc.title);
    setEditDescription(doc.description || '');
    
    // Set category id
    const catId = doc.categoryId || doc.category?.id || categories.find(c => c.name === doc.category?.name)?.id || (categories[0]?.id || '');
    setEditCategoryId(catId);

    // Set subject id
    const subId = doc.subjectId || doc.subjectRef?.id || (subjects[0]?.id || '');
    setEditSubjectId(subId);

    setEditIsPublic(doc.isPublic);
    setEditFile(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocId) return;

    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('categoryId', editCategoryId);
      if (editSubjectId) formData.append('subjectId', editSubjectId);
      formData.append('isPublic', String(editIsPublic));

      if (editFile) {
        formData.append('file', editFile);
      }

      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('ngrok-skip-browser-warning', 'true');

      const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const apiUrl = `${cleanUrl}/api/documents/${editingDocId}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Lỗi khi cập nhật tài liệu.');
      }

      toast.success('Admin cập nhật thông tin tài liệu thành công!');
      setIsEditOpen(false);
      setEditingDocId(null);
      setEditFile(null);
      fetchDocuments(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật tài liệu.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleTogglePublic = async (docId: string, currentPublic: boolean) => {
    try {
      await apiRequest(`/documents/${docId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic: !currentPublic }),
      });
      toast.success(`Đã chuyển tài liệu sang trạng thái ${!currentPublic ? 'Công khai' : 'Riêng tư'}`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isPublic: !currentPublic } : d))
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thay đổi trạng thái công khai.');
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này? Hợp đồng hoặc tệp tin vật lý cũng sẽ bị gỡ bỏ.')) {
      try {
        await apiRequest(`/documents/${docId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa tài liệu khỏi hệ thống thành công!');
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa tài liệu.');
      }
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const data = await apiRequest(`/documents/${docId}/download`);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        toast.error('Không tìm thấy link tải xuống.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải file tài liệu.');
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
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Title bar */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quản lý Tài liệu</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Tìm kiếm, kiểm duyệt quyền truy cập và xóa các tài liệu trên hệ thống.</p>
          </div>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10 self-start sm:self-auto">
            <Upload className="w-4 h-4" />
            Upload tài liệu mới
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên tài liệu hoặc môn học..."
              className="pl-10 rounded-xl"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang tải danh sách tài liệu...</p>
        </div>
      ) : (
        <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-4 px-6">Tài liệu</TableHead>
                  <TableHead className="py-4 px-4">Danh mục</TableHead>
                  <TableHead className="py-4 px-4">Người tải</TableHead>
                  <TableHead className="py-4 px-4">Lượt tải</TableHead>
                  <TableHead className="py-4 px-4">Kích thước</TableHead>
                  <TableHead className="py-4 px-4">Ngày đăng</TableHead>
                  <TableHead className="py-4 px-4">Trạng thái</TableHead>
                  <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Không tìm thấy tài liệu nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{doc.title}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 font-mono">{doc.fileName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Badge variant="outline" className="rounded-lg">
                          {doc.category?.name || 'Tài liệu'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.user?.fullName}</span>
                          <span className="text-[10px]">{doc.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 font-bold text-sm text-foreground">{doc.downloadCount}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-xs">{formatBytes(doc.fileSize)}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-xs">
                        {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePublic(doc.id, doc.isPublic)}
                          className="flex items-center gap-1.5 focus:outline-none"
                          title="Click để chuyển đổi trạng thái"
                        >
                          {doc.isPublic ? (
                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1">
                              <ToggleRight className="w-3.5 h-3.5" /> Công khai
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="rounded-lg flex items-center gap-1">
                              <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" /> Riêng tư
                            </Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                            title="Xem chi tiết & Preview"
                          >
                            <Link to={`/documents/${doc.id}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg"
                            title="Tải tệp tin về máy"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(doc)}
                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 rounded-lg text-indigo-500"
                            title="Sửa thông tin tài liệu"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-lg"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Admin tải lên tài liệu mới</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tải tài liệu lưu trữ lên hệ thống dưới vai trò Admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="upload-file" className="text-sm font-semibold text-foreground">Chọn tệp tin *</Label>
              <Input
                id="upload-file"
                type="file"
                onChange={handleUploadFileChange}
                required
                className="rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-400"
              />
              {uploadFile && (
                <p className="text-[10px] text-muted-foreground">Kích thước: {formatBytes(uploadFile.size)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-title" className="text-sm font-semibold text-foreground">Tiêu đề tài liệu *</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Ví dụ: Tài liệu hướng dẫn sử dụng"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-description" className="text-sm font-semibold text-foreground">Mô tả chi tiết</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Mô tả nội dung..."
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="upload-category" className="text-sm font-semibold text-foreground">Danh mục *</Label>
                <select
                  id="upload-category"
                  value={uploadCategoryId}
                  onChange={(e) => setUploadCategoryId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-subject" className="text-sm font-semibold text-foreground">Môn học *</Label>
                <select
                  id="upload-subject"
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code ? `[${sub.code}] ` : ''}{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="upload-isPublic"
                type="checkbox"
                checked={uploadIsPublic}
                onChange={(e) => setUploadIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="upload-isPublic" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Công khai tài liệu này cho học sinh xem và tải về
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={uploadLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {uploadLoading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Admin chỉnh sửa tài liệu</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Thay đổi chi tiết hoặc tải lên tệp mới (để tạo phiên bản mới).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-sm font-semibold text-foreground">Tiêu đề tài liệu *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-sm font-semibold text-foreground">Mô tả tài liệu</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-category" className="text-sm font-semibold text-foreground">Danh mục *</Label>
                <select
                  id="edit-category"
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-subject" className="text-sm font-semibold text-foreground">Môn học *</Label>
                <select
                  id="edit-subject"
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code ? `[${sub.code}] ` : ''}{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="edit-isPublic"
                type="checkbox"
                checked={editIsPublic}
                onChange={(e) => setEditIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="edit-isPublic" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Công khai tài liệu này cho học sinh xem và tải về
              </Label>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label htmlFor="edit-file" className="text-sm font-bold text-foreground">Tải lên tệp tin mới (Tùy chọn)</Label>
              <DialogDescription className="text-[11px] text-muted-foreground pb-1">
                Tải lên tệp mới sẽ tạo phiên bản mới kế tiếp cho tài liệu này.
              </DialogDescription>
              <Input
                id="edit-file"
                type="file"
                onChange={handleEditFileChange}
                className="rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-400"
              />
              {editFile && (
                <p className="text-[10px] text-muted-foreground">Kích thước file mới: {formatBytes(editFile.size)}</p>
              )}
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={editLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
