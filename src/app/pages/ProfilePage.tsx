import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { User, Mail, IdCard, Camera, Save, Shield, HardDrive, Calendar, CheckCircle2, XCircle } from 'lucide-react';
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
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.5)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.4)] ' +
  'transition-shadow duration-300';

export function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [formData, setFormData] = useState({ fullName: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const result = await getMe();
        setUser(result);
        localStorage.setItem('user', JSON.stringify(result));
        setFormData({ fullName: result.fullName || '', avatarUrl: result.avatarUrl || '' });
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
    setFormData({ fullName: user.fullName || '', avatarUrl: user.avatarUrl || '' });
  }, [user]);

  const initials = useMemo(() => getInitials(user?.fullName, user?.email), [user]);
  const defaultStorageLimit = 5 * 1024 * 1024 * 1024;
  const storageLimit = Math.max(Number(user?.storageLimit || 0), defaultStorageLimit);
  const storagePercent = storageLimit
    ? Math.min(100, Math.round(((user?.usedStorage || 0) / storageLimit) * 100))
    : 0;
  const storageColor =
    storagePercent >= 80 ? 'from-rose-500 to-orange-500' :
      storagePercent >= 50 ? 'from-amber-400 to-yellow-400' :
        'from-indigo-500 to-fuchsia-500';

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

  /* ------------------------------------------------------------------ */
  /* NOTE: Animation CSS has been moved to globals.css.                  */
  /* Make sure the following is present in your globals.css:             */
  /*                                                                     */
  /* @keyframes profile-fade-up {                                        */
  /*   from { opacity: 0; transform: translateY(10px); }                */
  /*   to   { opacity: 1; transform: translateY(0); }                   */
  /* }                                                                   */
  /* @keyframes profile-avatar-ring {                                    */
  /*   0%, 100% { opacity: 0.6; }                                       */
  /*   50%      { opacity: 1; }                                         */
  /* }                                                                   */
  /* .profile-fade-up    { animation: profile-fade-up 0.5s ease-out both; } */
  /* .profile-delay-1    { animation-delay: 0.05s; }                    */
  /* .profile-delay-2    { animation-delay: 0.12s; }                    */
  /* .profile-avatar-ring{ animation: profile-avatar-ring 2.6s ease-in-out infinite; } */
  /* @media (prefers-reduced-motion: reduce) {                           */
  /*   .profile-fade-up, .profile-avatar-ring { animation: none; }      */
  /* }                                                                   */
  /* ------------------------------------------------------------------ */

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-2">

      {/* Page header */}
      <div className="profile-fade-up">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Thông tin cá nhân</h1>
        <p className="text-sm text-slate-400 mt-1">Quản lý thông tin tài khoản và cài đặt hiển thị của bạn.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left — Avatar card */}
        <div className="profile-fade-up profile-delay-1">
          <Card className={`${glowCard} rounded-2xl h-fit overflow-hidden`}>
            {/* gradient banner */}
            <div className="h-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 relative">
              <div className="pointer-events-none absolute inset-0 bg-white/10" />
            </div>

            <CardContent className="flex flex-col items-center -mt-12 pb-6 px-6 space-y-4">
              {/* avatar with glow ring */}
              <div className="relative">
                <div className="profile-avatar-ring absolute -inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 blur-md opacity-60" />
                <Avatar className="relative w-24 h-24 border-4 border-white dark:border-slate-900 shadow-xl">
                  <AvatarImage src={formData.avatarUrl} alt={formData.fullName || user?.email} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold text-2xl select-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight">
                  {user?.fullName || 'Sinh viên'}
                </h3>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold truncate max-w-[180px]">
                  {user?.email || 'Chưa có email'}
                </p>
              </div>

              {/* role badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1
                ${user?.role === 'ADMIN'
                  ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 ring-fuchsia-200 dark:ring-fuchsia-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-200 dark:ring-indigo-500/20'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user?.role || 'USER'}
              </span>

              {/* verified badge */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${user?.isVerified ? 'text-emerald-500' : 'text-slate-400'}`}>
                {user?.isVerified
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực</>
                  : <><XCircle className="w-3.5 h-3.5" /> Chưa xác thực</>
                }
              </div>

              {/* storage mini bar */}
             
            </CardContent>
          </Card>
        </div>

        {/* Right — Edit form */}
        <div className="md:col-span-2 profile-fade-up profile-delay-2">
          <Card className={`${glowCard} rounded-2xl`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold text-slate-800 dark:text-slate-100">Chỉnh sửa thông tin</CardTitle>
              <CardDescription className="text-xs">Chỉ các trường có trong database mới hiển thị ở đây.</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-2 space-y-5">
              {loading ? (
                <div className="py-10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Họ và tên */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Họ và tên
                      </label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Gmail đăng nhập
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="h-11 bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* User ID */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5" /> User ID
                      </label>
                      <Input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="h-11 bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 rounded-xl text-xs font-mono text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Ngày tạo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Ngày tạo
                      </label>
                      <Input
                        type="text"
                        value={formatDate(user?.createdAt)}
                        disabled
                        className="h-11 bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Link ảnh đại diện
                    </label>
                    <Input
                      type="url"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-white/5" />

                  {/* Storage detail */}
                  <div className="rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-800/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" /> Dung lượng lưu trữ
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {formatFileSize(user?.usedStorage)} / {formatFileSize(storageLimit)}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold
                          ${storagePercent >= 80
                            ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >{storagePercent}%</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      {/* Dynamic width requires style= — unavoidable for data-driven progress bars */}
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${storageColor} transition-all duration-700`}
                        style={{ width: `${storagePercent}%` }} // eslint-disable-line react/forbid-component-props
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Còn lại {formatFileSize(Math.max(0, storageLimit - (user?.usedStorage || 0)))} dung lượng trống
                    </p>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="group relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-xl px-8 h-11 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <Save className="w-4 h-4 relative" />
                      <span className="relative">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}