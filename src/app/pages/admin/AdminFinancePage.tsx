import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  Crown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarRange,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { toast } from 'sonner';
import {
  getAllInvoicesAdmin,
  getAllTransactions,
  type InvoiceItem,
} from '../../services/api';

const glowCard = 'bg-white rounded-3xl p-2 border border-[#121214]/5 shadow-sm transition-all duration-300 hover:shadow-md';

const PAGE_SIZE = 8;

type DatePreset = 'all' | '7d' | '30d' | 'month' | 'custom';

interface PaymentRow {
  id: string;
  code: string;
  invoiceCode: string;
  userName: string;
  userEmail: string;
  plan: string;
  method: string;
  amount: number;
  createdAt: string;
  createdAtRaw: string;
  status: 'success' | 'failed' | 'pending';
  description?: string;
}

interface InvoiceRow {
  id: string;
  code: string;
  txnRef: string;
  userName: string;
  userEmail: string;
  plan: string;
  method: string;
  amount: number;
  createdAt: string;
  createdAtRaw: string;
  paidAt: string;
  status: 'paid' | 'unpaid' | 'cancelled';
}

type LineChartPoint = { key: string; label: string; value: number };

function formatCurrency(value: number): string {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('vi-VN');
}

function toInputDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getPresetRange(preset: DatePreset): { fromDate: string; toDate: string } {
  const today = new Date();
  const toDate = toInputDate(today);
  if (preset === '7d') {
    const from = new Date();
    from.setDate(from.getDate() - 6);
    return { fromDate: toInputDate(from), toDate };
  }
  if (preset === '30d') {
    const from = new Date();
    from.setDate(from.getDate() - 29);
    return { fromDate: toInputDate(from), toDate };
  }
  if (preset === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { fromDate: toInputDate(from), toDate };
  }
  return { fromDate: '', toDate: '' };
}

function mapTxnToRow(txn: any): PaymentRow {
  const statusMap: Record<string, PaymentRow['status']> = {
    SUCCESS: 'success',
    FAILED: 'failed',
    PENDING: 'pending',
  };
  return {
    id: txn.id,
    code: txn.txnRef || txn.id.slice(0, 10).toUpperCase(),
    invoiceCode: txn.invoice?.invoiceCode || '—',
    userName: txn.user?.fullName || '—',
    userEmail: txn.user?.email || txn.userId || '—',
    plan: txn.plan?.name || txn.description || '—',
    method: txn.paymentMethod || '—',
    amount: Number(txn.amount) || 0,
    createdAt: formatDateTime(txn.createdAt),
    createdAtRaw: txn.createdAt,
    status: statusMap[txn.status] || 'pending',
    description: txn.description || '',
  };
}

function mapInvoiceToRow(inv: InvoiceItem): InvoiceRow {
  const statusMap: Record<string, InvoiceRow['status']> = {
    PAID: 'paid',
    PENDING: 'unpaid',
    FAILED: 'cancelled',
    CANCELLED: 'cancelled',
  };
  return {
    id: inv.id,
    code: inv.invoiceCode,
    txnRef: inv.txnRef || '—',
    userName: inv.user?.fullName || '—',
    userEmail: inv.user?.email || inv.userId,
    plan: inv.plan?.name || inv.planId,
    method: inv.paymentMethod || '—',
    amount: Number(inv.amount) || 0,
    createdAt: formatDateTime(inv.createdAt),
    createdAtRaw: inv.createdAt || '',
    paidAt: formatDateTime(inv.paidAt),
    status: statusMap[inv.status] || 'unpaid',
  };
}

function RevenueLineChart({ data }: { data: LineChartPoint[] }) {
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 78;
  const paddingY = 28;
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

  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center text-sm text-muted-foreground">
        Chưa có doanh thu trong khoảng đã chọn.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Đơn vị: VNĐ</p>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-56 w-full overflow-visible" role="img">
        <defs>
          <linearGradient id="finance-revenue-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="finance-revenue-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = paddingY + (line * innerHeight) / 3;
          const labelValue = Math.round(maxValue - (line * maxValue) / 3);
          return (
            <g key={line}>
              <line x1={paddingX} x2={chartWidth - paddingX} y1={y} y2={y} className="stroke-border" strokeDasharray="5 8" />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
                {labelValue.toLocaleString('vi-VN')}
              </text>
            </g>
          );
        })}
        <polygon points={areaPoints} fill="url(#finance-revenue-area)" />
        <polyline points={linePoints} fill="none" stroke="url(#finance-revenue-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r="5" className="fill-background" stroke="url(#finance-revenue-line)" strokeWidth="3" />
            <text x={point.x} y={chartHeight - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'invoices'>('dashboard');
  const [loading, setLoading] = useState(true);

  // Shared filters
  const [userSearch, setUserSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [fromDate, setFromDate] = useState(() => getPresetRange('30d').fromDate);
  const [toDate, setToDate] = useState(() => getPresetRange('30d').toDate);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0, pending: 0, revenue: 0 });

  const [paymentPage, setPaymentPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);

  const [viewingPayment, setViewingPayment] = useState<PaymentRow | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRow | null>(null);

  const filterParams = useMemo(() => {
    const params: Record<string, string | undefined> = {
      search: userSearch || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      paymentMethod: methodFilter || undefined,
    };
    if (statusFilter) {
      // map UI status to API for each endpoint differently — handled below
      params.status = statusFilter;
    }
    return params;
  }, [userSearch, fromDate, toDate, statusFilter, methodFilter]);

  const loadFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const txnStatus =
        statusFilter === 'success'
          ? 'SUCCESS'
          : statusFilter === 'failed'
            ? 'FAILED'
            : statusFilter === 'pending'
              ? 'PENDING'
              : statusFilter === 'paid'
                ? 'SUCCESS'
                : statusFilter === 'unpaid'
                  ? 'PENDING'
                  : statusFilter === 'cancelled'
                    ? 'FAILED'
                    : undefined;

      const invStatus =
        statusFilter === 'paid' || statusFilter === 'success'
          ? 'PAID'
          : statusFilter === 'unpaid' || statusFilter === 'pending'
            ? 'PENDING'
            : statusFilter === 'cancelled' || statusFilter === 'failed'
              ? 'FAILED'
              : undefined;

      const [apiTxns, apiInvoices] = await Promise.all([
        getAllTransactions({
          search: filterParams.search,
          fromDate: filterParams.fromDate,
          toDate: filterParams.toDate,
          paymentMethod: filterParams.paymentMethod,
          status: txnStatus,
        }),
        getAllInvoicesAdmin({
          search: filterParams.search,
          fromDate: filterParams.fromDate,
          toDate: filterParams.toDate,
          status: invStatus,
          paymentMethod: filterParams.paymentMethod,
        }),
      ]);

      const txnList = apiTxns?.transactions || [];
      setPayments(txnList.map(mapTxnToRow));
      setSummary(
        apiTxns?.summary || {
          total: txnList.length,
          success: txnList.filter((t: any) => t.status === 'SUCCESS').length,
          failed: txnList.filter((t: any) => t.status === 'FAILED').length,
          pending: txnList.filter((t: any) => t.status === 'PENDING').length,
          revenue: txnList
            .filter((t: any) => t.status === 'SUCCESS')
            .reduce((s: number, t: any) => s + Number(t.amount || 0), 0),
        }
      );
      setInvoices(apiInvoices.map(mapInvoiceToRow));
      setPaymentPage(1);
      setInvoicePage(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được dữ liệu tài chính');
    } finally {
      setLoading(false);
    }
  }, [filterParams, statusFilter]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const applySearch = () => {
    setUserSearch(searchDraft.trim());
  };

  const clearFilters = () => {
    setSearchDraft('');
    setUserSearch('');
    setStatusFilter('');
    setMethodFilter('');
    setDatePreset('30d');
    const range = getPresetRange('30d');
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  };

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') return;
    const range = getPresetRange(preset);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  };

  const chartData = useMemo(() => {
    const buckets: LineChartPoint[] = [];
    const start = fromDate ? new Date(fromDate) : new Date(Date.now() - 29 * 86400000);
    const end = toDate ? new Date(toDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const daySpan = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    const useDaily = daySpan <= 45;

    if (useDaily) {
      for (let i = 0; i < daySpan; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        buckets.push({
          key: toInputDate(d),
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          value: 0,
        });
      }
      payments
        .filter((p) => p.status === 'success')
        .forEach((p) => {
          const key = toInputDate(new Date(p.createdAtRaw));
          const bucket = buckets.find((b) => b.key === key);
          if (bucket) bucket.value += p.amount;
        });
      // sample to at most 12 points for readability
      if (buckets.length > 12) {
        const step = Math.ceil(buckets.length / 12);
        return buckets.filter((_, i) => i % step === 0 || i === buckets.length - 1);
      }
      return buckets;
    }

    // month buckets
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      buckets.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        label: `T${cursor.getMonth() + 1}`,
        value: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    payments
      .filter((p) => p.status === 'success')
      .forEach((p) => {
        const d = new Date(p.createdAtRaw);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) bucket.value += p.amount;
      });
    return buckets;
  }, [payments, fromDate, toDate]);

  const topPlans = useMemo(() => {
    const map = new Map<string, { name: string; sold: number; revenue: number }>();
    payments
      .filter((p) => p.status === 'success')
      .forEach((p) => {
        const name = p.plan || 'Khác';
        const prev = map.get(name) || { name, sold: 0, revenue: 0 };
        prev.sold += 1;
        prev.revenue += p.amount;
        map.set(name, prev);
      });
    return Array.from(map.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [payments]);

  const methodStats = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach((p) => {
      const key = p.method || 'Khác';
      map.set(key, (map.get(key) || 0) + 1);
    });
    const total = payments.length || 1;
    return Array.from(map.entries()).map(([method, count]) => ({
      method,
      count,
      ratio: Math.round((count / total) * 100),
    }));
  }, [payments]);

  const uniquePayingUsers = useMemo(() => {
    const set = new Set(
      payments.filter((p) => p.status === 'success').map((p) => p.userEmail)
    );
    return set.size;
  }, [payments]);

  const totalPaymentPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const paginatedPayments = payments.slice((paymentPage - 1) * PAGE_SIZE, paymentPage * PAGE_SIZE);

  const totalInvoicePages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const paginatedInvoices = invoices.slice((invoicePage - 1) * PAGE_SIZE, invoicePage * PAGE_SIZE);

  const paymentStatusBadge = (status: PaymentRow['status']) => {
    if (status === 'success') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Thành công</Badge>;
    if (status === 'pending') return <Badge variant="secondary">Đang chờ</Badge>;
    return <Badge variant="destructive">Thất bại</Badge>;
  };

  const invoiceStatusBadge = (status: InvoiceRow['status']) => {
    if (status === 'paid') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Đã thanh toán</Badge>;
    if (status === 'unpaid') return <Badge variant="secondary">Chưa thanh toán</Badge>;
    return <Badge variant="destructive">Thất bại / Hủy</Badge>;
  };

  const Pagination = ({
    page,
    totalPages,
    onChange,
  }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
  }) => (
    <div className="flex items-center justify-end gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-lg">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        Trang {page}/{totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );

  const kpiCards = [
    {
      title: 'Doanh thu',
      value: formatCurrency(summary.revenue),
      description: 'Giao dịch thành công trong khoảng đã chọn',
      icon: TrendingUp,
    },
    {
      title: 'Tổng giao dịch',
      value: summary.total.toLocaleString('vi-VN'),
      description: `${summary.success} thành công · ${summary.failed} thất bại`,
      icon: ArrowLeftRight,
    },
    {
      title: 'Hóa đơn',
      value: invoices.length.toLocaleString('vi-VN'),
      description: `${invoices.filter((i) => i.status === 'paid').length} đã thanh toán`,
      icon: Receipt,
    },
    {
      title: 'Người thanh toán',
      value: uniquePayingUsers.toLocaleString('vi-VN'),
      description: 'User có giao dịch thành công',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6 text-[#121214] selection:bg-[#121214] selection:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#121214] rounded-xl flex items-center justify-center shadow-sm">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý Tài chính</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? 'Đang tải dữ liệu...' : 'Doanh thu, giao dịch và hóa đơn'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadFinanceData} disabled={loading} className="rounded-xl gap-2 self-start">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter bar */}
      <Card className={glowCard}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-500" />
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </div>
          <CardDescription>Lọc theo tên/email user, khoảng thời gian, trạng thái và phương thức thanh toán.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['7d', '7 ngày'],
                ['30d', '30 ngày'],
                ['month', 'Tháng này'],
                ['all', 'Tất cả'],
                ['custom', 'Tùy chọn'],
              ] as [DatePreset, string][]
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={datePreset === key ? 'default' : 'outline'}
                className={`rounded-full ${datePreset === key ? 'bg-sky-600 hover:bg-sky-700 text-white' : ''}`}
                onClick={() => applyPreset(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="xl:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Tìm user (tên / email)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    placeholder="VD: Nguyen Van A / email@..."
                    className="pl-9 rounded-xl"
                  />
                </div>
                <Button type="button" onClick={applySearch} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white">
                  Tìm
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5" /> Từ ngày
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setFromDate(e.target.value);
                }}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Đến ngày</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setToDate(e.target.value);
                }}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Trạng thái</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="success">Thành công / Đã thanh toán</option>
                <option value="pending">Đang chờ / Chưa thanh toán</option>
                <option value="failed">Thất bại / Hủy</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Phương thức</Label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">MoMo</option>
                <option value="PAYOS">PayOS</option>
              </select>
            </div>
          </div>

          {(userSearch || statusFilter || methodFilter || datePreset !== '30d') && (
            <div className="flex flex-wrap items-center gap-2">
              {userSearch && (
                <Badge variant="secondary" className="gap-1 rounded-full">
                  User: {userSearch}
                  <button type="button" onClick={() => { setUserSearch(''); setSearchDraft(''); }}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="text-xs rounded-full">
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-fit flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Giao dịch
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="w-4 h-4" />
            Hóa đơn
          </TabsTrigger>
        </TabsList>

        {/* ===================== DASHBOARD ===================== */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((item) => (
              <Card key={item.title} className={glowCard}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardDescription className="text-xs uppercase tracking-wide">{item.title}</CardDescription>
                      <CardTitle className="text-2xl mt-1 tabular-nums">{item.value}</CardTitle>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-4">
            <Card className={glowCard}>
              <CardHeader>
                <CardTitle className="text-base">Doanh thu theo thời gian</CardTitle>
                <CardDescription>Chỉ tính giao dịch thành công trong khoảng lọc hiện tại.</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueLineChart data={chartData} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className={glowCard}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-base">Top gói bán chạy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPlans.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Chưa có dữ liệu bán gói.</p>
                  ) : (
                    topPlans.map((plan, index) => (
                      <div
                        key={plan.name}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-6 w-6 rounded-full bg-sky-500/15 text-sky-600 text-[11px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{plan.name}</p>
                            <p className="text-[11px] text-muted-foreground">{formatCurrency(plan.revenue)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold shrink-0">{plan.sold} lượt</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className={glowCard}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Theo phương thức</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {methodStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Chưa có giao dịch.</p>
                  ) : (
                    methodStats.map((item) => (
                      <div key={item.method} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">{item.method}</span>
                          <span className="text-muted-foreground">
                            {item.count} ({item.ratio}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-sky-500" style={{ width: `${item.ratio}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className={glowCard}>
            <CardHeader>
              <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
              <CardDescription>5 giao dịch mới nhất theo bộ lọc hiện tại</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Không có giao dịch nào khớp bộ lọc.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Gói</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.slice(0, 5).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-semibold">{p.userName}</p>
                              <p className="text-[11px] text-muted-foreground">{p.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{p.plan}</TableCell>
                          <TableCell className="font-bold tabular-nums">{formatCurrency(p.amount)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{p.createdAt}</TableCell>
                          <TableCell className="text-right">{paymentStatusBadge(p.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== PAYMENTS ===================== */}
        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card className={glowCard}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Danh sách giao dịch</CardTitle>
                  <CardDescription>
                    {loading ? 'Đang tải...' : `${payments.length} giao dịch · Doanh thu ${formatCurrency(summary.revenue)}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">Không tìm thấy giao dịch phù hợp.</p>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã GD</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Gói</TableHead>
                          <TableHead>PTTT</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Chi tiết</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div>
                                <p className="text-sm font-semibold truncate max-w-[120px]">{p.code}</p>
                                <p className="text-[11px] text-muted-foreground">{p.invoiceCode}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{p.userName}</p>
                                <p className="text-[11px] text-muted-foreground">{p.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{p.plan}</TableCell>
                            <TableCell className="text-sm font-medium">{p.method}</TableCell>
                            <TableCell className="font-bold tabular-nums">{formatCurrency(p.amount)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{p.createdAt}</TableCell>
                            <TableCell>{paymentStatusBadge(p.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setViewingPayment(p)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination page={paymentPage} totalPages={totalPaymentPages} onChange={setPaymentPage} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== INVOICES ===================== */}
        <TabsContent value="invoices" className="space-y-4 mt-6">
          <Card className={glowCard}>
            <CardHeader>
              <CardTitle className="text-base">Danh sách hóa đơn</CardTitle>
              <CardDescription>
                {loading ? 'Đang tải...' : `${invoices.length} hóa đơn trong khoảng lọc`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">Không tìm thấy hóa đơn phù hợp.</p>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã HĐ</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Gói</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Tạo lúc</TableHead>
                          <TableHead>Thanh toán</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Chi tiết</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedInvoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-semibold text-sm">{inv.code}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{inv.userName}</p>
                                <p className="text-[11px] text-muted-foreground">{inv.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{inv.plan}</TableCell>
                            <TableCell className="font-bold tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{inv.createdAt}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{inv.paidAt}</TableCell>
                            <TableCell>{invoiceStatusBadge(inv.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setViewingInvoice(inv)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination page={invoicePage} totalPages={totalInvoicePages} onChange={setInvoicePage} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment detail */}
      <Sheet open={Boolean(viewingPayment)} onOpenChange={(open) => !open && setViewingPayment(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Chi tiết giao dịch</SheetTitle>
            <SheetDescription>{viewingPayment?.code}</SheetDescription>
          </SheetHeader>
          {viewingPayment && (
            <div className="mt-6 space-y-3 text-sm">
              <Row label="User" value={`${viewingPayment.userName} (${viewingPayment.userEmail})`} />
              <Row label="Gói" value={viewingPayment.plan} />
              <Row label="Hóa đơn" value={viewingPayment.invoiceCode} />
              <Row label="Phương thức" value={viewingPayment.method} />
              <Row label="Số tiền" value={formatCurrency(viewingPayment.amount)} />
              <Row label="Thời gian" value={viewingPayment.createdAt} />
              <div className="flex justify-between gap-3 py-2 border-b border-border/60">
                <span className="text-muted-foreground">Trạng thái</span>
                {paymentStatusBadge(viewingPayment.status)}
              </div>
              {viewingPayment.description && <Row label="Mô tả" value={viewingPayment.description} />}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Invoice detail */}
      <Sheet open={Boolean(viewingInvoice)} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Chi tiết hóa đơn</SheetTitle>
            <SheetDescription>{viewingInvoice?.code}</SheetDescription>
          </SheetHeader>
          {viewingInvoice && (
            <div className="mt-6 space-y-3 text-sm">
              <Row label="Mã hóa đơn" value={viewingInvoice.code} />
              <Row label="Mã giao dịch" value={viewingInvoice.txnRef} />
              <Row label="User" value={`${viewingInvoice.userName} (${viewingInvoice.userEmail})`} />
              <Row label="Gói" value={viewingInvoice.plan} />
              <Row label="Phương thức" value={viewingInvoice.method} />
              <Row label="Số tiền" value={formatCurrency(viewingInvoice.amount)} />
              <Row label="Tạo lúc" value={viewingInvoice.createdAt} />
              <Row label="Thanh toán" value={viewingInvoice.paidAt} />
              <div className="flex justify-between gap-3 py-2 border-b border-border/60">
                <span className="text-muted-foreground">Trạng thái</span>
                {invoiceStatusBadge(viewingInvoice.status)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-border/60">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  );
}
