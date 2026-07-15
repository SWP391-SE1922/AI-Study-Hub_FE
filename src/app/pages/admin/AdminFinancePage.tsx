import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  HardDrive,
  CreditCard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  Crown,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';

// Shadow dùng chung cho các card — giống hệt AdminPage.tsx / adminCategory.tsx, không tạo màu mới.
const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

// Luôn hiển thị số tiền đầy đủ, rõ ràng (VD: 249.000.000đ) — không rút gọn thành "triệu/tỷ".
function formatCurrency(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/* ========================================================================
 * Biểu đồ đường doanh thu — copy nguyên logic vẽ SVG từ LineTrendChart
 * đang có trong AdminPage.tsx (không tách file riêng theo yêu cầu).
 * ==================================================================== */
type LineChartPoint = { key: string; label: string; value: number; note?: string };

function RevenueLineChart({ data }: { data: LineChartPoint[] }) {
  const chartWidth = 640;
  const chartHeight = 230;
  // paddingX rộng hơn bản gốc (34) vì trục Y ở đây hiển thị số tiền đầy đủ
  // (VD: "60.000.000") thay vì số đếm ngắn (VD: "12") — cần thêm chỗ để nhãn
  // không đè lên đường biểu đồ, giữ đúng cách canh chỉnh chuẩn như LineTrendChart gốc.
  const paddingX = 86;
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
        Chưa có dữ liệu doanh thu để vẽ biểu đồ.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Đơn vị: VNĐ
        </p>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 w-full overflow-visible" role="img">
          <defs>
            <linearGradient id="finance-revenue-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="finance-revenue-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line * innerHeight) / 3;
            const labelValue = Math.round((maxValue - (line * maxValue) / 3) / 1_000_000) * 1_000_000;
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
                <text x={paddingX - 40} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
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
              <circle cx={point.x} cy={point.y} r="7" className="fill-background" stroke="url(#finance-revenue-line)" strokeWidth="4" />
              <circle cx={point.x} cy={point.y} r="3" fill="#0ea5e9" />
              <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                {formatCurrency(point.value)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {points.map((point) => (
          <div key={point.key} className="rounded-xl border border-border bg-muted/20 p-2 text-center">
            <p className="truncate text-xs font-medium">{point.label}</p>
            <p className="mt-1 text-sm font-bold text-sky-500">{formatCurrency(point.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================
 * Types
 * ==================================================================== */
type BadgeColor = 'default' | 'secondary' | 'outline' | 'destructive';
type PaymentMethod = 'VNPay' | 'MoMo QR';

interface StoragePlan {
  id: string;
  name: string;
  price: number;
  storage: string;
  cycle: string;
  badgeColor: BadgeColor;
  status: 'active' | 'inactive';
  permissions: string[];
}

interface PaymentTransaction {
  id: string;
  code: string;
  user: string;
  plan: string;
  method: PaymentMethod;
  amount: number;
  paidAt: string;
  status: 'success' | 'failed' | 'pending';
}

interface InvoiceRecord {
  id: string;
  code: string;
  user: string;
  plan: string;
  method: PaymentMethod;
  amount: number;
  createdAt: string;
  status: 'paid' | 'unpaid' | 'cancelled';
}

/* ========================================================================
 * Dữ liệu finance sẽ được nối từ API thật khi backend sẵn sàng.
 * Hiện tại giữ trạng thái null để UI hiển thị empty state thay vì mock.
 * ==================================================================== */

const PLAN_PAGE_SIZE = 5;
const PAYMENT_PAGE_SIZE = 5;
const INVOICE_PAGE_SIZE = 5;

const emptyPlanForm = {
  name: '',
  price: '',
  storage: '',
  cycle: '',
  badgeColor: 'default' as BadgeColor,
  status: true,
  permissionsText: '',
};

export function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'storage' | 'payment' | 'invoice'>('dashboard');

  /* ------------------------------- Dashboard ------------------------------- */
  const [revenueTrend] = useState<LineChartPoint[] | null>(null);
  const [topPlans] = useState<{ name: string; sold: number }[] | null>(null);
  const [paymentMethodStats] = useState<{ method: PaymentMethod; count: number }[] | null>(null);
  const [payments] = useState<PaymentTransaction[] | null>(null);
  const [invoices] = useState<InvoiceRecord[] | null>(null);

  const totalRevenue = useMemo(() => (revenueTrend ?? []).reduce((sum, item) => sum + item.value, 0), [revenueTrend]);
  const totalTransactions = useMemo(() => (payments ?? []).length, [payments]);
  const successPayments = useMemo(() => (payments ?? []).filter((p) => p.status === 'success').length, [payments]);

  const dashboardStats = [
    { title: 'Tổng doanh thu', value: revenueTrend ? formatCurrency(totalRevenue) : '—', icon: Wallet, description: '6 tháng gần nhất' },
    { title: 'Tổng giao dịch', value: payments ? totalTransactions.toLocaleString('vi-VN') : '—', icon: ArrowLeftRight, description: 'Trong hệ thống' },
    { title: 'Tổng thanh toán', value: payments ? successPayments.toLocaleString('vi-VN') : '—', icon: CreditCard, description: 'Giao dịch thành công' },
    { title: 'Người dùng Pro', value: '—', icon: Crown, description: 'Đang dùng gói trả phí' },
  ];

  const totalPaymentCount = (paymentMethodStats ?? []).reduce((sum, item) => sum + item.count, 0);

  /* ------------------------------- Gói lưu trữ ------------------------------- */
  const [plans, setPlans] = useState<StoragePlan[] | null>(null);
  const [planSearch, setPlanSearch] = useState('');
  const [planPage, setPlanPage] = useState(1);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StoragePlan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);

  const filteredPlans = useMemo(
    () => (plans ?? []).filter((p) => normalizeSearchText(p.name).includes(normalizeSearchText(planSearch))),
    [plans, planSearch],
  );
  const totalPlanPages = Math.max(1, Math.ceil(filteredPlans.length / PLAN_PAGE_SIZE));
  const paginatedPlans = filteredPlans.slice((planPage - 1) * PLAN_PAGE_SIZE, planPage * PLAN_PAGE_SIZE);

  const openAddPlanDialog = () => {
    setEditingPlan(null);
    setPlanForm(emptyPlanForm);
    setPlanDialogOpen(true);
  };

  const openEditPlanDialog = (plan: StoragePlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: String(plan.price),
      storage: plan.storage,
      cycle: plan.cycle,
      badgeColor: plan.badgeColor,
      status: plan.status === 'active',
      permissionsText: plan.permissions.join('\n'),
    });
    setPlanDialogOpen(true);
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    const payload: StoragePlan = {
      id: editingPlan ? editingPlan.id : `PLAN-${Date.now()}`,
      name: planForm.name.trim(),
      price: Number(planForm.price) || 0,
      storage: planForm.storage.trim(),
      cycle: planForm.cycle.trim(),
      badgeColor: planForm.badgeColor,
      status: planForm.status ? 'active' : 'inactive',
      permissions: planForm.permissionsText.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    // TODO: gọi API POST /admin/finance/plans (thêm) hoặc PUT /admin/finance/plans/:id (sửa)
    if (editingPlan) {
      setPlans((prev) => (prev ?? []).map((p) => (p.id === editingPlan.id ? payload : p)));
    } else {
      setPlans((prev) => [payload, ...(prev ?? [])]);
    }
    setPlanDialogOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    // TODO: gọi API DELETE /admin/finance/plans/:id
    if (confirm('Bạn có chắc muốn xóa gói này?')) {
      setPlans((prev) => (prev ?? []).filter((p) => p.id !== id));
    }
  };

  /* ------------------------------- Thanh toán ------------------------------- */
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [viewingPayment, setViewingPayment] = useState<PaymentTransaction | null>(null);

  const filteredPayments = useMemo(() => {
    const search = normalizeSearchText(paymentSearch);
    return (payments ?? []).filter((p) => {
      const matchesSearch = !search || normalizeSearchText(p.code).includes(search) || normalizeSearchText(p.user).includes(search);
      const matchesMethod = !paymentMethodFilter || p.method === paymentMethodFilter;
      const matchesStatus = !paymentStatusFilter || p.status === paymentStatusFilter;
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, paymentSearch, paymentMethodFilter, paymentStatusFilter]);

  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / PAYMENT_PAGE_SIZE));
  const paginatedPayments = filteredPayments.slice((paymentPage - 1) * PAYMENT_PAGE_SIZE, paymentPage * PAYMENT_PAGE_SIZE);

  const paymentStatusBadge = (status: PaymentTransaction['status']) => {
    if (status === 'success') return <Badge>Thành công</Badge>;
    if (status === 'pending') return <Badge variant="secondary">Chờ xử lý</Badge>;
    return <Badge variant="destructive">Thất bại</Badge>;
  };

  /* ------------------------------- Hóa đơn ------------------------------- */
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [invoicePage, setInvoicePage] = useState(1);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);

  const filteredInvoices = useMemo(() => {
    const search = normalizeSearchText(invoiceSearch);
    return (invoices ?? []).filter((inv) => {
      const matchesSearch = !search || normalizeSearchText(inv.code).includes(search) || normalizeSearchText(inv.user).includes(search);
      const matchesStatus = !invoiceStatusFilter || inv.status === invoiceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  const totalInvoicePages = Math.max(1, Math.ceil(filteredInvoices.length / INVOICE_PAGE_SIZE));
  const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * INVOICE_PAGE_SIZE, invoicePage * INVOICE_PAGE_SIZE);

  const invoiceStatusBadge = (status: InvoiceRecord['status']) => {
    if (status === 'paid') return <Badge>Đã thanh toán</Badge>;
    if (status === 'unpaid') return <Badge variant="secondary">Chưa thanh toán</Badge>;
    return <Badge variant="destructive">Đã hủy</Badge>;
  };

  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
          <p className="text-muted-foreground mt-1">Tổng quan doanh thu, gói lưu trữ, thanh toán và hóa đơn.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="storage" className="gap-2">
            <HardDrive className="w-4 h-4" />
            Gói lưu trữ
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <Receipt className="w-4 h-4" />
            Hóa đơn
          </TabsTrigger>
        </TabsList>

        {/* ============================= DASHBOARD ============================= */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {dashboardStats.map((item) => (
              <Card key={item.title} className={glowCard}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl sm:text-3xl font-bold truncate">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
            <Card className={glowCard}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Biểu đồ doanh thu</CardTitle>
                    <CardDescription>Doanh thu 6 tháng gần nhất.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RevenueLineChart data={revenueTrend ?? []} />
              </CardContent>
            </Card>

            <Card className={glowCard}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Top gói bán chạy</CardTitle>
                    <CardDescription>Xếp theo số lượt đăng ký.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(topPlans ?? []).length > 0 ? (
                  (topPlans ?? []).map((plan, index) => (
                    <div key={plan.name} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-semibold">{plan.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">{plan.sold} lượt</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu gói bán chạy.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className={glowCard}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Thống kê thanh toán</CardTitle>
                  <CardDescription>Tỷ lệ giao dịch theo phương thức thanh toán.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(paymentMethodStats ?? []).length > 0 ? (
                (paymentMethodStats ?? []).map((item) => {
                  const ratio = totalPaymentCount ? Math.round((item.count / totalPaymentCount) * 100) : 0;
                  return (
                    <div key={item.method} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{item.method}</span>
                        <span className="text-muted-foreground">{item.count} giao dịch · {ratio}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu thống kê thanh toán.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================= GÓI LƯU TRỮ ============================= */}
        <TabsContent value="storage" className="space-y-6 mt-6">
          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-1 flex-1 max-w-sm">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tìm kiếm</label>
                  <input
                    type="text"
                    value={planSearch}
                    onChange={(e) => { setPlanSearch(e.target.value); setPlanPage(1); }}
                    placeholder="Tìm theo tên gói..."
                    aria-label="Tìm kiếm gói lưu trữ"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>
                <Button onClick={openAddPlanDialog} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  <Plus className="w-4 h-4" />
                  Thêm gói
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="py-4 px-6">Tên gói</TableHead>
                      <TableHead className="py-4 px-4">Giá</TableHead>
                      <TableHead className="py-4 px-4">Dung lượng</TableHead>
                      <TableHead className="py-4 px-4">Chu kỳ</TableHead>
                      <TableHead className="py-4 px-4">Trạng thái</TableHead>
                      <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(paginatedPlans.length > 0 ? paginatedPlans : []).map((plan) => (
                      <TableRow key={plan.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                        <TableCell className="py-4 px-6 font-medium">
                          <Badge variant={plan.badgeColor}>{plan.name}</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">{plan.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{plan.storage}</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{plan.cycle}</TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                            {plan.status === 'active' ? 'Đang hoạt động' : 'Ngừng bán'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditPlanDialog(plan)}
                              className="h-8 w-8 rounded-full p-0 text-amber-600 hover:text-amber-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedPlans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {plans === null ? 'Chưa có dữ liệu gói lưu trữ từ API.' : 'Không tìm thấy gói lưu trữ nào.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredPlans.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    {(planPage - 1) * PLAN_PAGE_SIZE + 1}–{Math.min(planPage * PLAN_PAGE_SIZE, filteredPlans.length)}/{filteredPlans.length} gói
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={planPage === 1} onClick={() => setPlanPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPlanPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === planPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPlanPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={planPage === totalPlanPages} onClick={() => setPlanPage((p) => Math.min(totalPlanPages, p + 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================= THANH TOÁN ============================= */}
        <TabsContent value="payment" className="space-y-6 mt-6">
          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tìm kiếm</label>
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => { setPaymentSearch(e.target.value); setPaymentPage(1); }}
                    placeholder="Tìm theo mã GD hoặc email..."
                    aria-label="Tìm kiếm giao dịch"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phương thức</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => { setPaymentMethodFilter(e.target.value); setPaymentPage(1); }}
                    aria-label="Lọc theo phương thức"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả phương thức</option>
                    <option value="VNPay">VNPay</option>
                    <option value="MoMo QR">MoMo QR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trạng thái</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentPage(1); }}
                    aria-label="Lọc theo trạng thái"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="success">Thành công</option>
                    <option value="failed">Thất bại</option>
                    <option value="pending">Chờ xử lý</option>
                  </select>
                </div>
              </div>
              {(paymentSearch || paymentMethodFilter || paymentStatusFilter) && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Tìm thấy {filteredPayments.length} giao dịch phù hợp.</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-sky-600 hover:text-sky-600"
                    onClick={() => { setPaymentSearch(''); setPaymentMethodFilter(''); setPaymentStatusFilter(''); setPaymentPage(1); }}
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
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="py-4 px-6">Mã giao dịch</TableHead>
                      <TableHead className="py-4 px-4">Người dùng</TableHead>
                      <TableHead className="py-4 px-4">Gói</TableHead>
                      <TableHead className="py-4 px-4">Phương thức</TableHead>
                      <TableHead className="py-4 px-4">Số tiền</TableHead>
                      <TableHead className="py-4 px-4">Ngày thanh toán</TableHead>
                      <TableHead className="py-4 px-4">Trạng thái</TableHead>
                      <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                        <TableCell className="py-4 px-6 font-medium">{txn.code}</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{txn.user}</TableCell>
                        <TableCell className="py-4 px-4">{txn.plan}</TableCell>
                        <TableCell className="py-4 px-4">{txn.method}</TableCell>
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          {formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{txn.paidAt}</TableCell>
                        <TableCell className="py-4 px-4">{paymentStatusBadge(txn.status)}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="icon" onClick={() => setViewingPayment(txn)} className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {payments === null ? 'Chưa có dữ liệu giao dịch từ API.' : 'Không tìm thấy giao dịch nào.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredPayments.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    {(paymentPage - 1) * PAYMENT_PAGE_SIZE + 1}–{Math.min(paymentPage * PAYMENT_PAGE_SIZE, filteredPayments.length)}/{filteredPayments.length} giao dịch
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={paymentPage === 1} onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === paymentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPaymentPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={paymentPage === totalPaymentPages} onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================= HÓA ĐƠN ============================= */}
        <TabsContent value="invoice" className="space-y-6 mt-6">
          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tìm kiếm</label>
                  <input
                    type="text"
                    value={invoiceSearch}
                    onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }}
                    placeholder="Tìm theo mã hóa đơn hoặc email..."
                    aria-label="Tìm kiếm hóa đơn"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trạng thái</label>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => { setInvoiceStatusFilter(e.target.value); setInvoicePage(1); }}
                    aria-label="Lọc theo trạng thái hóa đơn"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={glowCard}>
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="py-4 px-6">Mã hóa đơn</TableHead>
                      <TableHead className="py-4 px-4">Người dùng</TableHead>
                      <TableHead className="py-4 px-4">Gói</TableHead>
                      <TableHead className="py-4 px-4">Phương thức</TableHead>
                      <TableHead className="py-4 px-4">Số tiền</TableHead>
                      <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                      <TableHead className="py-4 px-4">Trạng thái</TableHead>
                      <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                        <TableCell className="py-4 px-6 font-medium">{inv.code}</TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{inv.user}</TableCell>
                        <TableCell className="py-4 px-4">{inv.plan}</TableCell>
                        <TableCell className="py-4 px-4">{inv.method}</TableCell>
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground">{inv.createdAt}</TableCell>
                        <TableCell className="py-4 px-4">{invoiceStatusBadge(inv.status)}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="icon" onClick={() => setViewingInvoice(inv)} className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {invoices === null ? 'Chưa có dữ liệu hóa đơn từ API.' : 'Không tìm thấy hóa đơn nào.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredInvoices.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    {(invoicePage - 1) * INVOICE_PAGE_SIZE + 1}–{Math.min(invoicePage * INVOICE_PAGE_SIZE, filteredInvoices.length)}/{filteredInvoices.length} hóa đơn
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={invoicePage === 1} onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalInvoicePages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === invoicePage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setInvoicePage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={invoicePage === totalInvoicePages} onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================== Dialog thêm/sửa gói lưu trữ ===================== */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-3xl p-6 border-border bg-background max-h-[85vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingPlan ? 'Sửa gói lưu trữ' : 'Thêm gói lưu trữ mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Điền thông tin gói lưu trữ / gói đăng ký bên dưới.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="planName" className="text-sm font-semibold text-foreground">Tên gói *</Label>
                <Input
                  id="planName"
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ví dụ: Premium 1 tháng"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="planPrice" className="text-sm font-semibold text-foreground">Giá (VNĐ) *</Label>
                <Input
                  id="planPrice"
                  type="number"
                  min={0}
                  value={planForm.price}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="planStorage" className="text-sm font-semibold text-foreground">Dung lượng *</Label>
                <Input
                  id="planStorage"
                  value={planForm.storage}
                  onChange={(e) => setPlanForm((f) => ({ ...f, storage: e.target.value }))}
                  placeholder="Ví dụ: 50 GB"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="planCycle" className="text-sm font-semibold text-foreground">Chu kỳ *</Label>
                <Input
                  id="planCycle"
                  value={planForm.cycle}
                  onChange={(e) => setPlanForm((f) => ({ ...f, cycle: e.target.value }))}
                  placeholder="Ví dụ: 30 ngày"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planBadgeColor" className="text-sm font-semibold text-foreground">Màu badge</Label>
              <select
                id="planBadgeColor"
                value={planForm.badgeColor}
                onChange={(e) => setPlanForm((f) => ({ ...f, badgeColor: e.target.value as BadgeColor }))}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm"
              >
                <option value="default">Mặc định (primary)</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="destructive">Destructive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planPermissions" className="text-sm font-semibold text-foreground">Danh sách quyền</Label>
              <Textarea
                id="planPermissions"
                value={planForm.permissionsText}
                onChange={(e) => setPlanForm((f) => ({ ...f, permissionsText: e.target.value }))}
                placeholder={'Mỗi quyền 1 dòng, ví dụ:\nTruy cập đầy đủ tài liệu\nChat AI không giới hạn'}
                className="min-h-[90px] rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Trạng thái hoạt động</p>
                <p className="text-xs text-muted-foreground">Bật để hiển thị gói cho người dùng đăng ký.</p>
              </div>
              <Switch checked={planForm.status} onCheckedChange={(checked) => setPlanForm((f) => ({ ...f, status: checked }))} />
            </div>

            {/* Preview Card — giống phong cách Card thông tin ở trang User */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Xem trước</Label>
              <Card className={glowCard}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={planForm.badgeColor}>{planForm.name || 'Tên gói'}</Badge>
                    <Badge variant={planForm.status ? 'default' : 'secondary'}>
                      {planForm.status ? 'Đang hoạt động' : 'Ngừng bán'}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold">
                    {(Number(planForm.price) || 0).toLocaleString('vi-VN')}đ
                    <span className="text-sm font-normal text-muted-foreground"> / {planForm.cycle || 'chu kỳ'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Dung lượng: {planForm.storage || '—'}</p>
                  {planForm.permissionsText.trim() && (
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                      {planForm.permissionsText.split('\n').filter(Boolean).map((perm) => (
                        <li key={perm}>{perm}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setPlanDialogOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== Dialog xem nhanh giao dịch thanh toán ===================== */}
      <Dialog open={!!viewingPayment} onOpenChange={(open) => !open && setViewingPayment(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-foreground">Chi tiết giao dịch</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{viewingPayment?.code}</DialogDescription>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Người dùng</span><span className="font-medium">{viewingPayment.user}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Gói</span><span className="font-medium">{viewingPayment.plan}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phương thức</span><span className="font-medium">{viewingPayment.method}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Số tiền</span><span className="font-medium">{viewingPayment.amount.toLocaleString('vi-VN')}đ</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thời gian</span><span className="font-medium">{viewingPayment.paidAt}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Trạng thái</span>{paymentStatusBadge(viewingPayment.status)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== Drawer xem chi tiết hóa đơn (bên phải) ===================== */}
      <Sheet open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Chi tiết hóa đơn</SheetTitle>
            <SheetDescription>{viewingInvoice?.code}</SheetDescription>
          </SheetHeader>
          {viewingInvoice && (
            <div className="px-4 pb-4 space-y-4">
              <Card className={glowCard}>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Người dùng</span><span className="font-medium">{viewingInvoice.user}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gói</span><span className="font-medium">{viewingInvoice.plan}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phương thức</span><span className="font-medium">{viewingInvoice.method}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Số tiền</span><span className="font-medium">{viewingInvoice.amount.toLocaleString('vi-VN')}đ</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ngày tạo</span><span className="font-medium">{viewingInvoice.createdAt}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Trạng thái</span>{invoiceStatusBadge(viewingInvoice.status)}</div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">
                TODO: gọi API GET /admin/finance/invoices/:id để lấy chi tiết hóa đơn thật.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}