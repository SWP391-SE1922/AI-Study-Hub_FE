import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  HardDrive,
  History,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  MoreVertical,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import {
  getDocuments,
  getDocumentVersions,
  getMe,
  getUsers,
  lockUser,
  adminUpdateUserPlan,
  deleteUser,
  restoreUser,
  deleteDocument,
  restoreDocument,
  type DocumentItem,
  type DocumentVersionItem,
  type User,
} from '../../services/api';

function formatDate(value?: string) {
  if (!value) return 'Không rõ';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return date.toLocaleDateString('vi-VN');
}

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

function getInitials(name?: string, email?: string) {
  const source = name || email || 'U';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function getDateKey(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

// Clean flat card style for monochromatic minimal theme
const glowCard = 'bg-white rounded-3xl p-2 border border-[#121214]/5 shadow-sm transition-all duration-300 hover:shadow-md';

type LineChartPoint = {
  key: string;
  label: string;
  value: number;
  note?: string;
};

function LineTrendChart({
  chartId,
  data,
  valueLabel,
  loading,
  emptyText,
}: {
  chartId: string;
  data: LineChartPoint[];
  valueLabel: string;
  loading?: boolean;
  emptyText: string;
}) {
  const chartWidth = 640;
  const chartHeight = 230;
  const paddingX = 34;
  const paddingY = 26;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const maxValue = Math.max(...data.map((item) => Number(item.value || 0)), 1);
  const points = data.map((item, index) => {
    const x = paddingX + (data.length <= 1 ? innerWidth / 2 : (index * innerWidth) / (data.length - 1));
    const y = paddingY + innerHeight - (Number(item.value || 0) / maxValue) * innerHeight;
    return { ...item, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = points.length
    ? `${paddingX},${chartHeight - paddingY} ${linePoints} ${chartWidth - paddingX},${chartHeight - paddingY}`
    : '';

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center text-muted-foreground">
        {loading ? 'Đang tải biểu đồ...' : emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 w-full overflow-visible" role="img">
          <defs>
            <linearGradient id={`${chartId}-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id={`${chartId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line * innerHeight) / 3;
            const labelValue = Math.round(maxValue - (line * maxValue) / 3);
            return (
              <g key={line}>
                <line
                  x1={paddingX}
                  x2={chartWidth - paddingX}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeDasharray="5 8"
                />
                <text x={4} y={y + 4} className="fill-muted-foreground text-[11px]">
                  {labelValue}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill={`url(#${chartId}-area)`} />
          <polyline
            points={linePoints}
            fill="none"
            stroke={`url(#${chartId}-line)`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="7" className="fill-background" stroke={`url(#${chartId}-line)`} strokeWidth="4" />
              <circle cx={point.x} cy={point.y} r="3" fill="#0ea5e9" />
              <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
                {point.value}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {points.map((point) => (
          <div key={point.key} className="rounded-xl border border-border bg-muted/20 p-2 text-center">
            <p className="truncate text-xs font-medium">{point.label}</p>
            <p className="mt-1 text-sm font-bold text-sky-500">
              {point.value} {valueLabel}
            </p>
            {point.note && <p className="mt-1 truncate text-[11px] text-muted-foreground">{point.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [versionDocument, setVersionDocument] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState('');
  const [userFromDate, setUserFromDate] = useState('');
  const [userToDate, setUserToDate] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [docPage, setDocPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [topPage, setTopPage] = useState(1);
  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [docMaxSize, setDocMaxSize] = useState(100);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const USER_PAGE_SIZE = 10;
  const DOC_PAGE_SIZE = 10;
  const RECENT_DOCS_PAGE_SIZE = 5;
  const TOP_DOCS_PAGE_SIZE = 5;
  const location = useLocation();
  const navigate = useNavigate();

const pageMode = location.pathname.includes('/admin/users')
  ? 'users'
  : location.pathname.includes('/admin/documents')
    ? 'documents'
      : 'dashboard';

  const loadAdminData = async () => {
    setLoading(true);

    // Không dùng Promise.all cứng để tránh 1 API lỗi làm hỏng toàn bộ trang admin.
    const nextUsers: User[] = [];
    let nextDocuments: DocumentItem[] = [];
    let nextCurrentUser: User | null = null;

    try {
      const userResult = await getUsers({ page: 1, limit: 50 });
      nextUsers.push(...(userResult.users || []));
    } catch (error) {
      toast.error(error instanceof Error ? `Không tải được người dùng: ${error.message}` : 'Không tải được người dùng');
    }

    try {
      const docResult = await getDocuments({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
      nextDocuments = docResult.documents || [];
    } catch (error) {
      toast.error(error instanceof Error ? `Không tải được tài liệu: ${error.message}` : 'Không tải được tài liệu');
    }

    try {
      nextCurrentUser = await getMe();
    } catch {
      nextCurrentUser = null;
    }

    setUsers(nextUsers);
    setDocuments(nextDocuments);
    setCurrentUser(nextCurrentUser);
    if (pageMode === "documents") {
    setDocSearch("");
    setDocTypeFilter("");
    setFromDate("");
    setToDate("");
    setDocMaxSize(100);
  }
    setUserPage(1);
    setDocPage(1);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const storageUsed = useMemo(() => users.reduce((sum, user) => sum + Number(user.usedStorage || 0), 0), [users]);
  const totalDownloads = useMemo(() => documents.reduce((sum, doc) => sum + Number(doc.downloadCount || 0), 0), [documents]);
  const verifiedUsers = useMemo(() => users.filter((user) => user.isVerified).length, [users]);


  const stats = [
    { title: 'Tổng người dùng', value: String(users.length), change: `${verifiedUsers} đã xác thực`, icon: Users, color: 'text-sky-500', iconBg: 'bg-sky-50 dark:bg-sky-500/10' },
    { title: 'Tổng tài liệu', value: String(documents.length) , icon: FileText, color: 'text-indigo-500', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { title: 'Tổng lượt tải', value: String(totalDownloads), icon: TrendingUp, color: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { title: 'Dung lượng đã dùng', value: formatFileSize(storageUsed), change: 'Toàn hệ thống', icon: HardDrive, color: 'text-fuchsia-500', iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
  ];

  const categoryStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; storage: number; downloads: number }>();

    documents.forEach((doc) => {
      const name = doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại';
      const current = map.get(name) || { name, count: 0, storage: 0, downloads: 0 };
      current.count += 1;
      current.storage += Number(doc.fileSize || 0);
      current.downloads += Number(doc.downloadCount || 0);
      map.set(name, current);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [documents]);
  const uploadTimeline = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: 0,
      };
    });

    documents.forEach((doc) => {
      const key = getDateKey(doc.createdAt);
      const day = days.find((item) => item.key === key);
      if (day) day.count += 1;
    });

    return days;
  }, [documents]);


  const categoryLineData = useMemo(
    () =>
      categoryStats.map((item) => ({
        key: item.name,
        label: item.name,
        value: item.count,
        note: `${formatFileSize(item.storage)} · ${item.downloads} lượt tải`,
      })),
    [categoryStats],
  );

  const uploadLineData = useMemo(
    () =>
      uploadTimeline.map((day) => ({
        key: day.key,
        label: day.label,
        value: day.count,
        note: 'tài liệu mới',
      })),
    [uploadTimeline],
  );

  const sortedRecentDocuments = useMemo(
    () =>
      [...documents]
        .sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)),
    [documents],
  );

  const totalRecentPages = Math.max(1, Math.ceil(sortedRecentDocuments.length / RECENT_DOCS_PAGE_SIZE));
  const paginatedRecentDocuments = useMemo(
    () =>
      sortedRecentDocuments.slice((recentPage - 1) * RECENT_DOCS_PAGE_SIZE, recentPage * RECENT_DOCS_PAGE_SIZE),
    [sortedRecentDocuments, recentPage],
  );

  const sortedTopDocuments = useMemo(
    () =>
      [...documents].sort(
        (a, b) =>
          (Number(b.downloadCount || 0) - Number(a.downloadCount || 0)) ||
          ((new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)),
      ),
    [documents],
  );

  const totalTopPages = Math.max(1, Math.ceil(sortedTopDocuments.length / TOP_DOCS_PAGE_SIZE));
  const paginatedTopDocuments = useMemo(
    () =>
      sortedTopDocuments.slice((topPage - 1) * TOP_DOCS_PAGE_SIZE, topPage * TOP_DOCS_PAGE_SIZE),
    [sortedTopDocuments, topPage],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = (user.fullName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const search = userSearch.trim().toLowerCase();
      const matchSearch = !search || name.includes(search) || email.includes(search);
      const matchRole = !userRoleFilter || (user.role || 'USER') === userRoleFilter;
      const matchVerified =
        !userVerifiedFilter ||
        (userVerifiedFilter === 'verified' ? Boolean(user.isVerified) : !user.isVerified);
      const dateKey = getDateKey(user.createdAt);
      const matchFrom = !userFromDate || (dateKey && dateKey >= userFromDate);
      const matchTo = !userToDate || (dateKey && dateKey <= userToDate);

      return matchSearch && matchRole && matchVerified && matchFrom && matchTo;
    });
  }, [users, userSearch, userRoleFilter, userVerifiedFilter, userFromDate, userToDate]);
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USER_PAGE_SIZE));
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((userPage - 1) * USER_PAGE_SIZE, userPage * USER_PAGE_SIZE),
    [filteredUsers, userPage],
  );
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const name = normalizeSearchText(doc.title || '');
      const classification = normalizeSearchText(doc.category?.name || doc.subjectRef?.name || doc.subject || '');
      const normalizedSearch = normalizeSearchText(docSearch);
      const size = Number(doc.fileSize || 0) / (1024 * 1024);
      const matchSearch = !docSearch || name.includes(normalizedSearch);
      const matchType = !docTypeFilter || classification === normalizeSearchText(docTypeFilter);
      const matchSize = size <= docMaxSize;
      const created = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;

      const matchFrom = !fromDate || created >= new Date(fromDate).getTime();
      const matchTo = !toDate || created <= new Date(toDate).getTime();

      return (
        matchSearch &&
        matchType &&
        matchSize &&
        matchFrom &&
        matchTo
      );
    });
  }, [documents, docSearch, docTypeFilter, docMaxSize, fromDate, toDate]);

  const totalDocPages = Math.max(1, Math.ceil(filteredDocuments.length / DOC_PAGE_SIZE));
  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice((docPage - 1) * DOC_PAGE_SIZE, docPage * DOC_PAGE_SIZE),
    [filteredDocuments, docPage],
  );

  const docTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach((doc) => {
      const classification = doc.category?.name || doc.subjectRef?.name || doc.subject;
      if (classification) types.add(classification);
      else types.add('Chưa phân loại');
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [documents]);

  const handleLockUser = async (user: User, duration: '3d' | '7d' | 'permanent') => {
    if (!user.id) return;
    if (user.id === currentUser?.id) {
      toast.error('Không thể khóa chính tài khoản admin đang đăng nhập.');
      return;
    }

    setActionLoading(user.id);
    try {
      await lockUser(user.id, duration);
      toast.success('Đã khóa tài khoản');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể khóa tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    if (user.id === currentUser?.id) {
      toast.error('Không thể xóa chính tài khoản đang đăng nhập.');
      return;
    }
    if (!confirm(`Xóa mềm tài khoản ${user.email || user.fullName}? Có thể khôi phục sau.`)) return;

    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      toast.success('Đã xóa mềm người dùng');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa người dùng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreUser = async (user: User) => {
    if (!user.id) return;
    setActionLoading(user.id);
    try {
      await restoreUser(user.id);
      toast.success('Đã khôi phục người dùng');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể khôi phục người dùng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (!confirm(`Xóa mềm tài liệu "${doc.title}"? Có thể khôi phục sau.`)) return;
    setActionLoading(doc.id);
    try {
      await deleteDocument(doc.id);
      toast.success('Đã xóa mềm tài liệu');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa tài liệu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreDocument = async (doc: DocumentItem) => {
    setActionLoading(doc.id);
    try {
      await restoreDocument(doc.id);
      toast.success('Đã khôi phục tài liệu');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể khôi phục tài liệu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDocumentVersions = async (documentItem: DocumentItem) => {
    setVersionDocument(documentItem);
    setVersions(documentItem.versions || []);
    setVersionLoading(true);

    try {
      const versionList = await getDocumentVersions(documentItem.id);
      setVersions(versionList.length ? versionList : (documentItem.versions || []));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải lịch sử version');
      setVersions(documentItem.versions || []);
    } finally {
      setVersionLoading(false);
    }
  };

  const renderPageTitle = () => {
    if (pageMode === 'users') {
      return {
        icon: Users,
        title: 'Quản lý người dùng',
        description: 'Quản lý tài khoản, vai trò, trạng thái xác thực và dung lượng đã dùng.',
      };
    }

    if (pageMode === 'documents') {
      return {
        icon: FileText,
        title: 'Quản lý tài liệu',
        description: 'Xem danh sách tài liệu.',
      };
    }



    return {
      icon: Shield,
      title: 'Dashboard Admin',
      description: 'Tổng quan hệ thống, biểu đồ tài liệu, người dùng và các chỉ số quan trọng.',
    };
  };

  const pageTitle = renderPageTitle();
  const PageIcon = pageTitle.icon;

  return (
    <div className="space-y-6 text-[#121214] selection:bg-[#121214] selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#121214] rounded-xl flex items-center justify-center shadow-sm">
            <PageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{pageTitle.title}</h1>
            <p className="text-muted-foreground mt-1">{pageTitle.description}</p>
          </div>
        </div>

        <Button onClick={loadAdminData} disabled={loading} variant="outline" className="gap-2 hover:border-sky-400/50 hover:text-sky-500">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      {pageMode === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className={glowCard}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Cột trái: 2 chart xếp dọc, chiếm 2/3 */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              <Card className={glowCard}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-sky-500" />
                    </span>
                    <CardTitle>Đường cao thấp tài liệu theo danh mục</CardTitle>
                  </div>
                  <CardDescription>
                    Hiển thị dạng đường thẳng để thấy danh mục nào đang cao hoặc thấp hơn các danh mục còn lại.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineTrendChart
                    chartId="category-documents"
                    data={categoryLineData}
                    valueLabel="tài liệu"
                    loading={loading}
                    emptyText="Chưa có dữ liệu tài liệu để vẽ biểu đồ."
                  />
                </CardContent>
              </Card>

              <Card className={glowCard}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-sky-500" />
                    </span>
                    <CardTitle>Đường xu hướng tài liệu 7 ngày</CardTitle>
                  </div>
                  <CardDescription>Biểu đồ đường thẳng thể hiện ngày nào tải lên cao, ngày nào thấp.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineTrendChart
                    chartId="upload-timeline"
                    data={uploadLineData}
                    valueLabel="tài liệu"
                    loading={loading}
                    emptyText="Chưa có dữ liệu tải lên trong 7 ngày gần đây."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Cột phải: 3 card xếp dọc, chiếm 1/3 */}
            <div className="flex flex-col gap-6">
              <Card className={glowCard}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-sky-500" />
                    </span>
                    <CardTitle>Tài liệu mới nhất</CardTitle>
                  </div>
                  <CardDescription>5 tài liệu vừa được tải lên hệ thống.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paginatedRecentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#121214]/5 bg-[#f8f9fa] p-3 hover:shadow-md transition-shadow">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại'} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{formatFileSize(doc.fileSize)}</Badge>
                    </div>
                  ))}
                  {!paginatedRecentDocuments.length && (
                    <p className="text-center text-muted-foreground py-8">{loading ? 'Đang tải...' : 'Chưa có tài liệu.'}</p>
                  )}
                </CardContent>
                {sortedRecentDocuments.length > 0 && (
                  <div className="flex items-center justify-center mt-4 px-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={recentPage === 1}
                        onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalRecentPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === recentPage ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 w-8 p-0 text-xs"
                          onClick={() => setRecentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={recentPage === totalRecentPages}
                        onClick={() => setRecentPage((p) => Math.min(totalRecentPages, p + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className={glowCard}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-sky-500" />
                    </span>
                    <CardTitle>Tài liệu tải nhiều</CardTitle>
                  </div>
                  <CardDescription>Top tài liệu có lượt tải cao nhất.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paginatedTopDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#121214]/5 bg-[#f8f9fa] p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center text-sm font-bold">
                          {(topPage - 1) * TOP_DOCS_PAGE_SIZE + index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                      <Badge className="shrink-0">{doc.downloadCount || 0} lượt tải</Badge>
                    </div>
                  ))}
                  {!paginatedTopDocuments.length && (
                    <p className="text-center text-muted-foreground py-8">{loading ? 'Đang tải...' : 'Chưa có tài liệu.'}</p>
                  )}
                </CardContent>
                {sortedTopDocuments.length > 0 && (
                  <div className="flex items-center justify-center mt-4 px-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={topPage === 1}
                        onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalTopPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === topPage ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 w-8 p-0 text-xs"
                          onClick={() => setTopPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={topPage === totalTopPages}
                        onClick={() => setTopPage((p) => Math.min(totalTopPages, p + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
      {pageMode === 'users' && (
        <div className="space-y-6">
        <Card className={glowCard}>
          <CardContent className="p-4 md:p-6">
            {/* Filter bar */}
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="space-y-2 xl:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
            aria-label="Tìm kiếm theo tên hoặc email"
            className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vai trò</label>
          <select
            value={userRoleFilter}
            onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
            aria-label="Lọc theo vai trò"
            className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="GUEST">GUEST</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trạng thái xác thực</label>
          <select
            value={userVerifiedFilter}
            onChange={(e) => { setUserVerifiedFilter(e.target.value); setUserPage(1); }}
            aria-label="Lọc theo trạng thái xác thực"
            className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="verified">Đã xác thực</option>
            <option value="unverified">Chưa xác thực</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Từ ngày</label>
          <input
            type="date"
            value={userFromDate}
            onChange={(e) => { setUserFromDate(e.target.value); setUserPage(1); }}
            aria-label="Lọc từ ngày tạo"
            className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Đến ngày</label>
          <input
            type="date"
            value={userToDate}
            onChange={(e) => { setUserToDate(e.target.value); setUserPage(1); }}
            aria-label="Lọc đến ngày tạo"
            className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>
      {(userSearch || userRoleFilter || userVerifiedFilter || userFromDate || userToDate) && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Tìm thấy {filteredUsers.length} người dùng phù hợp.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-sky-600 hover:text-sky-600"
            onClick={() => {
              setUserSearch('');
              setUserRoleFilter('');
              setUserVerifiedFilter('');
              setUserFromDate('');
              setUserToDate('');
              setUserPage(1);
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
     </CardContent>
     </Card>
              <Card className={glowCard}>
      <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="py-4 px-6">Người dùng</TableHead>
                      <TableHead className="py-4 px-4">Email</TableHead>
                      <TableHead className="py-4 px-4">Vai trò</TableHead>
                      <TableHead className="py-4 px-4">Gói cước</TableHead>
                      <TableHead className="py-4 px-4">Xác thực</TableHead>
                      <TableHead className="py-4 px-4">Dung lượng</TableHead>
                      <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                      <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className={`hover:bg-muted/10 border-b border-border last:border-0 transition-colors ${user.deletedAt ? 'opacity-60' : ''}`}>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 ring-2 ring-[#121214]/10">
                              <AvatarFallback className="bg-[#121214] text-white text-xs">
                                {getInitials(user.fullName, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium whitespace-nowrap">{user.fullName || 'Chưa có tên'}</span>
                              {user.deletedAt && <Badge variant="destructive" className="w-fit text-[10px]">Đã xóa</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="py-4 px-4 space-y-2">
                          <Badge className="bg-[#121214] text-white hover:bg-stone-800 border-none">{user.role || 'USER'}</Badge>
                          {(user.isLocked || user.lockedUntil) && !user.deletedAt && (
                            <Badge variant="destructive" className="uppercase">
                              {user.lockedUntil ? `Đã khóa đến ${formatDate(user.lockedUntil)}` : 'Khóa vĩnh viễn'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <select
                            value={user.plan || 'BASIC'}
                            onChange={async (e) => {
                              const nextPlan = e.target.value;
                              setActionLoading(user.id || null);
                              try {
                                await adminUpdateUserPlan(user.id, nextPlan);
                                toast.success(`Đã cập nhật gói ${nextPlan} cho người dùng thành công!`);
                                await loadAdminData();
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Lỗi khi cập nhật gói.');
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            disabled={actionLoading === user.id || Boolean(user.deletedAt)}
                            className="bg-background border border-input rounded-xl px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-400 dark:text-white text-slate-800"
                          >
                            <option value="BASIC">BASIC</option>
                            <option value="PREMIUM">PREMIUM</option>
                            <option value="VIP">VIP</option>
                            <option value="UNLIMITED">UNLIMITED</option>
                          </select>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={user.isVerified ? 'bg-[#121214] text-white hover:bg-stone-800 border-none' : 'bg-white text-[#121214] border border-[#121214]/10 hover:bg-stone-50'}>
                            {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{formatFileSize(user.usedStorage)}</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          {user.deletedAt ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-emerald-600"
                              disabled={actionLoading === user.id}
                              onClick={() => handleRestoreUser(user)}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Khôi phục
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  disabled={actionLoading === user.id || user.id === currentUser?.id}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                  Thao tác
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem disabled={user.id === currentUser?.id} onSelect={() => handleLockUser(user, '3d')}>
                                  Khóa 3 ngày
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={user.id === currentUser?.id} onSelect={() => handleLockUser(user, '7d')}>
                                  Khóa 7 ngày
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={user.id === currentUser?.id} onSelect={() => handleLockUser(user, 'permanent')}>
                                  Khóa vĩnh viễn
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={user.id === currentUser?.id}
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() => handleDeleteUser(user)}
                                >
                                  Xóa mềm
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {loading ? 'Đang tải người dùng...' : 'Chưa có người dùng.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    {(userPage - 1) * USER_PAGE_SIZE + 1}–{Math.min(userPage * USER_PAGE_SIZE, filteredUsers.length)}/{filteredUsers.length} người dùng
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={userPage === 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === userPage ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        onClick={() => setUserPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={userPage === totalUserPages}
                      onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
         </div>
      )}
      {pageMode === 'documents' && (
        <div className="space-y-6">
        <Card className={glowCard}>
          <CardContent className="p-4 md:p-6">
            {/* Filter bar */}
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tên tài liệu</label>
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={docSearch}
                    onChange={(e) => { setDocSearch(e.target.value); setDocPage(1); }}
                    aria-label="Lọc theo tên tài liệu"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phân loại</label>
                  <select
                    value={docTypeFilter}
                    onChange={(e) => { setDocTypeFilter(e.target.value); setDocPage(1); }}
                    aria-label="Lọc theo phân loại"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả phân loại</option>
                    {docTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Từ ngày</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setDocPage(1);
                    }}
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Đến ngày</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setDocPage(1);
                    }}
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Dung lượng tối đa</span>
                  <span className="text-sky-500">≤ {docMaxSize} MB</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">0 MB</span>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={docMaxSize}
                    onChange={(e) => { setDocMaxSize(Number(e.target.value)); setDocPage(1); }}
                    aria-label="Dung lượng tối đa (MB)"
                    className="w-full accent-sky-500"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">100 MB</span>
                </div>
              </div>

        {(docSearch || docTypeFilter || fromDate || toDate || docMaxSize < 100) && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    Tìm thấy {filteredDocuments.length} tài liệu phù hợp.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-sky-600 hover:text-sky-600"
                    onClick={() => {
                      setDocSearch('');
                      setDocTypeFilter('');
                      setFromDate('');
                      setToDate('');
                      setDocMaxSize(100);
                      setDocPage(1);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
           </CardContent>
         </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow>
                    <TableHead className="py-4 px-6">Tên tài liệu</TableHead>
                    <TableHead className="py-4 px-4">Phân loại</TableHead>
                    <TableHead className="py-4 px-4">Người tải</TableHead>
                    <TableHead className="py-4 px-4">Dung lượng</TableHead>
                    <TableHead className="py-4 px-4">Lượt tải</TableHead>
                    <TableHead className="py-4 px-4">Trạng thái</TableHead>
                    <TableHead className="py-4 px-4">Ngày tải</TableHead>
                    <TableHead className="py-4 px-6 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id} className={`hover:bg-muted/10 border-b border-border last:border-0 transition-colors ${doc.deletedAt ? 'opacity-60' : ''}`}>
                      <TableCell className="py-4 px-6 font-medium max-w-[320px] truncate">{doc.title}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại'}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{doc.user?.fullName || doc.uploadedBy || 'Không rõ'}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell className="py-4 px-4 text-center text-muted-foreground">{doc.downloadCount || 0}</TableCell>
                      <TableCell className="py-4 px-4">
                        {doc.deletedAt ? (
                          <Badge variant="destructive">Đã xóa</Badge>
                        ) : (
                          <Badge variant="secondary">Đang dùng</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                      <TableCell className="py-4 px-6 text-center max-w-[180px] whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-[#121214] hover:bg-[#f8f9fa]"
                            onClick={() => navigate(`/admin/documents/${doc.id}`)}
                            aria-label="Xem"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-[#121214] hover:bg-[#f8f9fa]"
                            disabled={versionLoading && versionDocument?.id === doc.id}
                            onClick={() => handleViewDocumentVersions(doc)}
                            aria-label="Version"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          {doc.deletedAt ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full p-0 text-emerald-600 hover:text-emerald-700"
                              disabled={actionLoading === doc.id}
                              onClick={() => handleRestoreDocument(doc)}
                              aria-label="Khôi phục"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive/80"
                              disabled={actionLoading === doc.id}
                              onClick={() => handleDeleteDocument(doc)}
                              aria-label="Xóa mềm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredDocuments.length && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {loading ? 'Đang tải tài liệu...' : 'Chưa có tài liệu.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredDocuments.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-sm text-muted-foreground">
                  {(docPage - 1) * DOC_PAGE_SIZE + 1}–{Math.min(docPage * DOC_PAGE_SIZE, filteredDocuments.length)}/{filteredDocuments.length} tài liệu
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    disabled={docPage === 1} onClick={() => setDocPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalDocPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={page === docPage ? 'default' : 'outline'}
                      size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setDocPage(page)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    disabled={docPage === totalDocPages} onClick={() => setDocPage((p) => Math.min(totalDocPages, p + 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}



      <Dialog open={Boolean(versionDocument)} onOpenChange={(open) => {
        if (!open) {
          setVersionDocument(null);
          setVersions([]);
        }
      }}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Lịch sử version</DialogTitle>
            <DialogDescription>{versionDocument?.title || 'Tài liệu'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {versionLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Đang tải version...</div>
            ) : versions.length > 0 ? (
              versions.map((version) => (
                <div key={version.id || version.version} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-bold text-foreground">Version {version.version}</p>
                      <p className="text-sm text-muted-foreground break-all">{version.fileName}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#121214] bg-white border border-[#121214]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      {formatFileSize(version.fileSize)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Ngày tạo: {formatDate(version.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
                Chưa có lịch sử version cho tài liệu này.
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setVersionDocument(null)} className="rounded-xl">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}