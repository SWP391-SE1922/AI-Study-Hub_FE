import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, AlertCircle, Calendar } from 'lucide-react';
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

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  createdAt: string;
}

export function SubjectPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const fetchSubjects = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchQuery ? `/subjects?search=${encodeURIComponent(searchQuery)}` : '/subjects';
      const data = await apiRequest(endpoint);
      setSubjects(data.subjects || data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách môn học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(search);
  }, [search]);

  const openAddDialog = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDescription('');
    setIsOpen(true);
  };

  const openEditDialog = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setDescription(sub.description || '');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên môn học!');
      return;
    }

    setDialogLoading(true);
    try {
      const payload = { name, code: code || null, description };
      if (editingSubject) {
        await apiRequest(`/subjects/${editingSubject.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Cập nhật môn học thành công!');
      } else {
        await apiRequest('/subjects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Tạo môn học mới thành công!');
      }
      setIsOpen(false);
      fetchSubjects(search);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu môn học.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (subId: string) => {
    if (confirm('Bạn có chắc muốn xóa môn học này? Tất cả tài liệu tham chiếu đến môn học sẽ mất liên kết môn học.')) {
      try {
        await apiRequest(`/subjects/${subId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa môn học thành công!');
        setSubjects((prev) => prev.filter((s) => s.id !== subId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa môn học.');
      }
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Title bar */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Quản lý môn học
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Danh sách các môn học chính thức (Toán cao cấp, Cấu trúc dữ liệu, Lập trình Java, v.v.).</p>
          </div>
          <Button onClick={openAddDialog} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Plus className="w-4 h-4" />
            Thêm môn học
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm môn học theo tên hoặc mã môn..."
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
          <p className="text-sm text-slate-500">Đang tải danh sách môn học...</p>
        </div>
      ) : (
        <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-4 px-6 w-[150px]">Mã môn học</TableHead>
                  <TableHead className="py-4 px-4">Tên môn học</TableHead>
                  <TableHead className="py-4 px-4">Mô tả</TableHead>
                  <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                  <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Không tìm thấy môn học nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                      <TableCell className="py-4 px-6 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {sub.code || 'CHƯA CÓ'}
                      </TableCell>
                      <TableCell className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {sub.name}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-sm max-w-sm truncate">
                        {sub.description || 'Chưa có mô tả'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(sub)}
                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sub.id)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Điền mã số môn học và tên môn học dưới đây.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subCode" className="text-sm font-semibold text-foreground">Mã môn học (Code)</Label>
              <Input
                id="subCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ví dụ: MAD101, CSD201..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subName" className="text-sm font-semibold text-foreground">Tên môn học *</Label>
              <Input
                id="subName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Toán rời rạc, Cấu trúc dữ liệu..."
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subDesc" className="text-sm font-semibold text-foreground">Mô tả môn học</Label>
              <Textarea
                id="subDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung học của môn này..."
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
export default SubjectPage;
