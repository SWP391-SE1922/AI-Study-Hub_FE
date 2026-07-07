import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Clock,
  FolderOpen,
  HardDrive,
  BarChart3,
  AreaChart,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import {
  getCategories,
  getDocuments,
  getMe,
  getSubjects,
  getToken,
  type CategoryItem,
  type DocumentItem,
  type SubjectItem,
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
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
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
      const [docsResult, categoryResult, subjectResult] = await Promise.all([
        getDocuments({
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        getCategories().catch(() => []),
        getSubjects().catch(() => []),
      ]);

      setDocuments(docsResult.documents || []);
      setCategories(categoryResult);
      setSubjects(subjectResult);

      if (getToken()) {
        const currentUser = await getMe().catch(() => null);
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể tải dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // API Storage Logic
  const defaultStorageLimit = 5 * 1024 * 1024 * 1024; // 5GB
  const storageLimit = Math.max(Number(user?.storageLimit || 0), defaultStorageLimit);
  const usedStorage = user?.usedStorage !== undefined ? user.usedStorage : documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  const remainingStorage = Math.max(0, storageLimit - usedStorage);
  const storagePercent = Math.min(100, Math.round((usedStorage / storageLimit) * 100));

  // 1. Dữ liệu xử lý cho biểu đồ xu hướng 7 ngày (Line Chart)
  const lineChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    }).reverse();

    const counts: Record<string, number> = {};
    last7Days.forEach((date) => { counts[date] = 0; });

    documents.forEach((doc) => {
      if (doc.createdAt) {
        const docDate = new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        if (counts[docDate] !== undefined) {
          counts[docDate] += 1;
        }
      }
    });

    return last7Days.map((date) => ({
      date,
      'Tài liệu': counts[date],
    }));
  }, [documents]);

  // 2. Dữ liệu xử lý dung lượng theo từng file riêng lẻ (Bar Chart)
  const barChartData = useMemo(() => {
    return documents.slice(0, 5).map((doc) => ({
      name: doc.title.length > 15 ? doc.title.substring(0, 12) + '...' : doc.title,
      fullName: doc.title,
      rawSize: doc.fileSize || 0,
      'Dung lượng (MB)': Number(((doc.fileSize || 0) / (1024 * 1024)).toFixed(2)),
    }));
  }, [documents]);

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
      title: 'Tổng môn học',
      value: String(subjects.length),
      change: 'Tổng số môn học',
      icon: BookOpen,
      color: 'text-violet-500',
      iconBg: 'bg-violet-50 dark:bg-violet-500/10',
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Chào mừng trở lại! Đây là tổng quan tài liệu lấy từ backend.
        </p>
      </div>

      {/* Grid 4 thẻ Stats chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={glowCard}>
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
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bố cục chính: Biểu đồ xu hướng bên trái & Thanh dung lượng lưu trữ bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ đường thẳng xu hướng tài liệu: Chiếm 2 cột */}
        <Card className={`${glowCard} lg:col-span-2`}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base font-semibold">
              <AreaChart className="w-5 h-5 text-sky-500" /> Đường xu hướng tài liệu 7 ngày
            </CardTitle>
            <CardDescription>Biểu đồ thể hiện số lượng tài liệu mới được tải lên mỗi ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="Tài liệu" stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 6 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Thanh tiến trình Dung lượng: Chiếm 1 cột */}
        <Card className={`${glowCard} flex flex-col justify-between`}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base font-semibold">
              <HardDrive className="w-5 h-5 text-sky-500" /> Dung lượng lưu trữ
            </CardTitle>
            <CardDescription>
              Đã sử dụng thực tế từ API hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <div className="flex justify-between items-end text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Đã dùng: {formatFileSize(usedStorage)}</span>
              <span className="text-xs text-muted-foreground">{storagePercent}%</span>
            </div>
            <Progress
              value={storagePercent}
              className="h-3 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:to-indigo-500"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Còn trống: {formatFileSize(remainingStorage)}</span>
              <span>Tổng: {formatFileSize(storageLimit)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bố cục bên dưới: Danh sách tài liệu bên trái & Biểu đồ cột phân phối bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tài liệu gần đây: Chiếm 2 cột */}
        <Card className={`${glowCard} lg:col-span-2`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white text-lg font-bold">
                Tài liệu mới nhất (Top 5)
              </CardTitle>
              <CardDescription>Các tài liệu mới cập nhật từ backend</CardDescription>
            </div>
            <Link to="/documents">
              <Button variant="ghost" size="sm" className="hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length > 0 ? (
              documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all duration-300"
                >
                  <div className="w-9 h-9 bg-sky-50 dark:bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
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
              ))
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm text-muted-foreground">{loading ? 'Đang tải dữ liệu...' : 'Chưa có tài liệu nào.'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ cột (Bar Chart) hiển thị dung lượng file: Chiếm 1 cột */}
        <Card className={glowCard}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="w-5 h-5 text-sky-500" /> Dung lượng theo file
            </CardTitle>
            <CardDescription>So sánh kích thước các file gần nhất (MB)</CardDescription>
          </CardHeader>
          <CardContent className="h-[210px] pl-2">
            {documents.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="M" />
                  <Tooltip
                    formatter={(value: number) => [`${value} MB`, 'Dung lượng']}
                    labelFormatter={(_, items) => items[0]?.payload?.fullName || ''}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="Dung lượng (MB)" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                    {barChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0284c7' : '#38bdf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu biểu đồ</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}