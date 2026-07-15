import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  HardDrive,
  LayoutDashboard,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  approveTransaction,
  getAllTransactions,
  getSubscriptionPlans,
  type SubscriptionPlan,
} from '../../services/api';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

type TransactionStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | string;

type TransactionUser = {
  id: string;
  email?: string;
  fullName?: string;
};

type TransactionPlan = {
  id: string;
  name: string;
  code?: string;
  price?: number;
  storageLimit?: number;
  dailyChatLimit?: number;
  durationDays?: number;
};

type TransactionItem = {
  id: string;
  amount: number | string;
  status: TransactionStatus;
  paymentMethod?: string;
  description?: string | null;
  orderInfo?: string | null;
  transactionNo?: string | null;
  bankCode?: string | null;
  responseCode?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: TransactionUser | null;
  plan?: TransactionPlan | null;
};

type InvoiceItem = {
  id: string;
  code: string;
  user: string;
  plan: string;
  method: string;
  amount: number;
  createdAt: string;
  status: 'PAID';
};

type RevenuePoint = {
  key: string;
  label: string;
  value: number;
};

const PAYMENT_PAGE_SIZE = 6;
const PLAN_PAGE_SIZE = 6;
const INVOICE_PAGE_SIZE = 6;

function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value || 0);
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeSearchText(value?: string | null): string {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function bytesToGb(value?: number): string {
  const bytes = Number(value || 0);
  return `${Math.round((bytes / 1024 ** 3) * 100) / 100} GB`;
}

function getTransactionCode(transaction: TransactionItem): string {
  return (
    transaction.orderInfo ||
    transaction.transactionNo ||
    transaction.id.slice(0, 12).toUpperCase()
  );
}

function RevenueLineChart({ data }: { data: RevenuePoint[] }) {
  const chartWidth = 640;
  const chartHeight = 230;
  const paddingX = 86;
  const paddingY = 26;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (data.length <= 1
        ? innerWidth / 2
        : (index * innerWidth) / (data.length - 1));

    const y =
      paddingY +
      innerHeight -
      (Number(item.value || 0) / maxValue) * innerHeight;

    return { ...item, x, y };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = points.length
    ? `${paddingX},${chartHeight - paddingY} ${linePoints} ${chartWidth - paddingX
    },${chartHeight - paddingY}`
    : '';

  if (!data.length || data.every((item) => item.value === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center text-muted-foreground">
        Chưa có giao dịch thành công để vẽ biểu đồ doanh thu.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Đơn vị: VNĐ
        </p>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-64 w-full overflow-visible"
          role="img"
        >
          <defs>
            <linearGradient
              id="finance-revenue-line"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            <linearGradient
              id="finance-revenue-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line * innerHeight) / 3;
            const labelValue = Math.round(
              maxValue - (line * maxValue) / 3,
            );

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
                <text
                  x={paddingX - 14}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {labelValue.toLocaleString('vi-VN')}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="url(#finance-revenue-area)" />

          <polyline
            points={linePoints}
            fill="none"
            stroke="url(#finance-revenue-line)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                className="fill-background"
                stroke="url(#finance-revenue-line)"
                strokeWidth="4"
              />
              <circle cx={point.x} cy={point.y} r="3" fill="#0ea5e9" />
              <text
                x={point.x}
                y={point.y - 14}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-semibold"
              >
                {formatCurrency(point.value)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {points.map((point) => (
          <div
            key={point.key}
            className="rounded-xl border border-border bg-muted/20 p-2 text-center"
          >
            <p className="truncate text-xs font-medium">{point.label}</p>
            <p className="mt-1 text-sm font-bold text-sky-500">
              {formatCurrency(point.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  switch (status) {
    case 'SUCCESS':
      return (
        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
          Thành công
        </Badge>
      );

    case 'WAITING_CONFIRMATION':
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
          Chờ Admin duyệt
        </Badge>
      );

    case 'PROCESSING':
      return (
        <Badge className="bg-sky-600 text-white hover:bg-sky-600">
          Đang xử lý
        </Badge>
      );

    case 'PENDING':
      return <Badge variant="secondary">Chờ chuyển khoản</Badge>;

    case 'FAILED':
      return <Badge variant="destructive">Thất bại</Badge>;

    case 'CANCELLED':
      return <Badge variant="outline">Đã hủy</Badge>;

    default:
      return <Badge variant="outline">{status || 'UNKNOWN'}</Badge>;
  }
}

export function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'storage' | 'payment' | 'invoice'
  >('dashboard');

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [viewingPayment, setViewingPayment] =
    useState<TransactionItem | null>(null);

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);

  const [planSearch, setPlanSearch] = useState('');
  const [planPage, setPlanPage] = useState(1);

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoicePage, setInvoicePage] = useState(1);

  const loadFinanceData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [transactionData, planData] = await Promise.all([
        getAllTransactions(),
        getSubscriptionPlans(),
      ]);

      setTransactions(
        Array.isArray(transactionData) ? transactionData : [],
      );
      setPlans(Array.isArray(planData) ? planData : []);

      if (showRefreshToast) {
        toast.success('Đã tải lại dữ liệu tài chính');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tải dữ liệu tài chính';

      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFinanceData();
  }, [loadFinanceData]);

  const successfulTransactions = useMemo(
    () => transactions.filter((item) => item.status === 'SUCCESS'),
    [transactions],
  );

  const totalRevenue = useMemo(
    () =>
      successfulTransactions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
    [successfulTransactions],
  );

  const waitingCount = useMemo(
    () =>
      transactions.filter(
        (item) => item.status === 'WAITING_CONFIRMATION',
      ).length,
    [transactions],
  );

  const proUsers = useMemo(
    () =>
      new Set(
        successfulTransactions
          .map((item) => item.user?.id)
          .filter(Boolean),
      ).size,
    [successfulTransactions],
  );

  const revenueTrend = useMemo<RevenuePoint[]>(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1,
      );

      const month = date.getMonth();
      const year = date.getFullYear();

      const value = successfulTransactions
        .filter((transaction) => {
          const source = transaction.paidAt || transaction.createdAt;
          const transactionDate = new Date(source);

          return (
            transactionDate.getMonth() === month &&
            transactionDate.getFullYear() === year
          );
        })
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount || 0),
          0,
        );

      return {
        key: `${year}-${month + 1}`,
        label: `T${month + 1}`,
        value,
      };
    });
  }, [successfulTransactions]);

  const topPlans = useMemo(() => {
    const counts = new Map<string, number>();

    successfulTransactions.forEach((transaction) => {
      const planName = transaction.plan?.name || 'Không xác định';
      counts.set(planName, (counts.get(planName) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [successfulTransactions]);

  const paymentMethodStats = useMemo(() => {
    const counts = new Map<string, number>();

    transactions.forEach((transaction) => {
      const method = transaction.paymentMethod || 'Không xác định';
      counts.set(method, (counts.get(method) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);
  }, [transactions]);

  const totalPaymentCount = transactions.length;

  const dashboardStats = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(totalRevenue),
      icon: Wallet,
      description: 'Giao dịch đã thành công',
    },
    {
      title: 'Tổng giao dịch',
      value: transactions.length.toLocaleString('vi-VN'),
      icon: ArrowLeftRight,
      description: 'Trong hệ thống',
    },
    {
      title: 'Chờ duyệt',
      value: waitingCount.toLocaleString('vi-VN'),
      icon: CreditCard,
      description: 'Cần Admin kiểm tra',
    },
    {
      title: 'Người dùng Pro',
      value: proUsers.toLocaleString('vi-VN'),
      icon: Crown,
      description: 'Đã thanh toán thành công',
    },
  ];

  const filteredTransactions = useMemo(() => {
    const search = normalizeSearchText(paymentSearch);

    return transactions.filter((transaction) => {
      const code = getTransactionCode(transaction);
      const email = transaction.user?.email || '';
      const fullName = transaction.user?.fullName || '';
      const planName = transaction.plan?.name || '';
      const method = transaction.paymentMethod || '';

      const matchesSearch =
        !search ||
        normalizeSearchText(code).includes(search) ||
        normalizeSearchText(email).includes(search) ||
        normalizeSearchText(fullName).includes(search) ||
        normalizeSearchText(planName).includes(search);

      const matchesMethod =
        !paymentMethodFilter || method === paymentMethodFilter;

      const matchesStatus =
        !paymentStatusFilter ||
        transaction.status === paymentStatusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [
    transactions,
    paymentSearch,
    paymentMethodFilter,
    paymentStatusFilter,
  ]);

  const totalPaymentPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAYMENT_PAGE_SIZE),
  );

  const paginatedTransactions = filteredTransactions.slice(
    (paymentPage - 1) * PAYMENT_PAGE_SIZE,
    paymentPage * PAYMENT_PAGE_SIZE,
  );

  const filteredPlans = useMemo(() => {
    const search = normalizeSearchText(planSearch);

    return plans.filter(
      (plan) =>
        !search ||
        normalizeSearchText(plan.name).includes(search) ||
        normalizeSearchText(plan.code).includes(search),
    );
  }, [plans, planSearch]);

  const totalPlanPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / PLAN_PAGE_SIZE),
  );

  const paginatedPlans = filteredPlans.slice(
    (planPage - 1) * PLAN_PAGE_SIZE,
    planPage * PLAN_PAGE_SIZE,
  );

  const invoices = useMemo<InvoiceItem[]>(
    () =>
      successfulTransactions.map((transaction) => ({
        id: transaction.id,
        code: `HD-${getTransactionCode(transaction)}`,
        user:
          transaction.user?.email ||
          transaction.user?.fullName ||
          'Không xác định',
        plan: transaction.plan?.name || 'Không xác định',
        method: transaction.paymentMethod || 'Không xác định',
        amount: Number(transaction.amount || 0),
        createdAt: transaction.paidAt || transaction.createdAt,
        status: 'PAID',
      })),
    [successfulTransactions],
  );

  const filteredInvoices = useMemo(() => {
    const search = normalizeSearchText(invoiceSearch);

    return invoices.filter(
      (invoice) =>
        !search ||
        normalizeSearchText(invoice.code).includes(search) ||
        normalizeSearchText(invoice.user).includes(search) ||
        normalizeSearchText(invoice.plan).includes(search),
    );
  }, [invoices, invoiceSearch]);

  const totalInvoicePages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / INVOICE_PAGE_SIZE),
  );

  const paginatedInvoices = filteredInvoices.slice(
    (invoicePage - 1) * INVOICE_PAGE_SIZE,
    invoicePage * INVOICE_PAGE_SIZE,
  );

  const paymentMethods = useMemo(
    () =>
      Array.from(
        new Set(
          transactions
            .map((transaction) => transaction.paymentMethod)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [transactions],
  );

  const handleApprove = async (transaction: TransactionItem) => {
    const confirmed = window.confirm(
      `Xác nhận bạn đã kiểm tra tài khoản ngân hàng và muốn duyệt giao dịch ${getTransactionCode(
        transaction,
      )} với số tiền ${formatCurrency(transaction.amount)}?`,
    );

    if (!confirmed) return;

    try {
      setApprovingId(transaction.id);
      await approveTransaction(transaction.id);

      toast.success('Đã duyệt giao dịch và kích hoạt gói thành công');

      setViewingPayment(null);
      await loadFinanceData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể duyệt giao dịch';

      toast.error(message);
      console.error(error);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm text-muted-foreground">
          Đang tải dữ liệu tài chính...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <Wallet className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
            <p className="mt-1 text-muted-foreground">
              Quản lý giao dịch chuyển khoản, gói lưu trữ và hóa đơn.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2 rounded-xl"
          disabled={refreshing}
          onClick={() => void loadFinanceData(true)}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Tải lại
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as typeof activeTab)
        }
      >
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>

          <TabsTrigger value="storage" className="gap-2">
            <HardDrive className="h-4 w-4" />
            Gói lưu trữ
          </TabsTrigger>

          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Thanh toán
            {waitingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {waitingCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="invoice" className="gap-2">
            <Receipt className="h-4 w-4" />
            Hóa đơn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
              <Card key={item.title} className={glowCard}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="truncate text-2xl font-bold sm:text-3xl">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <Card className={glowCard}>
              <CardHeader>
                <CardTitle>Biểu đồ doanh thu</CardTitle>
                <CardDescription>
                  Doanh thu thật từ các giao dịch SUCCESS trong 6 tháng gần nhất.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <RevenueLineChart data={revenueTrend} />
              </CardContent>
            </Card>

            <Card className={glowCard}>
              <CardHeader>
                <CardTitle>Top gói bán chạy</CardTitle>
                <CardDescription>
                  Xếp theo số giao dịch thành công.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {topPlans.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    Chưa có dữ liệu.
                  </p>
                ) : (
                  topPlans.map((plan, index) => (
                    <div
                      key={plan.name}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-semibold">
                          {plan.name}
                        </span>
                      </div>

                      <span className="shrink-0 text-sm text-muted-foreground">
                        {plan.sold} lượt
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className={glowCard}>
            <CardHeader>
              <CardTitle>Thống kê phương thức thanh toán</CardTitle>
              <CardDescription>
                Tỷ lệ giao dịch theo phương thức thực tế.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {paymentMethodStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có giao dịch.
                </p>
              ) : (
                paymentMethodStats.map((item) => {
                  const ratio = totalPaymentCount
                    ? Math.round((item.count / totalPaymentCount) * 100)
                    : 0;

                  return (
                    <div key={item.method} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{item.method}</span>
                        <span className="text-muted-foreground">
                          {item.count} giao dịch · {ratio}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="mt-6 space-y-6">
          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={(event) => {
                    setPlanSearch(event.target.value);
                    setPlanPage(1);
                  }}
                  placeholder="Tìm tên hoặc mã gói..."
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                />
              </div>
            </CardContent>
          </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-border bg-muted/40">
                    <TableRow>
                      <TableHead className="px-6 py-4">Tên gói</TableHead>
                      <TableHead className="px-4 py-4">Mã</TableHead>
                      <TableHead className="px-4 py-4">Giá</TableHead>
                      <TableHead className="px-4 py-4">Dung lượng</TableHead>
                      <TableHead className="px-4 py-4">Chat/ngày</TableHead>
                      <TableHead className="px-4 py-4">Thời hạn</TableHead>
                      <TableHead className="px-6 py-4 text-right">
                        Trạng thái
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="px-6 py-4 font-semibold">
                          {plan.name}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground">
                          {plan.code}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {formatCurrency(plan.price)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {bytesToGb(plan.storageLimit)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {plan.dailyChatLimit.toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {plan.durationDays} ngày
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {plan.isActive ? (
                            <Badge className="bg-emerald-600 text-white">
                              Đang hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Ngừng bán</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {paginatedPlans.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Không tìm thấy gói lưu trữ.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredPlans.length > 0 && (
                <PaginationFooter
                  page={planPage}
                  pageSize={PLAN_PAGE_SIZE}
                  totalItems={filteredPlans.length}
                  totalPages={totalPlanPages}
                  onPageChange={setPlanPage}
                  label="gói"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6 space-y-6">
          <Card className={glowCard}>
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(event) => {
                      setPaymentSearch(event.target.value);
                      setPaymentPage(1);
                    }}
                    placeholder="Mã GD, email, tên hoặc gói..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phương thức
                  </label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(event) => {
                      setPaymentMethodFilter(event.target.value);
                      setPaymentPage(1);
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả phương thức</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Trạng thái
                  </label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(event) => {
                      setPaymentStatusFilter(event.target.value);
                      setPaymentPage(1);
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="WAITING_CONFIRMATION">
                      Chờ Admin duyệt
                    </option>
                    <option value="PENDING">Chờ chuyển khoản</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              {(paymentSearch ||
                paymentMethodFilter ||
                paymentStatusFilter) && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Tìm thấy {filteredTransactions.length} giao dịch.
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPaymentSearch('');
                        setPaymentMethodFilter('');
                        setPaymentStatusFilter('');
                        setPaymentPage(1);
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-border bg-muted/40">
                    <TableRow>
                      <TableHead className="px-6 py-4">
                        Mã giao dịch
                      </TableHead>
                      <TableHead className="px-4 py-4">
                        Người dùng
                      </TableHead>
                      <TableHead className="px-4 py-4">Gói</TableHead>
                      <TableHead className="px-4 py-4">
                        Phương thức
                      </TableHead>
                      <TableHead className="px-4 py-4">Số tiền</TableHead>
                      <TableHead className="px-4 py-4">Ngày tạo</TableHead>
                      <TableHead className="px-4 py-4">
                        Trạng thái
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedTransactions.map((transaction) => {
                      const isApproving =
                        approvingId === transaction.id;

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-6 py-4 font-mono text-xs font-semibold">
                            {getTransactionCode(transaction)}
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            <p className="font-medium">
                              {transaction.user?.fullName ||
                                'Chưa cập nhật tên'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.user?.email || '—'}
                            </p>
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            {transaction.plan?.name || '—'}
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            {transaction.paymentMethod || '—'}
                          </TableCell>

                          <TableCell className="whitespace-nowrap px-4 py-4 font-semibold">
                            {formatCurrency(transaction.amount)}
                          </TableCell>

                          <TableCell className="px-4 py-4 text-muted-foreground">
                            {formatDate(
                              transaction.paidAt ||
                              transaction.createdAt,
                            )}
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            <TransactionStatusBadge
                              status={transaction.status}
                            />
                          </TableCell>

                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Xem chi tiết"
                                onClick={() =>
                                  setViewingPayment(transaction)
                                }
                                className="h-8 w-8 rounded-full"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {transaction.status ===
                                'WAITING_CONFIRMATION' && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={isApproving}
                                    onClick={() =>
                                      void handleApprove(transaction)
                                    }
                                    className="gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    {isApproving ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    {isApproving
                                      ? 'Đang duyệt'
                                      : 'Duyệt'}
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {paginatedTransactions.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Không tìm thấy giao dịch.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredTransactions.length > 0 && (
                <PaginationFooter
                  page={paymentPage}
                  pageSize={PAYMENT_PAGE_SIZE}
                  totalItems={filteredTransactions.length}
                  totalPages={totalPaymentPages}
                  onPageChange={setPaymentPage}
                  label="giao dịch"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="mt-6 space-y-6">
          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(event) => {
                    setInvoiceSearch(event.target.value);
                    setInvoicePage(1);
                  }}
                  placeholder="Tìm mã hóa đơn, email hoặc gói..."
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                />
              </div>
            </CardContent>
          </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-border bg-muted/40">
                    <TableRow>
                      <TableHead className="px-6 py-4">Mã hóa đơn</TableHead>
                      <TableHead className="px-4 py-4">Người dùng</TableHead>
                      <TableHead className="px-4 py-4">Gói</TableHead>
                      <TableHead className="px-4 py-4">
                        Phương thức
                      </TableHead>
                      <TableHead className="px-4 py-4">Số tiền</TableHead>
                      <TableHead className="px-4 py-4">
                        Ngày thanh toán
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right">
                        Trạng thái
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="px-6 py-4 font-mono text-xs font-semibold">
                          {invoice.code}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {invoice.user}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {invoice.plan}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {invoice.method}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Badge className="bg-emerald-600 text-white">
                            Đã thanh toán
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                    {paginatedInvoices.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Chưa có hóa đơn thanh toán thành công.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredInvoices.length > 0 && (
                <PaginationFooter
                  page={invoicePage}
                  pageSize={INVOICE_PAGE_SIZE}
                  totalItems={filteredInvoices.length}
                  totalPages={totalInvoicePages}
                  onPageChange={setInvoicePage}
                  label="hóa đơn"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(viewingPayment)}
        onOpenChange={(open) => {
          if (!open) setViewingPayment(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-border bg-background sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <DialogDescription>
              {viewingPayment
                ? getTransactionCode(viewingPayment)
                : ''}
            </DialogDescription>
          </DialogHeader>

          {viewingPayment && (
            <div className="space-y-3 text-sm">
              <DetailRow
                label="Người dùng"
                value={
                  viewingPayment.user?.fullName ||
                  viewingPayment.user?.email ||
                  '—'
                }
              />
              <DetailRow
                label="Email"
                value={viewingPayment.user?.email || '—'}
              />
              <DetailRow
                label="Gói"
                value={viewingPayment.plan?.name || '—'}
              />
              <DetailRow
                label="Phương thức"
                value={viewingPayment.paymentMethod || '—'}
              />
              <DetailRow
                label="Số tiền"
                value={formatCurrency(viewingPayment.amount)}
              />
              <DetailRow
                label="Nội dung chuyển khoản"
                value={viewingPayment.orderInfo || '—'}
                mono
              />
              <DetailRow
                label="Ngày tạo"
                value={formatDate(viewingPayment.createdAt)}
              />
              <DetailRow
                label="Ngày thanh toán"
                value={formatDate(viewingPayment.paidAt)}
              />
              <DetailRow
                label="Mã phản hồi"
                value={viewingPayment.responseCode || '—'}
              />

              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <span className="text-muted-foreground">Trạng thái</span>
                <TransactionStatusBadge status={viewingPayment.status} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingPayment(null)}
            >
              Đóng
            </Button>

            {viewingPayment?.status === 'WAITING_CONFIRMATION' && (
              <Button
                type="button"
                disabled={approvingId === viewingPayment.id}
                onClick={() => void handleApprove(viewingPayment)}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {approvingId === viewingPayment.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Duyệt giao dịch
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`break-all text-right font-medium ${mono ? 'font-mono text-xs' : ''
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function PaginationFooter({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  label,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {(page - 1) * pageSize + 1}–
        {Math.min(page * pageSize, totalItems)}/{totalItems} {label}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .slice(Math.max(0, page - 3), Math.max(5, page + 2))
          .map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? 'default' : 'outline'}
              size="sm"
              className="h-8 min-w-8 px-2 text-xs"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page === totalPages}
          onClick={() =>
            onPageChange(Math.min(totalPages, page + 1))
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}