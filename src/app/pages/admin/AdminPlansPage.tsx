import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
  restorePlan,
  type SubscriptionPlan,
} from '../../services/api';

const glowCard = 'bg-white rounded-3xl p-2 border border-[#121214]/5 shadow-sm transition-all duration-300 hover:shadow-md';

const PAGE_SIZE = 10;

type BadgeColor = 'default' | 'secondary' | 'outline' | 'destructive';

interface PlanRow {
  id: string;
  code: string;
  name: string;
  price: number;
  storage: string;
  storageLimit: number;
  aiQuestionsLimit: number;
  aiModel: string;
  durationDays: number;
  cycle: string;
  badgeColor: BadgeColor;
  status: 'active' | 'inactive' | 'deleted';
  deletedAt?: string | null;
  permissions: string[];
}

function formatCurrency(value: number): string {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function bytesToStorageLabel(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 900) return 'Vô hạn';
  return `${Math.round(gb * 10) / 10} GB`;
}

function storageLabelToBytes(label: string) {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized.includes('vô hạn') || normalized.includes('unlimited')) {
    return 999 * 1024 * 1024 * 1024;
  }
  const match = normalized.match(/([\d.]+)/);
  const value = match ? Number(match[1]) : 5;
  if (normalized.includes('tb')) return value * 1024 * 1024 * 1024 * 1024;
  return value * 1024 * 1024 * 1024;
}

function mapApiPlanToUi(plan: SubscriptionPlan): PlanRow {
  const status: PlanRow['status'] =
    plan.deletedAt || plan.isDeleted || plan.status === 'deleted'
      ? 'deleted'
      : plan.isActive
        ? 'active'
        : 'inactive';

  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    price: Number(plan.price) || 0,
    storage: bytesToStorageLabel(Number(plan.storageLimit) || 0),
    storageLimit: Number(plan.storageLimit) || 0,
    aiQuestionsLimit: Number(plan.aiQuestionsLimit) || 0,
    aiModel: plan.aiModel || 'llama3',
    durationDays: Number(plan.durationDays) || 0,
    cycle: plan.durationDays > 0 ? `${plan.durationDays} ngày` : 'Không giới hạn',
    badgeColor: status === 'deleted' ? 'destructive' : status === 'active' ? 'default' : 'secondary',
    status,
    deletedAt: plan.deletedAt || null,
    permissions: Array.isArray(plan.features) ? plan.features : [],
  };
}

const emptyPlanForm = {
  code: '',
  name: '',
  price: '',
  storage: '',
  cycle: '',
  aiQuestionsLimit: '',
  aiModel: 'llama3',
  badgeColor: 'default' as BadgeColor,
  status: true,
  permissionsText: '',
};

export function AdminPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [planSearch, setPlanSearch] = useState('');
  const [planPage, setPlanPage] = useState(1);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [savingPlan, setSavingPlan] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const apiPlans = await getAllPlansAdmin();
      setPlans(apiPlans.map(mapApiPlanToUi));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được danh sách gói');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = useMemo(
    () =>
      plans.filter(
        (p) =>
          normalizeSearchText(p.name).includes(normalizeSearchText(planSearch)) ||
          normalizeSearchText(p.code).includes(normalizeSearchText(planSearch))
      ),
    [plans, planSearch]
  );

  const totalPlanPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE));
  const paginatedPlans = filteredPlans.slice((planPage - 1) * PAGE_SIZE, planPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.status === 'active');
    const deleted = plans.filter((p) => p.status === 'deleted');
    const inactive = plans.filter((p) => p.status === 'inactive');
    return {
      total: plans.length,
      active: active.length,
      inactive: inactive.length,
      deleted: deleted.length,
      paid: active.filter((p) => p.price > 0).length,
    };
  }, [plans]);

  const statusBadge = (status: PlanRow['status']) => {
    if (status === 'active') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Đang bán</Badge>;
    if (status === 'deleted') return <Badge variant="destructive">Đã xóa</Badge>;
    return <Badge variant="secondary">Ngừng bán</Badge>;
  };

  const openAddPlanDialog = () => {
    setEditingPlan(null);
    setPlanForm(emptyPlanForm);
    setPlanDialogOpen(true);
  };

  const openEditPlanDialog = (plan: PlanRow) => {
    setEditingPlan(plan);
    setPlanForm({
      code: plan.code,
      name: plan.name,
      price: String(plan.price),
      storage: plan.storage,
      cycle: plan.cycle,
      aiQuestionsLimit: String(plan.aiQuestionsLimit),
      aiModel: plan.aiModel,
      badgeColor: plan.badgeColor,
      status: plan.status === 'active',
      permissionsText: plan.permissions.join('\n'),
    });
    setPlanDialogOpen(true);
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    const durationMatch = planForm.cycle.match(/(\d+)/);
    const durationDays = durationMatch
      ? Number(durationMatch[1])
      : planForm.code.toUpperCase() === 'BASIC'
        ? 0
        : 30;

    const payload = {
      code: (planForm.code || planForm.name).trim().toUpperCase().replace(/\s+/g, '_'),
      name: planForm.name.trim(),
      price: Number(planForm.price) || 0,
      storageLimit: storageLabelToBytes(planForm.storage),
      aiQuestionsLimit: Number(planForm.aiQuestionsLimit) || 20,
      aiModel: planForm.aiModel || 'llama3',
      durationDays,
      features: planForm.permissionsText.split('\n').map((s) => s.trim()).filter(Boolean),
      isActive: planForm.status,
    };

    try {
      setSavingPlan(true);
      if (editingPlan) {
        const updated = await updatePlan(editingPlan.id, payload);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? mapApiPlanToUi(updated) : p)));
        toast.success('Cập nhật gói thành công');
      } else {
        const created = await createPlan(payload);
        setPlans((prev) => [mapApiPlanToUi(created), ...prev]);
        toast.success('Thêm gói thành công');
      }
      setPlanDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu gói thất bại');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Xóa mềm gói này? Gói sẽ không hiện trên landing nhưng admin vẫn xem được.')) return;
    try {
      const updated = await deletePlan(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? mapApiPlanToUi(updated) : p)));
      toast.success('Đã xóa mềm gói đăng ký');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa gói thất bại');
    }
  };

  const handleRestorePlan = async (id: string) => {
    try {
      const updated = await restorePlan(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? mapApiPlanToUi(updated) : p)));
      toast.success('Đã khôi phục gói đăng ký');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Khôi phục gói thất bại');
    }
  };

  return (
    <div className="space-y-6 text-[#121214] selection:bg-[#121214] selection:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#121214] rounded-xl flex items-center justify-center shadow-sm">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý Gói đăng ký</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? 'Đang tải...' : 'Thêm / sửa / xóa gói — ảnh hưởng landing & thanh toán VNPay'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" onClick={loadPlans} disabled={loading} className="rounded-xl gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={openAddPlanDialog} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white gap-1.5">
            <Plus className="w-4 h-4" />
            Thêm gói
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={glowCard}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Tổng gói</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={glowCard}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Đang bán</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-emerald-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={glowCard}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Ngừng bán</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={glowCard}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Đã xóa (mềm)</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-rose-500">{stats.deleted}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className={glowCard}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Danh sách gói</CardTitle>
              <CardDescription>
                {loading ? 'Đang tải...' : `${filteredPlans.length} gói`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={planSearch}
                onChange={(e) => {
                  setPlanSearch(e.target.value);
                  setPlanPage(1);
                }}
                placeholder="Tìm theo mã / tên gói..."
                className="pl-9 rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              {loading ? 'Đang tải danh sách gói...' : 'Không tìm thấy gói nào.'}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Tên gói</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead>AI limit</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Chu kỳ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPlans.map((plan) => (
                      <TableRow key={plan.id} className={plan.status === 'deleted' ? 'opacity-70 bg-rose-500/5' : undefined}>
                        <TableCell>
                          <Badge variant="outline">{plan.code}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">{plan.name}</TableCell>
                        <TableCell className="font-bold tabular-nums">{formatCurrency(plan.price)}</TableCell>
                        <TableCell className="text-sm">{plan.storage}</TableCell>
                        <TableCell className="text-sm">
                          {plan.aiQuestionsLimit >= 999999 ? '∞' : plan.aiQuestionsLimit}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{plan.aiModel}</TableCell>
                        <TableCell className="text-sm">{plan.cycle}</TableCell>
                        <TableCell>{statusBadge(plan.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {plan.status === 'deleted' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Khôi phục"
                                onClick={() => handleRestorePlan(plan.id)}
                              >
                                <RotateCcw className="w-4 h-4 text-emerald-600" />
                              </Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEditPlanDialog(plan)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={planPage <= 1}
                  onClick={() => setPlanPage((p) => p - 1)}
                  className="rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Trang {planPage}/{totalPlanPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={planPage >= totalPlanPages}
                  onClick={() => setPlanPage((p) => p + 1)}
                  className="rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Sửa gói đăng ký' : 'Thêm gói đăng ký'}</DialogTitle>
            <DialogDescription>Giá tính bằng VNĐ. Mã gói dùng để map quyền AI / storage.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mã gói *</Label>
                <Input
                  value={planForm.code}
                  onChange={(e) => setPlanForm((f) => ({ ...f, code: e.target.value }))}
                  disabled={Boolean(editingPlan)}
                  required
                  className="rounded-xl uppercase"
                  placeholder="PREMIUM"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tên gói *</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giá (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={planForm.price}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Dung lượng</Label>
                <Input
                  value={planForm.storage}
                  onChange={(e) => setPlanForm((f) => ({ ...f, storage: e.target.value }))}
                  placeholder="10 GB"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Chu kỳ</Label>
                <Input
                  value={planForm.cycle}
                  onChange={(e) => setPlanForm((f) => ({ ...f, cycle: e.target.value }))}
                  placeholder="30 ngày"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giới hạn AI</Label>
                <Input
                  type="number"
                  value={planForm.aiQuestionsLimit}
                  onChange={(e) => setPlanForm((f) => ({ ...f, aiQuestionsLimit: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Model AI</Label>
                <select
                  value={planForm.aiModel}
                  onChange={(e) => setPlanForm((f) => ({ ...f, aiModel: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="llama3">llama3</option>
                  <option value="mistral">mistral</option>
                  <option value="qwen2.5">qwen2.5</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tính năng (mỗi dòng 1 mục)</Label>
              <Textarea
                value={planForm.permissionsText}
                onChange={(e) => setPlanForm((f) => ({ ...f, permissionsText: e.target.value }))}
                className="rounded-xl min-h-[90px]"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold">Đang bán</p>
                <p className="text-xs text-muted-foreground">Hiển thị trên landing page</p>
              </div>
              <Switch checked={planForm.status} onCheckedChange={(v) => setPlanForm((f) => ({ ...f, status: v }))} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setPlanDialogOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={savingPlan} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white">
                {savingPlan ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
