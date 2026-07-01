import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  History,

  RefreshCw,
  Edit,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DocumentMetadataDialog } from '../../components/documents/DocumentMetadataDialog';
import {
  deleteDocument,
  deleteUser,
  getCategories,

  getDocuments,
  getDocumentVersions,
  getMe,
  getUsers,
  toAbsoluteFileUrl,
  updateDocument,
  updateUserRole,
  type CategoryItem,
  type DocumentItem,
  type DocumentMetadata,
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

// Glow shadow dùng chung cho các card — ánh sáng xanh dương (sky/cyan), đồng bộ với Dashboard người dùng.
const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
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
    let nextCategories: CategoryItem[] = [];
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
      nextCategories = await getCategories();
    } catch {
      nextCategories = [];
    }

    try {
      nextCurrentUser = await getMe();
    } catch {
      nextCurrentUser = null;
    }

    setUsers(nextUsers);
    setDocuments(nextDocuments);
    setCategories(nextCategories);
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
  const adminUsers = useMemo(() => users.filter((user) => user.role === 'ADMIN').length, [users]);
  const publicDocuments = useMemo(() => documents.filter((doc) => doc.isPublic !== false).length, [documents]);
  const privateDocuments = Math.max(documents.length - publicDocuments, 0);
  const unclassifiedDocuments = useMemo(
    () => documents.filter((doc) => !doc.category?.name && !doc.subject && !doc.subjectRef?.name).length,
    [documents],
  );

  const stats = [
    { title: 'Tổng người dùng', value: String(users.length), change: `${verifiedUsers} đã xác thực`, icon: Users, color: 'text-sky-500', iconBg: 'bg-sky-50 dark:bg-sky-500/10' },
    { title: 'Tổng tài liệu', value: String(documents.length), change: `${publicDocuments} công khai`, icon: FileText, color: 'text-indigo-500', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { title: 'Tổng lượt tải', value: String(totalDownloads), change: 'Từ API documents', icon: TrendingUp, color: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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


  const roleStats = useMemo(() => {
    const roles = ['ADMIN', 'USER', 'GUEST'];
    return roles.map((role) => ({
      role,
      count: users.filter((user) => (user.role || 'USER') === role).length,
    }));
  }, [users]);

  const maxRoleCount = Math.max(...roleStats.map((item) => item.count), 1);

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
      const name = doc.title?.toLowerCase() || '';
      const classification = (doc.category?.name || doc.subjectRef?.name || doc.subject || '').toLowerCase();
      const size = Number(doc.fileSize || 0) / (1024 * 1024);
      const matchSearch = !docSearch || name.includes(docSearch.toLowerCase());
      const matchType = !docTypeFilter || classification === docTypeFilter.toLowerCase();
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
  const topDocuments = useMemo(
    () => [...documents].sort((a, b) => Number(b.downloadCount || 0) - Number(a.downloadCount || 0)).slice(0, 5),
    [documents],
  );

  const handleChangeRole = async (user: User, role: string) => {
    if (!user.id) return;
    setActionLoading(user.id);
    try {
      await updateUserRole(user.id, role);
      toast.success('Đã cập nhật vai trò người dùng');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật vai trò');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDocument = async (documentItem: DocumentItem) => {
    if (!documentItem.id) return;

    const ok = window.confirm(`Xóa tài liệu "${documentItem.title}"? Thao tác này không thể hoàn tác.`);
    if (!ok) return;

    setActionLoading(documentItem.id);
    try {
      await deleteDocument(documentItem.id);
      toast.success('Đã xóa tài liệu');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa tài liệu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditDocument = async (metadata: DocumentMetadata, file?: File | null) => {
    if (!editingDocument?.id) return;

    setEditLoading(true);
    try {
      const updatedDocument = await updateDocument(editingDocument.id, metadata, file);
      setDocuments((prev) => prev.map((doc) => (doc.id === editingDocument.id ? { ...doc, ...updatedDocument } : doc)));
      toast.success('Đã sửa tài liệu');
      setEditingDocument(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể sửa tài liệu');
    } finally {
      setEditLoading(false);
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

  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    if (user.id === currentUser?.id) {
      toast.error('Không thể xóa chính tài khoản admin đang đăng nhập.');
      return;
    }

    const ok = window.confirm(`Xóa tài khoản ${user.email}? Thao tác này sẽ xóa cả tài liệu của tài khoản đó.`);
    if (!ok) return;

    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      toast.success('Đã xóa người dùng');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa người dùng');
    } finally {
      setActionLoading(null);
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
        description: 'Xem danh sách tài liệu từ backend và xóa tài liệu không phù hợp.',
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
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
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
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3 hover:shadow-[0_0_20px_-10px_rgba(56,189,248,0.6)] transition-shadow">
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
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3 hover:shadow-[0_0_20px_-10px_rgba(56,189,248,0.6)] transition-shadow">
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
                      <TableHead className="py-4 px-4">Xác thực</TableHead>
                      <TableHead className="py-4 px-4">Dung lượng</TableHead>
                      <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                      <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 ring-2 ring-indigo-500/20">
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
                                {getInitials(user.fullName, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium whitespace-nowrap">{user.fullName || 'Chưa có tên'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="py-4 px-4">
                          <select
                            value={user.role || 'USER'}
                            disabled={actionLoading === user.id}
                            onChange={(e) => handleChangeRole(user, e.target.value)}
                            aria-label={`Vai trò của ${user.fullName || user.email}`}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="GUEST">GUEST</option>
                          </select>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                            {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{formatFileSize(user.usedStorage)}</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={actionLoading === user.id || user.id === currentUser?.id}
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
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
                    <TableHead className="py-4 px-4">Ngày tải</TableHead>
                    <TableHead className="py-4 px-6 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                      <TableCell className="py-4 px-6 font-medium max-w-[320px] truncate">{doc.title}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại'}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{doc.user?.fullName || doc.uploadedBy || 'Không rõ'}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell className="py-4 px-4 text-center text-muted-foreground">{doc.downloadCount || 0}</TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                      <TableCell className="py-4 px-6 text-center max-w-[144px] whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-sky-600 hover:text-sky-700"
                            onClick={() => navigate(`/admin/documents/${doc.id}`)}
                            aria-label="Xem"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-amber-600 hover:text-amber-700"
                            disabled={editLoading && editingDocument?.id === doc.id}
                            onClick={() => setEditingDocument(doc)}
                            aria-label="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-purple-600 hover:text-purple-700"
                            disabled={versionLoading && versionDocument?.id === doc.id}
                            onClick={() => handleViewDocumentVersions(doc)}
                            aria-label="Version"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive/80"
                            disabled={actionLoading === doc.id}
                            onClick={() => handleDeleteDocument(doc)}
                            aria-label="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredDocuments.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
        onClose={() => {
          if (!editLoading) setEditingDocument(null);
        }}
        onSubmit={handleEditDocument}
      />

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
                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      {formatFileSize(version.fileSize)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Ngày tạo: {formatDate(version.createdAt)}</p>
                  {version.fileUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-xl"
                      onClick={() => window.open(toAbsoluteFileUrl(version.fileUrl), '_blank', 'noopener,noreferrer')}
                    >
                      Mở file version này
                    </Button>
                  )}
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