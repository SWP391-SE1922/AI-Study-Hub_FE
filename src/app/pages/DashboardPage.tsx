import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  TrendingUp,
  Clock,
  FolderOpen,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { DocumentMetadataDialog } from '../components/documents/DocumentMetadataDialog';
import {
  getCategories,
  getDocuments,
  getMe,
  getToken,
  type CategoryItem,
  type DocumentItem,
  type DocumentMetadata,
  type User,
  uploadDocument,
} from '../services/api';

function formatFileSize(size?: number) {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatRelativeDate(value?: string) {
  if (!value) return 'Không rõ';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function getDocumentCategory(doc: DocumentItem) {
  return doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại';
}

export function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [docsResult, categoryResult] = await Promise.all([
        getDocuments({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        getCategories().catch(() => []),
      ]);
      setDocuments(docsResult.documents || []);
      setCategories(categoryResult);

      if (getToken()) {
        const currentUser = await getMe().catch(() => null);
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalSize = useMemo(() => documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0), [documents]);
  const defaultStorageLimit = 5 * 1024 * 1024 * 1024;
  const storageLimit = Math.max(Number(user?.storageLimit || 0), defaultStorageLimit);
  const usedStorage = user?.usedStorage ?? totalSize;
  const storagePercent = Math.min(100, Math.round((usedStorage / storageLimit) * 100));
  const uploadedThisMonth = useMemo(() => {
    const now = new Date();
    return documents.filter((doc) => {
      const date = new Date(doc.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [documents]);

  const stats = [
    { title: 'Tổng tài liệu', value: String(documents.length), change: loading ? 'Đang tải' : 'Từ backend', icon: FileText, color: 'text-blue-600' },
    { title: 'Đã upload tháng này', value: String(uploadedThisMonth), change: 'Theo ngày tạo', icon: Upload, color: 'text-green-600' },
    { title: 'Dung lượng đã dùng', value: formatFileSize(usedStorage), change: `/ ${formatFileSize(storageLimit)}`, icon: TrendingUp, color: 'text-orange-600' },
  ];

  const handleUploadClick = () => {
    if (!getToken()) {
      toast.error('Bạn cần đăng nhập để upload tài liệu.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPendingFile(file);
  };

  const handleUploadSubmit = async (metadata: DocumentMetadata) => {
    if (!pendingFile) return;

    setUploading(true);
    try {
      await uploadDocument(pendingFile, metadata);
      toast.success('Upload tài liệu thành công!');
      setPendingFile(null);
      await loadDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể upload tài liệu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Chào mừng trở lại! Đây là tổng quan tài liệu lấy từ backend.</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <Button onClick={handleUploadClick} disabled={uploading} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
            <Upload className="w-4 h-4 mr-2" />
            Upload tài liệu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Dung lượng lưu trữ
          </CardTitle>
          <CardDescription>Đã sử dụng {formatFileSize(usedStorage)} / {formatFileSize(storageLimit)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={storagePercent} className="h-2 bg-slate-100 dark:bg-slate-800" />
          <p className="text-sm text-muted-foreground mt-2">Còn lại {formatFileSize(Math.max(0, storageLimit - usedStorage))} dung lượng trống</p>
        </CardContent>
      </Card>

      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">Tài liệu gần đây</CardTitle>
            <CardDescription>Các tài liệu mới nhất từ backend</CardDescription>
          </div>
          <Link to="/documents">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">Xem tất cả</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.length > 0 ? documents.slice(0, 5).map((doc) => (
              <Link key={doc.id} to={`/documents/${doc.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-slate-100/50 dark:border-slate-800">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <FolderOpen className="w-3 h-3" />
                    <span>{getDocumentCategory(doc)}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeDate(doc.createdAt)}</span>
                </div>
              </Link>
            )) : (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-card/50">
                <p className="text-sm text-muted-foreground">{loading ? 'Đang tải tài liệu...' : 'Chưa có tài liệu nào. Bấm Upload tài liệu để thêm mới.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DocumentMetadataDialog
        open={Boolean(pendingFile)}
        title="Thông tin upload tài liệu"
        submitLabel="Upload"
        fileName={pendingFile?.name}
        categories={categories}
        submitting={uploading}
        onClose={() => setPendingFile(null)}
        onSubmit={handleUploadSubmit}
      />
    </div>
  );
}
