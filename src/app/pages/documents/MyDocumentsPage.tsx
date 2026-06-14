import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Upload, Eye, Trash2, Download, AlertCircle, Edit, History, Globe, Lock, ChevronLeft, ChevronRight, File, X, Folder, FolderPlus, ArrowLeft, ArrowUp } from 'lucide-react';
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
  folderId: string | null;
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

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
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

interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export function MyDocumentsPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStorage, setUserStorage] = useState<{ usedStorage: number; storageLimit: number } | null>(null);

  const fetchUserStorage = async () => {
    try {
      const data = await apiRequest('/auth/me');
      if (data && data.user) {
        setUserStorage({
          usedStorage: data.user.usedStorage || 0,
          storageLimit: data.user.storageLimit || 104857600
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải dung lượng bộ nhớ:', err);
    }
  };

  // Explorer Navigation Path State
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [path, setPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Tài liệu gốc' }
  ]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Flat Search Mode Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals Open State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  // Loading States
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [newFolderLoading, setNewFolderLoading] = useState(false);

  // Folder Form State
  const [newFolderName, setNewFolderName] = useState('');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategoryId, setUploadCategoryId] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadIsPublic, setUploadIsPublic] = useState(true);
  const [uploadImgUrl, setUploadImgUrl] = useState('');
 
  // Edit Form State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editImgUrl, setEditImgUrl] = useState('');

  // Versions State
  const [versionsDocTitle, setVersionsDocTitle] = useState('');
  const [docVersions, setDocVersions] = useState<DocumentVersion[]>([]);

  // Determine if we are browsing folders or showing global search results
  const isBrowsingMode = !search && selectedCategory === 'All' && selectedSubject === 'All';

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

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('ngrok-skip-browser-warning', 'true');
      headers.set('Content-Type', 'application/json');

      const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const folderParam = currentFolderId === 'root' ? 'root' : currentFolderId;

      const response = await fetch(`${cleanUrl}/api/resources?folderId=${folderParam}`, { headers });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Lỗi khi tải tài nguyên.');
      }

      setFolders(resData.data?.folders || []);
      setFiles(resData.data?.files || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải tài nguyên.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlatSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('ngrok-skip-browser-warning', 'true');
      headers.set('Content-Type', 'application/json');

      const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      
      let query = `/api/documents/my-documents?page=${page}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') query += `&categoryId=${selectedCategory}`;
      if (selectedSubject !== 'All') query += `&subjectId=${selectedSubject}`;

      const response = await fetch(`${cleanUrl}${query}`, { headers });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Lỗi khi tìm kiếm tài liệu.');
      }

      setFiles(resData.data || []);
      setFolders([]); // No folders shown in flat search results
      if (resData.pagination) {
        setTotalPages(resData.pagination.totalPages || 1);
        setTotalCount(resData.pagination.total || 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tìm kiếm tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndSubjects();
    fetchUserStorage();
  }, []);

  useEffect(() => {
    if (isBrowsingMode) {
      fetchResources();
    } else {
      fetchFlatSearchResults();
    }
  }, [currentFolderId, page, search, selectedCategory, selectedSubject, isBrowsingMode]);

  // Reset page and route when searching
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedSubject]);

  const handleEnterFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setPath((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    const clickedFolder = path[index];
    setCurrentFolderId(clickedFolder.id);
    setPath(path.slice(0, index + 1));
  };

  const handleGoUp = () => {
    if (path.length > 1) {
      handleNavigateToBreadcrumb(path.length - 2);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setNewFolderLoading(true);
    try {
      await apiRequest('/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId === 'root' ? null : currentFolderId
        })
      });

      toast.success('Tạo thư mục thành công!');
      setNewFolderName('');
      setIsNewFolderOpen(false);
      fetchResources();
      fetchUserStorage();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo thư mục.');
    } finally {
      setNewFolderLoading(false);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation(); // Avoid triggering navigation inside the folder
    if (confirm('Bạn có chắc chắn muốn xóa thư mục này? Thư mục phải rỗng mới có thể xóa.')) {
      try {
        await apiRequest(`/folders/${folderId}`, {
          method: 'DELETE'
        });
        toast.success('Xóa thư mục thành công!');
        fetchResources();
        fetchUserStorage();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa thư mục. Hãy chắc chắn thư mục không chứa file hoặc thư mục con.');
      }
    }
  };

  const checkStorageLimit = (fileSize: number): boolean => {
    if (!userStorage) return true;
    const remaining = userStorage.storageLimit - userStorage.usedStorage;
    if (fileSize > remaining) {
      toast.error(`Dung lượng còn lại không đủ (Trống: ${formatBytes(remaining)})! Vui lòng đăng ký gói dịch vụ cao hơn để tải tệp tin này (${formatBytes(fileSize)}).`);
      return false;
    }
    return true;
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!checkStorageLimit(selected.size)) {
        e.target.value = '';
        setUploadFile(null);
        return;
      }
      setUploadFile(selected);
      if (!uploadTitle) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
        setUploadTitle(nameWithoutExt);
      }
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!checkStorageLimit(selected.size)) {
        e.target.value = '';
        setEditFile(null);
        return;
      }
      setEditFile(selected);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Vui lòng chọn file tài liệu cần tải lên!');
      return;
    }
    if (!checkStorageLimit(uploadFile.size)) {
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
      if (uploadImgUrl) formData.append('imgUrl', uploadImgUrl);
      
      // Associate with current folder if not root
      if (currentFolderId !== 'root') {
        formData.append('folderId', currentFolderId);
      }

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
      setUploadTitle('');
      setUploadDescription('');
      setUploadImgUrl('');
      setUploadFile(null);
      
      // Reload resources
      if (isBrowsingMode) fetchResources(); else fetchFlatSearchResults();
      fetchUserStorage();
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
    setEditCategoryId(doc.category?.id || (categories[0]?.id || ''));
    setEditSubjectId(doc.subjectRef?.id || (subjects[0]?.id || ''));
    setEditIsPublic(doc.isPublic);
    setEditImgUrl(doc.imgUrl || '');
    setEditFile(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocId) return;
    if (editFile && !checkStorageLimit(editFile.size)) {
      return;
    }

    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('categoryId', editCategoryId);
      formData.append('subjectId', editSubjectId);
      formData.append('isPublic', String(editIsPublic));
      formData.append('imgUrl', editImgUrl);
      
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

      toast.success('Cập nhật thông tin tài liệu thành công!');
      setIsEditOpen(false);
      setEditingDocId(null);
      setEditFile(null);
      setEditImgUrl('');
      if (isBrowsingMode) fetchResources(); else fetchFlatSearchResults();
      fetchUserStorage();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật tài liệu.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.')) {
      try {
        await apiRequest(`/documents/${docId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa tài liệu thành công!');
        if (isBrowsingMode) fetchResources(); else fetchFlatSearchResults();
        fetchUserStorage();
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
        toast.error('Không lấy được đường dẫn tải tệp.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải tài liệu.');
    }
  };

  const handleOpenVersions = async (doc: DocumentItem) => {
    setVersionsDocTitle(doc.title);
    setDocVersions([]);
    setIsVersionsOpen(true);
    setVersionsLoading(true);
    try {
      const data = await apiRequest(`/documents/${doc.id}/versions`);
      setDocVersions(data.versions || data || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải lịch sử phiên bản.');
    } finally {
      setVersionsLoading(false);
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
      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card border border-border p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Tài liệu của tôi
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Quản lý và sắp xếp các tài liệu học tập của bạn theo cấu trúc thư mục ảo.</p>
        </div>

        {/* Storage Capacity Widget */}
        {userStorage && (
          <div className="flex flex-col p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-950/20 dark:bg-indigo-950/10 w-full sm:w-80 shrink-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dung lượng lưu trữ</span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatBytes(userStorage.usedStorage)} / {formatBytes(userStorage.storageLimit)}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (userStorage.usedStorage / userStorage.storageLimit) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-bold">
              Đã sử dụng {((userStorage.usedStorage / userStorage.storageLimit) * 100).toFixed(1)}% dung lượng cho phép.
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          {isBrowsingMode && (
            <Button onClick={() => setIsNewFolderOpen(true)} variant="outline" className="border-border rounded-xl gap-2 hover:bg-accent">
              <FolderPlus className="w-4 h-4 text-indigo-500" />
              Tạo thư mục
            </Button>
          )}
          <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10">
            <Upload className="w-4 h-4" />
            Upload tài liệu
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu toàn cục..."
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

      {/* Breadcrumb Path Navigation (only in browsing mode) */}
      {isBrowsingMode ? (
        <div className="flex items-center justify-between bg-muted/30 border border-border rounded-xl p-3 px-4">
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-500 font-semibold">
            {path.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="text-slate-400 font-bold">/</span>}
                <button
                  type="button"
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className={`transition-colors rounded px-1.5 py-0.5 hover:bg-accent hover:text-indigo-600 ${index === path.length - 1 ? 'text-foreground font-bold' : ''}`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          {path.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleGoUp} className="text-xs font-bold gap-1 rounded-lg h-8 px-2.5">
              <ArrowUp className="w-3.5 h-3.5" />
              Lên thư mục cha
            </Button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 px-3 py-2 rounded-xl w-max">
          💡 Chế độ tìm kiếm toàn cục: Đang hiển thị kết quả từ tất cả các thư mục.
        </p>
      )}

      {/* Resource display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang tải tài nguyên...</p>
        </div>
      ) : isBrowsingMode && folders.length === 0 && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Thư mục này trống</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bạn có thể tạo thư mục mới hoặc tải lên tài liệu học tập ngay bây giờ.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders Section */}
          {isBrowsingMode && folders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thư mục ({folders.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleEnterFolder(folder.id, folder.name)}
                    className="bg-card border border-border rounded-xl p-3.5 hover:border-indigo-500/40 hover:shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className="text-sm font-bold text-foreground truncate" title={folder.name}>
                        {folder.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(e, folder.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Xóa thư mục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isBrowsingMode ? `Tài liệu (${files.length})` : `Kết quả tìm kiếm (${totalCount})`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((doc) => (
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
                        <div className="flex gap-1.5 items-center">
                          <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {doc.category?.name || 'Tài liệu'}
                          </span>
                          {doc.isPublic ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                              <Globe className="w-3 h-3" />
                              Công khai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Lock className="w-3 h-3" />
                              Riêng tư
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 transition-colors group-hover:text-indigo-500">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-2 font-medium">
                          <span className="text-indigo-500 dark:text-indigo-400">{doc.subjectRef?.name || 'Môn học khác'}</span>
                          <span>•</span>
                          <span>{formatBytes(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 font-bold bg-secondary/50 px-2.5 py-1 rounded-lg w-max border border-border">
                          Tải xuống: {doc.downloadCount} lượt
                        </div>
                      </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-4 gap-1 border-t border-border pt-4 mt-5 text-muted-foreground text-xs font-semibold text-center">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc.id)}
                        className="flex flex-col items-center gap-1 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Tải tệp tin về máy"
                      >
                        <Download className="w-4 h-4" />
                        <span>Tải về</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenVersions(doc)}
                        className="flex flex-col items-center gap-1 py-1 hover:text-indigo-500 transition-colors"
                        title="Xem lịch sử các phiên bản"
                      >
                        <History className="w-4 h-4" />
                        <span>Phiên bản</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        className="flex flex-col items-center gap-1 py-1 hover:text-indigo-500 transition-colors"
                        title="Chỉnh sửa thông tin và tải lên file mới"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="flex flex-col items-center gap-1 py-1 hover:text-destructive transition-colors"
                        title="Xóa tài liệu vĩnh viễn"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isBrowsingMode && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Không tìm thấy tài liệu phù hợp</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hãy thử đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
            </div>
          )}

          {/* Search Pagination controls */}
          {!isBrowsingMode && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-xl border-border"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Trước
              </Button>
              <span className="text-sm font-semibold">Trang {page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-xl border-border"
              >
                Sau <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New Folder Modal */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-500" />
              Tạo thư mục mới
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Nhập tên cho thư mục ảo của bạn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="folder-name" className="text-sm font-semibold text-foreground">Tên thư mục *</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ví dụ: Bài tập Toán đại số"
                required
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsNewFolderOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={newFolderLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {newFolderLoading ? 'Đang tạo...' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              Tải lên tài liệu học tập mới {currentFolderId !== 'root' && `vào "${path[path.length - 1]?.name}"`}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Chia sẻ tài liệu của bạn (PDF, Word, Excel, PowerPoint, Zip...).
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
                <p className="text-[10px] text-muted-foreground">Kích thước file: {formatBytes(uploadFile.size)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-title" className="text-sm font-semibold text-foreground">Tiêu đề tài liệu *</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Ví dụ: Đề cương chi tiết Giải tích 1"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-description" className="text-sm font-semibold text-foreground">Mô tả nội dung</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung tài liệu..."
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

            <div className="space-y-1.5">
              <Label htmlFor="upload-imgUrl" className="text-sm font-semibold text-foreground">Link ảnh đại diện (imgUrl)</Label>
              <Input
                id="upload-imgUrl"
                value={uploadImgUrl}
                onChange={(e) => setUploadImgUrl(e.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-... hoặc /uploads/ảnh.png"
                className="rounded-xl"
              />
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
                Công khai tài liệu này cho học sinh khác xem và tải về
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
            <DialogTitle className="text-xl font-bold text-foreground">Chỉnh sửa thông tin tài liệu</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Thay đổi chi tiết hoặc tải lên tệp tin mới để tạo phiên bản cập nhật.
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
              <Label htmlFor="edit-description" className="text-sm font-semibold text-foreground">Mô tả nội dung</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="edit-imgUrl" className="text-sm font-semibold text-foreground">Link ảnh đại diện (imgUrl)</Label>
              <Input
                id="edit-imgUrl"
                value={editImgUrl}
                onChange={(e) => setEditImgUrl(e.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-... hoặc /uploads/ảnh.png"
                className="rounded-xl"
              />
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
                Công khai tài liệu này cho học sinh khác xem và tải về
              </Label>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label htmlFor="edit-file" className="text-sm font-bold text-foreground">Tải lên tệp tin mới (Tùy chọn)</Label>
              <DialogDescription className="text-[11px] text-muted-foreground pb-1">
                Nếu bạn tải tệp mới lên, hệ thống sẽ tự động lưu tệp này thành phiên bản mới (version tăng lên).
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

      {/* Versions Dialog */}
      <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Lịch sử phiên bản
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground line-clamp-1">
              Tài liệu: {versionsDocTitle}
            </DialogDescription>
          </DialogHeader>

          {versionsLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-6 h-6 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground">Đang tải lịch sử phiên bản...</p>
            </div>
          ) : docVersions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Không tìm thấy phiên bản nào của tài liệu này.
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {docVersions.map((ver) => (
                <div key={ver.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold text-xs">
                      v{ver.version}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground truncate max-w-[280px]" title={ver.fileName}>
                        {ver.fileName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Kích thước: {formatBytes(ver.fileSize)} • Ngày tải lên: {new Date(ver.createdAt).toLocaleDateString('vi-VN')} {new Date(ver.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" onClick={() => setIsVersionsOpen(false)} className="rounded-xl w-full sm:w-auto">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
