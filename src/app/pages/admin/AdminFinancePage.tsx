import { useMemo } from 'react';
import {
  BarChart3,
  CreditCard,
  DollarSign,
  ListChecks,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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

const stats = [
  {
    title: 'Doanh thu tháng',
    value: '125.400.000đ',
    description: 'Tăng 14% so với tháng trước',
    icon: DollarSign,
    badge: 'Tốt',
  },
  {
    title: 'Số giao dịch',
    value: '1.248',
    description: 'Giao dịch thành công trong tháng',
    icon: CreditCard,
    badge: 'Ổn định',
  },
  {
    title: 'Gói đăng ký',
    value: '324',
    description: 'Người dùng đang dùng gói trả phí',
    icon: ListChecks,
    badge: 'Phát triển',
  },
  {
    title: 'Doanh thu trung bình',
    value: '1.020.000đ',
    description: 'Doanh thu mỗi giao dịch',
    icon: ArrowUpRight,
    badge: 'Ổn định',
  },
];

const transactions = [
  {
    id: 'TXN-001',
    user: 'Nguyễn Văn A',
    plan: 'Gói Premium',
    amount: '1.200.000đ',
    status: 'Thành công',
    date: '02/07/2026',
  },
  {
    id: 'TXN-002',
    user: 'Trần Thị B',
    plan: 'Gói Standard',
    amount: '420.000đ',
    status: 'Thất bại',
    date: '01/07/2026',
  },
  {
    id: 'TXN-003',
    user: 'Lê Văn C',
    plan: 'Gói Premium',
    amount: '1.200.000đ',
    status: 'Thành công',
    date: '30/06/2026',
  },
  {
    id: 'TXN-004',
    user: 'Phạm Thị D',
    plan: 'Gói Basic',
    amount: '180.000đ',
    status: 'Chờ xử lý',
    date: '28/06/2026',
  },
];

export function AdminFinancePage() {
  const transactionSummary = useMemo(
    () => transactions.reduce(
      (acc, item) => {
        if (item.status === 'Thành công') acc.success += 1;
        if (item.status === 'Thất bại') acc.failed += 1;
        if (item.status === 'Chờ xử lý') acc.pending += 1;
        return acc;
      },
      { success: 0, failed: 0, pending: 0 },
    ),
    [],
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
            <p className="text-muted-foreground mt-1">Tổng quan doanh thu, giao dịch và gói đăng ký.</p>
          </div>
        </div>
        <Button size="sm" className="gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl">
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold">{item.value}</p>
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
                  <TableHead className="py-3 px-4">Trạng thái</TableHead>
                  <TableHead className="py-3 px-4">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/10">
                    <TableCell className="py-3 px-4 font-medium">{transaction.id}</TableCell>
                    <TableCell className="py-3 px-4">{transaction.user}</TableCell>
                    <TableCell className="py-3 px-4">{transaction.plan}</TableCell>
                    <TableCell className="py-3 px-4">{transaction.amount}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant={transaction.status === 'Thành công' ? 'default' : transaction.status === 'Chờ xử lý' ? 'secondary' : 'destructive'}>
                        {transaction.status}
                      </Badge>
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
        <Card className={glowCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Tình trạng thanh toán</CardTitle>
                <CardDescription>Phân bổ trạng thái giao dịch trong tháng.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Thành công</p>
                <p className="text-2xl font-bold text-emerald-600">{transactionSummary.success}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Thất bại</p>
                <p className="text-2xl font-bold text-rose-600">{transactionSummary.failed}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                <p className="text-2xl font-bold text-amber-600">{transactionSummary.pending}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-slate-100 dark:bg-slate-800 p-4 text-sm text-muted-foreground">
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
