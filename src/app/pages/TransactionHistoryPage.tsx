import { useEffect, useMemo, useState } from 'react';
import { Receipt, RefreshCw, CreditCard, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getMyTransactions } from '../services/api';

type TxnStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | string;

type TransactionItem = {
  id: string;
  amount: number;
  status: TxnStatus;
  paymentMethod: string;
  txnRef?: string | null;
  description?: string | null;
  createdAt: string;
  plan?: { id: string; code: string; name: string } | null;
  invoice?: { id: string; invoiceCode: string; status: string } | null;
};

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusBadge(status: TxnStatus) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'SUCCESS') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Thành công</Badge>;
  if (normalized === 'PENDING') return <Badge variant="secondary">Đang chờ</Badge>;
  return <Badge variant="destructive">Thất bại</Badge>;
}

export function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getMyTransactions();
      const list = Array.isArray(data) ? data : data?.transactions || [];
      setTransactions(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const stats = useMemo(() => {
    const success = transactions.filter((t) => String(t.status).toUpperCase() === 'SUCCESS');
    return {
      total: transactions.length,
      success: success.length,
      spent: success.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lịch sử giao dịch</h1>
            <p className="text-sm text-muted-foreground">Các lần thanh toán gói đăng ký của bạn</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadTransactions} disabled={loading} className="rounded-xl gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Tổng giao dịch
            </CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
              <CreditCard className="w-3.5 h-3.5" /> Thành công
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{stats.success}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Tổng đã thanh toán</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats.spent)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Chi tiết giao dịch</CardTitle>
          <CardDescription>
            {loading ? 'Đang tải...' : `${transactions.length} giao dịch`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Đang tải lịch sử giao dịch...</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Bạn chưa có giao dịch nào.</p>
              <Button variant="outline" className="rounded-full mt-2" onClick={() => (window.location.href = '/#pricing')}>
                Xem các gói đăng ký
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã GD / Hóa đơn</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm truncate max-w-[180px]">
                            {txn.txnRef || txn.id.slice(0, 8).toUpperCase()}
                          </p>
                          {txn.invoice?.invoiceCode && (
                            <p className="text-[11px] text-muted-foreground">{txn.invoice.invoiceCode}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {txn.plan?.name || txn.description || '—'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{txn.paymentMethod || '—'}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(txn.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(txn.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">{statusBadge(txn.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
