import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Clock,
  FolderOpen,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  getCategories,
  getDocuments,
  getMe,
  getToken,
  type CategoryItem,
  type DocumentItem,
  type User,
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
  return (
    doc.category?.name ||
    doc.subjectRef?.name ||
    doc.subject ||
    'Chưa phân loại'
  );
}

// Glow shadow dùng chung cho các card — ánh sáng xanh dương (sky/cyan), mềm và nổi bật hơn shadow xám mặc định.
const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

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

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [docsResult, categoryResult] = await Promise.all([
        getDocuments({
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        getCategories().catch(() => []),
      ]);

      setDocuments(docsResult.documents || []);
      setCategories(categoryResult);

      if (getToken()) {
        const currentUser = await getMe().catch(() => null);

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem(
            'user',
            JSON.stringify(currentUser)
          );
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Không thể tải dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalSize = useMemo(
    () =>
      documents.reduce(
        (sum, doc) => sum + (doc.fileSize || 0),
        0
      ),
    [documents]
  );

  const defaultStorageLimit =
    5 * 1024 * 1024 * 1024;

  const storageLimit = Math.max(
    Number(user?.storageLimit || 0),
    defaultStorageLimit
  );

  const usedStorage =
    user?.usedStorage ?? totalSize;

  const storagePercent = Math.min(
    100,
    Math.round((usedStorage / storageLimit) * 100)
  );

  const stats = [
    {
      title: 'Tổng tài liệu',
      value: String(documents.length),
      change: loading ? 'Đang tải' : 'Từ backend',
      icon: FileText,
      color: 'text-sky-500',
      iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    },
    {
      title: 'Danh mục',
      value: String(categories.length),
      change: 'Tổng số danh mục',
      icon: FolderOpen,
      color: 'text-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      title: 'Dung lượng đã dùng',
      value: formatFileSize(usedStorage),
      change: `/ ${formatFileSize(storageLimit)}`,
      icon: TrendingUp,
      color: 'text-orange-500',
      iconBg: 'bg-orange-50 dark:bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>

          <p className="text-muted-foreground mt-1">
            Chào mừng trở lại! Đây là tổng quan tài liệu
            lấy từ backend.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={glowCard}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>

                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <stat.icon
                    className={`w-6 h-6 ${stat.color}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={glowCard}>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-sky-500" />
            </span>
            Dung lượng lưu trữ
          </CardTitle>

          <CardDescription>
            Đã sử dụng {formatFileSize(usedStorage)} /{' '}
            {formatFileSize(storageLimit)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Progress
            value={storagePercent}
            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:to-indigo-500"
          />

          <p className="text-sm text-muted-foreground mt-2">
            Còn lại{' '}
            {formatFileSize(
              Math.max(
                0,
                storageLimit - usedStorage
              )
            )}{' '}
            dung lượng trống
          </p>
        </CardContent>
      </Card>

      <Card className={glowCard}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">
              Tài liệu gần đây
            </CardTitle>

            <CardDescription>
              Các tài liệu mới nhất từ backend
            </CardDescription>
          </div>

          <Link to="/documents">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
            >
              Xem tất cả
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800
                  hover:bg-sky-50/50 dark:hover:bg-sky-500/5
                  hover:shadow-[0_0_25px_-10px_rgba(56,189,248,0.6)]
                  transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-sky-50 dark:bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-sky-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {doc.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <FolderOpen className="w-3 h-3" />
                      <span>
                        {getDocumentCategory(doc)}
                      </span>
                      <span>•</span>
                      <span>
                        {formatFileSize(
                          doc.fileSize
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatRelativeDate(
                        doc.createdAt
                      )}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-card/50">
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? 'Đang tải tài liệu...'
                    : 'Chưa có tài liệu nào.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}