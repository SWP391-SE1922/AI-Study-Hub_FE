import { useMemo } from 'react';
import {
  BarChart3,
  CreditCard,
  DollarSign,
  ListChecks,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';

const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ đ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu đ`;
  }
  return `${value.toLocaleString('vi-VN')}đ`;
}

const stats = [
  {
    title: 'Doanh thu tháng',
    value: 125_400_000,
    description: 'Tăng 14% so với tháng trước',
    icon: DollarSign,
    badge: 'Tốt',
    isCurrency: true,
  },
  {
    title: 'Số giao dịch',
    value: 1_248,
    description: 'Giao dịch thành công trong tháng',
    icon: CreditCard,
    badge: 'Ổn định',
  },
  {
    title: 'Gói đăng ký',
    value: 324,
    description: 'Người dùng đang dùng gói trả phí',
    icon: ListChecks,
    badge: 'Phát triển',
  },
  {
    title: 'Doanh thu trung bình',
    value: 1_020_000,
    description: 'Doanh thu mỗi giao dịch',
    icon: ArrowUpRight,
    badge: 'Ổn định',
    isCurrency: true,
  },
];

const transactions = [
  {
    id: 'TXN-001',
    user: 'Nguyễn Văn A',
    plan: 'Gói Premium',
    amount: 1_200_000,
    date: '02/07/2026',
  },
  {
    id: 'TXN-002',
    user: 'Trần Thị B',
    plan: 'Gói Standard',
    amount: 420_000,
    date: '01/07/2026',
  },
  {
    id: 'TXN-003',
    user: 'Lê Văn C',
    plan: 'Gói Premium',
    amount: 2_500_000_000,
    date: '30/06/2026',
  },
  {
    id: 'TXN-004',
    user: 'Phạm Thị D',
    plan: 'Gói Basic',
    amount: 15_000_000_000,
    date: '28/06/2026',
  },
];

// Doanh thu 7 ngày gần nhất — thay bằng dữ liệu thật khi có API
const revenueTrend = [
  { day: '03/07', revenue: 12_500_000 },
  { day: '04/07', revenue: 15_800_000 },
  { day: '05/07', revenue: 11_200_000 },
  { day: '06/07', revenue: 19_400_000 },
  { day: '07/07', revenue: 17_100_000 },
  { day: '08/07', revenue: 21_600_000 },
  { day: '09/07', revenue: 24_300_000 },
];

export function AdminFinancePage() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
            <p className="text-muted-foreground mt-1">Tổng quan doanh thu, giao dịch và gói đăng ký.</p>
          </div>
        </div>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Xem báo cáo đầy đủ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.title} className={glowCard}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
                  <item.icon className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className="min-w-0">
                  <p
                    className="text-xl sm:text-2xl md:text-3xl font-bold truncate"
                    title={item.isCurrency ? `${(item.value as number).toLocaleString('vi-VN')}đ` : typeof item.value === 'number' ? item.value.toLocaleString('vi-VN') : item.value}
                  >
                    {item.isCurrency ? formatCompactCurrency(item.value as number) : typeof item.value === 'number' ? item.value.toLocaleString('vi-VN') : item.value}
                  </p>
                </div>
                <Badge variant="secondary">{item.badge}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={glowCard}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Giao dịch gần đây</CardTitle>
                <CardDescription>Danh sách giao dịch/thanh toán mới nhất.</CardDescription>
              </div>
            </div>
            <Button size="sm" className="gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700">
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">Mã giao dịch</TableHead>
                  <TableHead className="py-3 px-4">Người dùng</TableHead>
                  <TableHead className="py-3 px-4">Gói</TableHead>
                  <TableHead className="py-3 px-4">Số tiền</TableHead>
                  <TableHead className="py-3 px-4">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/10">
                    <TableCell className="py-3 px-4 font-medium">{transaction.id}</TableCell>
                    <TableCell className="py-3 px-4">{transaction.user}</TableCell>
                    <TableCell className="py-3 px-4">{transaction.plan}</TableCell>
                    <TableCell className="py-3 px-4 max-w-[120px] truncate">
                      <span title={`${transaction.amount.toLocaleString('vi-VN')}đ`}>
                        {formatCompactCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
        {/* Thay cho khối "Tình trạng thanh toán" cũ: biểu đồ xu hướng doanh thu 7 ngày gần nhất */}
        <Card className={glowCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Xu hướng doanh thu</CardTitle>
                <CardDescription>Doanh thu 7 ngày gần nhất.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-20" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v) => formatCompactCurrency(v)}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCompactCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-slate-100 dark:bg-slate-800 p-4 text-sm text-muted-foreground">
              Dữ liệu hiện là mock, TODO: kết nối API tài chính thật để hiển thị doanh thu và giao dịch thực tế.
            </div>
          </CardContent>
        </Card>

        <Card className={glowCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Gói đăng ký nổi bật</CardTitle>
                <CardDescription>Những gói giá trị cao đang được sử dụng.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Gói Premium</p>
                  <p className="text-xs text-muted-foreground">Đang được 180 người dùng sử dụng</p>
                </div>
                <Badge>Top</Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Gói Standard</p>
                  <p className="text-xs text-muted-foreground">Đang được 94 người dùng sử dụng</p>
                </div>
                <Badge variant="secondary">Ổn định</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}