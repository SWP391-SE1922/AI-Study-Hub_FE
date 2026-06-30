import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { User, Mail, IdCard, Camera, Save, Shield, HardDrive, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMe, updateProfile, type User as UserType } from '../services/api';

function getInitials(name?: string, email?: string) {
  const source = name || email || 'SV';
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatFileSize(size?: number) {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value?: string) {
  if (!value) return 'Không rõ';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

export function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const result = await getMe();
        setUser(result);
        localStorage.setItem('user', JSON.stringify(result));
        setFormData({
          fullName: result.fullName || '',
          avatarUrl: result.avatarUrl || '',
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    setFormData({
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user]);

  const initials = useMemo(() => getInitials(user?.fullName, user?.email), [user]);
  const defaultStorageLimit = 5 * 1024 * 1024 * 1024;
  const storageLimit = Math.max(Number(user?.storageLimit || 0), defaultStorageLimit);
  const storagePercent = storageLimit ? Math.min(100, Math.round(((user?.usedStorage || 0) / storageLimit) * 100)) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl.trim() || null,
      });
      setUser(updated);
      toast.success('Đã cập nhật thông tin cá nhân');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-700 dark:text-slate-300 p-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Thông tin cá nhân</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Thông tin này được lấy từ tài khoản đang đăng nhập trong backend.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm h-fit">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">Tài khoản</CardTitle>
            <CardDescription className="text-xs">Ảnh và tên hiển thị trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 pt-2 space-y-4">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-slate-100 dark:border-slate-800 shadow-md">
                <AvatarImage src={formData.avatarUrl} alt={formData.fullName || user?.email} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-3xl select-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg" title="Dán link ảnh đại diện ở ô bên phải">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{user?.fullName || 'Sinh viên'}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{user?.email || 'Chưa có email'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">Thông tin tài khoản</CardTitle>
            <CardDescription className="text-xs">Chỉ hiển thị những trường backend đang có thật trong database.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải thông tin cá nhân...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl text-sm transition-all text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Gmail đăng nhập
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="h-11 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-slate-400" /> User ID
                    </label>
                    <Input
                      type="text"
                      value={user?.id || ''}
                      disabled
                      className="h-11 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" /> Quyền tài khoản
                    </label>
                    <Input
                      type="text"
                      value={user?.role || 'USER'}
                      disabled
                      className="h-11 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" /> Link ảnh đại diện
                  </label>
                  <Input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl text-sm transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                      <HardDrive className="w-4 h-4" /> Dung lượng
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      {formatFileSize(user?.usedStorage)} / {formatFileSize(storageLimit)} ({storagePercent}%)
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                      <Calendar className="w-4 h-4" /> Ngày tạo
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-6 h-11 font-medium shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
