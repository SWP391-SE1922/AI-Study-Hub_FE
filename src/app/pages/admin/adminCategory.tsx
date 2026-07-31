import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { apiRequest, restoreCategory } from '../../services/api';
import { toast } from 'sonner';

const glowCard = 'bg-white rounded-3xl p-2 border border-[#121214]/5 shadow-sm transition-all duration-300 hover:shadow-md';

interface Category {
  id: string;
  name: string;
  description: string | null;
  deletedAt?: string | null;
  createdAt: string;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/categories');
      setCategories(data.categories || data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddDialog = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    setDialogLoading(true);
    try {
      const payload = { name, description };
      if (editingCategory) {
        await apiRequest(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Tạo danh mục mới thành công!');
      }
      setIsOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu danh mục.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (confirm('Xóa mềm danh mục này? Admin vẫn xem được và có thể khôi phục.')) {
      try {
        await apiRequest(`/categories/${catId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa mềm danh mục');
        fetchCategories();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa danh mục.');
      }
    }
  };

  const handleRestore = async (catId: string) => {
    try {
      await restoreCategory(catId);
      toast.success('Đã khôi phục danh mục');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi khôi phục danh mục.');
    }
  };

  const filteredCategories = categories.filter((c) =>
    normalizeSearchText(c.name).includes(normalizeSearchText(search)),
  );
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const paginatedCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div className="space-y-8 text-[#121214] selection:bg-[#121214] selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#121214] rounded-xl flex items-center justify-center shadow-sm">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý danh mục tài liệu</h1>
            <p className="text-muted-foreground mt-1">Danh sách các danh mục (Kinh tế, Lập trình v.v.).</p>
          </div>
        </div>
        <Button onClick={openAddDialog} size="sm" className="gap-2 bg-[#121214] hover:bg-stone-800 text-white rounded-xl">
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card className={glowCard}>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tìm kiếm</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm danh mục..."
              aria-label="Tìm kiếm danh mục"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={glowCard}>
        <CardContent className="p-4 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-4 px-6">Tên danh mục</TableHead>
                  <TableHead className="py-4 px-4">Mô tả</TableHead>
                  <TableHead className="py-4 px-4">Trạng thái</TableHead>
                  <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                  <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Đang tải danh sách danh mục...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Không tìm thấy danh mục nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((cat) => (
                    <TableRow key={cat.id} className={`hover:bg-muted/10 border-b border-border last:border-0 transition-colors ${cat.deletedAt ? 'opacity-60' : ''}`}>
                      <TableCell className="py-4 px-6 font-semibold text-[#121214] text-sm">
                        {cat.name}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-sm max-w-sm truncate">
                        {cat.description || 'Chưa có mô tả'}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {cat.deletedAt ? (
                          <Badge variant="destructive">Đã xóa</Badge>
                        ) : (
                          <Badge variant="secondary">Đang dùng</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cat.deletedAt ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestore(cat.id)}
                              className="h-8 w-8 rounded-full p-0 text-emerald-600 hover:text-emerald-700"
                              title="Khôi phục"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(cat)}
                                className="h-8 w-8 rounded-full p-0 text-amber-600 hover:text-amber-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(cat.id)}
                                className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCategories.length)}/{filteredCategories.length} danh mục
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm" className="h-8 w-8 p-0"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm" className="h-8 w-8 p-0 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline" size="sm" className="h-8 w-8 p-0"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Điền các thông tin danh mục phân loại tài liệu dưới đây.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-sm font-semibold text-foreground">Tên danh mục *</Label>
              <Input
                id="catName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Công nghệ phần mềm"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-sm font-semibold text-foreground">Mô tả danh mục</Label>
              <Textarea
                id="catDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về danh mục này..."
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-slate-200">
                Hủy
              </Button>
              <Button type="submit" disabled={dialogLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {dialogLoading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default CategoryPage;
