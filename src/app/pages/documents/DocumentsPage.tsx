import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Download, Eye, FileText, History, Pencil, Search, Trash2, Upload, Globe, Lock, Loader2, FolderPlus, Folder, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { SpotlightCard } from '../../components/SpotlightCard';
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
  getMyDocuments,
  getToken,
  toAbsoluteFileUrl,
  updateDocument,
  getResources,
  createFolder,
  deleteFolder,
  getPublicSettings,
  type FolderItem,
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
  const [recentDocs, setRecentDocs] = useState<DocumentWithImage[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Database-backed folder states
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, type: 'folder' | 'document', id: string, name: string } | null>(null);

  // Upload form states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState('');
  // uploadSubject: tên môn học do người dùng tự điền (giúp AI dễ tìm và phân loại)
  const [uploadSubject, setUploadSubject] = useState('');
  const [maxUploadSize, setMaxUploadSize] = useState(10485760); // 10MB default

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
      // 1. Tải tài nguyên (folders con và files con) của thư mục hiện tại từ DB
      const result = await getResources(currentFolderId);
      setFolders(result.folders || []);
      
      const rawDocuments = result.files as unknown;
      const documentList = Array.isArray(rawDocuments)
        ? rawDocuments
        : extractArray<DocumentWithImage>(rawDocuments, 'documents');
        
      setDocuments(documentList);

      // 2. Tải danh sách phẳng các folder để hiển thị ở Dropdown di chuyển
      const rootResources = await getResources(null);
      setAllFolders(rootResources.folders || []);

      // 3. Tải tài liệu gần đây (cho trường hợp thư mục trống)
      try {
        const recentResult = await getMyDocuments();
        const allMyDocs = Array.isArray(recentResult.documents) ? recentResult.documents : extractArray<DocumentWithImage>(recentResult, 'documents');
        const sortedRecents = [...allMyDocs].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
        setRecentDocs(sortedRecents as DocumentWithImage[]);
      } catch (err) {
        console.warn('Cannot load recent docs', err);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách tài liệu.');
      setDocuments([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => { loadOptions(); }, [loadOptions]);
  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validation định dạng
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const isDocx = fileExt === 'docx';
    const isPdf = fileExt === 'pdf';

    if (!allowedTypes.includes(selectedFile.type) && !isDocx && !isPdf) {
      toast.error('Định dạng không được hỗ trợ. Vui lòng chỉ chọn file .pdf hoặc .docx');
      event.target.value = '';
      return;
    }

    // Validation dung lượng
    if (selectedFile.size > maxUploadSize) {
      toast.error(`File vượt quá giới hạn ${(maxUploadSize / (1024*1024)).toFixed(1)}MB. Vui lòng chọn file nhẹ hơn.`);
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
    if (!title.trim()) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const handleCreateFolderClick = () => {
    setNewFolderName('');
    setIsCreateFolderOpen(true);
  };

  const handleConfirmCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFolderName.trim()) { toast.error('Vui lòng nhập tên thư mục.'); return; }
    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      toast.success(`Đã tạo thư mục: ${newFolderName.trim()}`);
      setIsCreateFolderOpen(false);
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo thư mục.');
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    setDeleteConfirm({ isOpen: true, type: 'folder', id: folderId, name: folderName });
  };

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    setDeleteConfirm({ isOpen: true, type: 'document', id: docId, name: docTitle });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'folder') {
        await deleteFolder(deleteConfirm.id);
        toast.success(`Đã xóa thư mục "${deleteConfirm.name}"!`);
        if (currentFolderId === deleteConfirm.id) {
          setCurrentFolderId(null);
          setCurrentFolderName(null);
        }
      } else {
        await deleteDocument(deleteConfirm.id);
        toast.success(`Đã xóa tài liệu "${deleteConfirm.name}"!`);
        setDocuments(prev => prev.filter(doc => doc.id !== deleteConfirm.id));
        setRecentDocs(prev => prev.filter(doc => doc.id !== deleteConfirm.id));
      }
      setDeleteConfirm(null);
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : `Lỗi khi xóa ${deleteConfirm.type === 'folder' ? 'thư mục' : 'tài liệu'}.`);
    }
  };

  const handleMoveToFolder = async (docId: string, destFolderId: string | null) => {
    try {
      await updateDocument(docId, { folderId: destFolderId });
      toast.success('Đã di chuyển tài liệu thành công.');
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi di chuyển tài liệu.');
    }
  };

  const resetUploadForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setCategoryId(categories[0]?.id || '');
    setUploadSubject('');
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!getToken()) { toast.error('Bạn cần đăng nhập để tải tài liệu lên.'); return; }
    if (!file) { toast.error('Vui lòng chọn file tài liệu cần tải lên!'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề tài liệu.'); return; }
    if (!uploadSubject.trim()) { toast.error('Vui lòng nhập môn học.'); return; }

    const matchedSubjectObj = subjects.find(
      (s) => s.name.toLowerCase() === uploadSubject.trim().toLowerCase()
    );

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      // Mặc định luôn là riêng tư (Private)
      formData.append('isPublic', 'false');
      
      // Gửi tên môn học do người dùng tự điền
      formData.append('subject', uploadSubject.trim());
      
      // Nếu khớp với một môn học có sẵn, gửi thêm subjectId để liên kết
      if (matchedSubjectObj) {
        formData.append('subjectId', matchedSubjectObj.id);
      }
      
      if (categoryId) formData.append('categoryId', categoryId);
      if (currentFolderId) formData.append('folderId', currentFolderId);

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

  const handleUploadOpenChange = async (open: boolean) => {
    setIsUploadOpen(open);
    if (!open && !uploadLoading) resetUploadForm();
    if (open) {
      try {
        const settings = await getPublicSettings();
        if (settings && settings.maxUploadSize) {
          setMaxUploadSize(settings.maxUploadSize);
        }
      } catch (err) {
        console.error('Lỗi khi lấy maxUploadSize:', err);
      }
    }
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
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateFolderClick}
            variant="outline"
            className="rounded-xl gap-2 border-slate-200 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
          >
            <FolderPlus className="w-4 h-4" />
            Tạo Folder
          </Button>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10"
          >
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

      {/* VIRTUAL FOLDERS DISPLAY SECTION */}
      <div className="space-y-3">
        {currentFolderId ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setCurrentFolderId(null);
                setCurrentFolderName(null);
              }}
              variant="ghost"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const docId = e.dataTransfer.getData('text/plain');
                if (docId) handleMoveToFolder(docId, null);
              }}
              className="text-xs gap-1.5 pl-2 pr-3 py-1.5 h-auto rounded-xl text-stone-600 dark:text-stone-450 hover:text-indigo-600 dark:hover:text-white border border-dashed border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại Thư mục gốc (Thả tệp vào đây để bỏ khỏi folder)
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-800 dark:text-white">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>Thư mục: {currentFolderName}</span>
            </div>
          </div>
        ) : (
          folders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-stone-500 dark:text-stone-400 uppercase font-bold">Thư mục cá nhân (Có thể kéo thả tệp vào đây)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {folders.map((folder) => {
                  return (
                    <div
                      key={folder.id}
                      onClick={() => {
                        setCurrentFolderId(folder.id);
                        setCurrentFolderName(folder.name);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const docId = e.dataTransfer.getData('text/plain');
                        if (docId) handleMoveToFolder(docId, folder.id);
                      }}
                      className="group flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-xl hover:border-amber-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer shadow-sm hover:shadow transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="w-8 h-8 text-amber-500 flex-shrink-0 group-hover:scale-105 transition-transform" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{folder.name}</p>
                          <p className="text-[9px] font-mono text-stone-400 dark:text-stone-500">Thư mục học tập</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, folder.name);
                        }}
                        className="p-1 rounded text-stone-500 hover:text-rose-450 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa thư mục"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

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

      {/* Lọc danh sách tài liệu theo folder ảo đang chọn */}
      {(() => {
        const filteredDocuments = documents.filter(doc => {
          if (search.trim()) {
            return doc.title.toLowerCase().includes(search.toLowerCase()) || 
                   (doc.subject && doc.subject.toLowerCase().includes(search.toLowerCase()));
          }
          return true;
        });

        return (
          <>
            <p className="text-xs text-stone-500 font-semibold mb-2">
              {loading ? 'Đang tải danh sách tài liệu...' : (
                <>Tìm thấy <span className="text-[#eaeaea]">{filteredDocuments.length}</span> tài liệu trong thư mục này</>
              )}
            </p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-[#121214]/5 p-4 rounded-xl flex items-center justify-between animate-pulse shadow-sm">
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                    <div className="h-4 bg-stone-200 rounded w-20" />
                    <div className="h-4 bg-stone-200 rounded w-24" />
                    <div className="h-4 bg-stone-200 rounded w-28" />
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              recentDocs.length > 0 ? (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2 text-[#121214]">
                    <History className="w-5 h-5 text-[#121214]" />
                    <h3 className="font-bold text-base">Tài liệu mở gần đây</h3>
                  </div>
                  <div className="overflow-x-auto bg-white/80 backdrop-blur-md border border-[#121214]/10 rounded-xl shadow-sm">
                    <table className="w-full border-collapse text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#121214]/5 text-stone-500 uppercase tracking-widest text-[9px]">
                          <th className="p-4">Tên tài liệu</th>
                          <th className="p-4">Dung lượng</th>
                          <th className="p-4">Môn học</th>
                          <th className="p-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDocs.map((doc) => {
                          return (
                            <tr key={doc.id} className="border-b border-[#121214]/5 hover:bg-[#121214]/5 transition-colors">
                              <td className="p-4 font-bold text-[#121214] max-w-xs truncate">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-4 h-4 text-[#121214] flex-shrink-0" />
                                  <span>{doc.title}</span>
                                </div>
                              </td>
                              <td className="p-4 text-stone-500">{formatBytes(doc.fileSize)}</td>
                              <td className="p-4">
                                <span className="inline-block text-[9px] font-mono font-extrabold tracking-widest text-[#121214] bg-stone-100 border border-[#121214]/10 rounded px-2 py-0.5 uppercase">
                                  {doc.subjectRef?.code || doc.subject || 'Môn học'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-stone-500">
                                  <button type="button" onClick={() => handleDownload(doc)} className="hover:text-[#121214] transition-colors" title="Tải về">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <Link to={`/documents/${doc.id}`} className="hover:text-[#121214] transition-colors" title="Chi tiết">
                                    <Eye className="w-3.5 h-3.5" />
                                  </Link>
                                  <button type="button" onClick={() => handleDeleteDocument(doc.id, doc.title)} className="hover:text-red-500 transition-colors" title="Xóa">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-[#121214]/20 bg-white/50 text-center">
                  <FileText className="w-12 h-12 text-stone-400" />
                  <div>
                    <h3 className="font-bold text-[#121214] text-base">Chưa có tài liệu</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">Bạn chưa có tài liệu nào trên hệ thống. Hãy tải lên!</p>
                  </div>
                  <Button onClick={() => setIsUploadOpen(true)} className="bg-[#121214] text-white hover:bg-stone-800 text-xs font-bold uppercase tracking-wider rounded-xl px-6 py-2">
                    Tải lên tài liệu
                  </Button>
                </div>
              )
            ) : (
              <div className="overflow-x-auto bg-white/80 backdrop-blur-md border border-[#121214]/10 rounded-xl shadow-sm">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#121214]/5 text-stone-500 uppercase tracking-widest text-[9px]">
                      <th className="p-4">Tên tài liệu</th>
                      <th className="p-4">Dung lượng</th>
                      <th className="p-4">Môn học</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => {
                      return (
                        <tr
                          key={doc.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', doc.id);
                          }}
                          className="border-b border-[#121214]/5 hover:bg-[#121214]/5 transition-colors cursor-grab active:cursor-grabbing"
                        >
                          <td className="p-4 font-bold text-[#121214] max-w-xs truncate">
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-[#121214] flex-shrink-0" />
                              <span>{doc.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-stone-500">{formatBytes(doc.fileSize)}</td>
                          <td className="p-4">
                            <span className="inline-block text-[9px] font-mono font-extrabold tracking-widest text-[#121214] bg-stone-100 border border-[#121214]/10 rounded px-2 py-0.5 uppercase">
                              {doc.subjectRef?.code || doc.subject || 'Môn học'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-stone-500">
                              {/* Selector di chuyển thư mục */}
                              <select
                                value={doc.folderId || ''}
                                onChange={(e) => handleMoveToFolder(doc.id, e.target.value || null)}
                                aria-label="Di chuyển vào folder"
                                title="Di chuyển vào folder"
                                className="bg-white border border-[#121214]/10 rounded-lg px-2 py-1 text-[9px] text-[#121214] focus:outline-none focus:ring-1 focus:ring-[#121214]/20 font-bold"
                              >
                                <option value="">(Ngoài Root)</option>
                                {allFolders.map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                              <button type="button" onClick={() => handleDownload(doc)} className="hover:text-[#121214] transition-colors" title="Tải về">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <Link to={`/documents/${doc.id}`} className="hover:text-[#121214] transition-colors" title="Chi tiết">
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button type="button" onClick={() => setEditingDocument(doc)} className="hover:text-[#121214] transition-colors" title="Sửa">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleDeleteDocument(doc.id, doc.title || doc.fileName || 'Tài liệu')} className="hover:text-rose-600 transition-colors" title="Xóa">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );
      })()}

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
                accept=".pdf,.docx"
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

            <div className="space-y-1.5">
              <Label htmlFor="uploadSubject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Môn học *</Label>
              <Input
                id="uploadSubject"
                value={uploadSubject}
                onChange={(event) => setUploadSubject(event.target.value)}
                placeholder="Ví dụ: Cấu trúc dữ liệu, Software Testing..."
                required
                className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
              />
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

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className={`${glowCard} sm:max-w-[425px] rounded-3xl p-6 border-white/60 bg-white/90 backdrop-blur-xl`}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">Tạo thư mục mới</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Nhập tên thư mục để tổ chức tài liệu học tập của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="folderName" className="text-sm font-semibold text-slate-700">Tên thư mục *</Label>
              <Input
                id="folderName"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ví dụ: Tài liệu Toán học"
                required
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-white text-slate-900"
              />
            </div>
            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                Hủy
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15">
                Tạo mới
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className={`${glowCard} sm:max-w-[425px] rounded-3xl p-6 border-white/60 bg-white/90 backdrop-blur-xl`}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-rose-600">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa {deleteConfirm?.type === 'folder' ? 'thư mục' : 'tài liệu'} <strong>"{deleteConfirm?.name}"</strong> không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
              Hủy
            </Button>
            <Button type="button" onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/15">
              Xóa ngay
            </Button>
          </DialogFooter>
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
