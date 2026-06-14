import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardContent } from '../../components/ui/card';
import { Search, UserMinus, Shield, AlertCircle, Eye, Download, FileText, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { apiRequest } from '../../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Label } from '../../components/ui/label';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'GUEST' | 'USER' | 'ADMIN';
  isVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  storageLimit?: number;
  usedStorage?: number;
}

export function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States cho modal xem tài liệu
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [userDocsLoading, setUserDocsLoading] = useState(false);

  // States cho modal thêm người dùng
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'GUEST' | 'USER' | 'ADMIN'>('USER');
  const [createLoading, setCreateLoading] = useState(false);

  // States cho modal sửa thông tin người dùng
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'GUEST' | 'USER' | 'ADMIN'>('USER');
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editStorageLimitMB, setEditStorageLimitMB] = useState(100);
  const [editLoading, setEditLoading] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName || !createEmail || !createPassword) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setCreateLoading(true);
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: createFullName,
          email: createEmail,
          password: createPassword,
          role: createRole,
        }),
      });
      toast.success('Thêm người dùng mới thành công!');
      setIsCreateModalOpen(false);
      setCreateFullName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('USER');
      fetchUsers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo tài khoản người dùng.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditPassword('');
    setEditRole(user.role);
    setEditIsVerified(user.isVerified);
    setEditStorageLimitMB(Math.round((user.storageLimit || 104857600) / (1024 * 1024)));
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName || !editEmail) {
      toast.error('Vui lòng nhập họ tên và email.');
      return;
    }
    setEditLoading(true);
    try {
      await apiRequest(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editFullName,
          email: editEmail,
          role: editRole,
          isVerified: editIsVerified,
          storageLimit: editStorageLimitMB * 1024 * 1024,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      toast.success('Cập nhật thông tin người dùng thành công!');
      setIsEditModalOpen(false);
      fetchUsers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật tài khoản người dùng.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewUserDocs = async (user: User) => {
    setSelectedUser(user);
    setIsDocsModalOpen(true);
    setUserDocsLoading(true);
    try {
      const data = await apiRequest(`/documents?uploadedBy=${user.id}`);
      setUserDocs(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách tài liệu.');
    } finally {
      setUserDocsLoading(false);
    }
  };

  const handleDownloadDoc = async (docId: string) => {
    try {
      const data = await apiRequest(`/documents/${docId}/download`);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        toast.error('Không tìm thấy link tải xuống.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải file.');
    }
  };

  const fetchUsers = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
      const data = await apiRequest(endpoint);
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchQuery);
  }, [searchQuery]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      toast.success('Cập nhật quyền thành công!');
      // Update state local
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật vai trò người dùng.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng này khỏi hệ thống?')) {
      try {
        await apiRequest(`/users/${userId}`, {
          method: 'DELETE',
        });
        toast.success('Đã xóa tài khoản người dùng thành công!');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa người dùng.');
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <section className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quản lý người dùng</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Danh sách toàn bộ người dùng có quyền truy cập hệ thống.</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10 self-start sm:self-auto">
              <Plus className="w-4 h-4" />
              Thêm người dùng mới
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh theo tên hoặc email"
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
            <p className="text-sm text-slate-500">Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow>
                    <TableHead className="py-4 px-6">Người dùng</TableHead>
                    <TableHead className="py-4 px-4">Email</TableHead>
                    <TableHead className="py-4 px-4">Vai trò (Role)</TableHead>
                    <TableHead className="py-4 px-4">Xác thực Email</TableHead>
                    <TableHead className="py-4 px-4">Ngày tham gia</TableHead>
                    <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Không tìm thấy người dùng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.fullName} className="object-cover h-full w-full" />
                              ) : (
                                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                  {getInitials(user.fullName)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground text-sm">{user.email}</TableCell>
                        <TableCell className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-background border border-input rounded-xl px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                          >
                            <option value="GUEST">GUEST</option>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant={user.isVerified ? 'default' : 'secondary'} className="rounded-lg">
                            {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUserDocs(user)}
                              className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 rounded-lg text-indigo-500"
                              title="Xem tài liệu đã tải"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(user)}
                              className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 rounded-lg text-indigo-500"
                              title="Chỉnh sửa tài khoản"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-lg"
                              title="Xóa người dùng"
                            >
                              <UserMinus className="w-4 h-4" />
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
      </section>

      {/* Modal danh sách tài liệu của người dùng */}
      <Dialog open={isDocsModalOpen} onOpenChange={setIsDocsModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Tài liệu của {selectedUser?.fullName}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Chỉ hiển thị các tài liệu được đặt ở trạng thái Công khai (Public).
            </DialogDescription>
          </DialogHeader>

          {userDocsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground">Đang tải danh sách tài liệu...</p>
            </div>
          ) : userDocs.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-muted/20">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Người dùng này chưa có tài liệu công khai nào</p>
            </div>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0">
                  <TableRow>
                    <TableHead className="py-2.5 px-4">Tài liệu</TableHead>
                    <TableHead className="py-2.5 px-3">Danh mục</TableHead>
                    <TableHead className="py-2.5 px-3">Lượt tải</TableHead>
                    <TableHead className="py-2.5 px-3 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDocs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                      <TableCell className="py-2.5 px-4">
                        <div className="flex flex-col min-w-0 max-w-[250px]">
                          <span className="font-semibold text-foreground text-xs truncate" title={doc.title}>{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground truncate font-mono">{doc.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 rounded-md">
                          {doc.category?.name || 'Tài liệu'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-xs font-bold">{doc.downloadCount}</TableCell>
                      <TableCell className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-accent rounded-lg"
                            title="Xem chi tiết & Preview"
                          >
                            <Link to={`/documents/${doc.id}`} target="_blank">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadDoc(doc.id)}
                            className="h-7 w-7 hover:bg-accent rounded-lg text-indigo-500"
                            title="Tải tệp tin"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="button" onClick={() => setIsDocsModalOpen(false)} className="rounded-xl w-full sm:w-auto">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Thêm người dùng mới */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Thêm người dùng mới</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tạo tài khoản học sinh hoặc quản trị viên mới trên hệ thống.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-fullname" className="text-sm font-semibold text-foreground">Họ và tên *</Label>
              <Input
                id="create-fullname"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-sm font-semibold text-foreground">Địa chỉ Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password" className="text-sm font-semibold text-foreground">Mật khẩu ban đầu *</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role" className="text-sm font-semibold text-foreground">Quyền hạn (Role)</Label>
              <select
                id="create-role"
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as any)}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="USER">USER (Học sinh)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
                <option value="GUEST">GUEST (Khách)</option>
              </select>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={createLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {createLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Chỉnh sửa thông tin người dùng */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Cập nhật thông tin chi tiết hoặc thay đổi cài đặt hệ thống cho người dùng.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-fullname" className="text-sm font-semibold text-foreground">Họ và tên *</Label>
              <Input
                id="edit-fullname"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-sm font-semibold text-foreground">Địa chỉ Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-password" className="text-sm font-semibold text-foreground">Mật khẩu mới (Bỏ trống nếu không đổi)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-sm font-semibold text-foreground">Quyền hạn</Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  <option value="GUEST">GUEST</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-limit" className="text-sm font-semibold text-foreground">Giới hạn lưu trữ (MB)</Label>
                <Input
                  id="edit-limit"
                  type="number"
                  min="1"
                  value={editStorageLimitMB}
                  onChange={(e) => setEditStorageLimitMB(Number(e.target.value))}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="edit-verified"
                type="checkbox"
                checked={editIsVerified}
                onChange={(e) => setEditIsVerified(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="edit-verified" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Đã xác thực tài khoản Email (isVerified)
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={editLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
