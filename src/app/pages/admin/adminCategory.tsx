import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { apiRequest } from '../../services/api';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const data = await apiRequest('/categories');
      setCategories(data.categories || data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách danh mục.');
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
    if (confirm('Bạn có chắc muốn xóa danh mục này? Các tài liệu thuộc danh mục sẽ chuyển thành không có danh mục.')) {
      try {
        await apiRequest(`/categories/${catId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa danh mục thành công!');
        setCategories((prev) => prev.filter((c) => c.id !== catId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa danh mục.');
      }
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const paginatedCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Title bar */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              Quản lý danh mục tài liệu
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Danh sách các danh mục phân loại tài liệu (Kỹ thuật phần mềm, Trí tuệ nhân tạo, v.v.).</p>
          </div>
          <Button onClick={openAddDialog} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm danh mục..."
              className="pl-10 rounded-xl"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang tải danh sách danh mục...</p>
        </div>
      ) : (
        <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-4 px-6">Tên danh mục</TableHead>
                  <TableHead className="py-4 px-4">Mô tả</TableHead>
                  <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                  <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Không tìm thấy danh mục nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                      <TableCell className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {cat.name}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-sm max-w-sm truncate">
                        {cat.description || 'Chưa có mô tả'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(cat)}
                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id)}
                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {filteredCategories.length > 0 && (
        <div className="flex items-center justify-between px-1">
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
