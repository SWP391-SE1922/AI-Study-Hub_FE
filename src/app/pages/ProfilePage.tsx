import * as React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { User, Mail, Camera, Save, Shield, HardDrive, CheckCircle2, XCircle, Crown, Phone, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMe, updateProfile, resendVerificationEmail, uploadAvatar, type User as UserType } from '../services/api';
import { motion } from 'motion/react';

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
  'border border-white/60 bg-white/70 text-slate-800 ' +
  'shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl ' +
  'hover:border-white/80 transition-all duration-300 rounded-2xl';

export function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [formData, setFormData] = useState({ fullName: '', avatarUrl: '', phoneNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const result = await getMe();
        setUser(result);
        localStorage.setItem('user', JSON.stringify(result));
        setFormData({ fullName: result.fullName || '', avatarUrl: result.avatarUrl || '', phoneNumber: result.phoneNumber || '' });
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
    setFormData({ fullName: user.fullName || '', avatarUrl: user.avatarUrl || '', phoneNumber: user.phoneNumber || '' });
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

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const msg = await resendVerificationEmail(user.email);
      toast.success(msg || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi email xác thực');
    } finally {
      setResending(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      toast.success('Tải ảnh lên thành công. Vui lòng lưu thay đổi.');
      setShowAvatarModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thông tin cá nhân</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin tài khoản và cài đặt hiển thị của bạn.</p>
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
              <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                <div className="profile-avatar-ring absolute -inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <Avatar className="relative w-24 h-24 border-4 border-white dark:border-slate-900 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={formData.avatarUrl} alt={formData.fullName || user?.email} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold text-2xl select-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {user?.fullName || 'Sinh viên'}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold truncate max-w-[180px]">
                  {user?.email || 'Chưa có email'}
                </p>
              </div>

              {/* role badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1
                ${user?.role === 'ADMIN'
                  ? 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-200'
                  : 'bg-indigo-50 text-indigo-600 ring-indigo-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user?.role || 'USER'}
              </span>

              {/* verified badge */}
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${user?.isVerified ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {user?.isVerified
                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực</>
                    : <><XCircle className="w-3.5 h-3.5" /> Chưa xác thực</>
                  }
                </div>
                {!user?.isVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] rounded-full bg-white/50 border-slate-200 hover:bg-white text-slate-600 shadow-sm"
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    {resending ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
                    Gửi lại xác thực
                  </Button>
                )}
              </div>

              {/* storage mini bar */}

            </CardContent>
          </Card>
        </div>

        {/* Right — Edit form */}
        <div className="md:col-span-2 profile-fade-up profile-delay-2">
          <Card className={`${glowCard} rounded-2xl`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold text-slate-900">Chỉnh sửa thông tin</CardTitle>
              <CardDescription className="text-xs text-slate-500">Chỉ các trường có trong database mới hiển thị ở đây.</CardDescription>
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
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Họ và tên
                      </label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="h-11 bg-white/50 border-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl text-sm text-slate-900 shadow-sm transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Gmail đăng nhập
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="h-11 bg-slate-50/50 border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed shadow-inner"
                      />
                    </div>

                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Số điện thoại
                    </label>
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className="h-11 bg-white/50 border-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl text-sm text-slate-900 shadow-sm transition-all"
                    />
                  </div>

                  <hr className="border-slate-100" />

                  {/* Plan detail */}
                  {user?.plan && (
                    <div className="rounded-xl border border-white bg-white/40 shadow-sm p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-500" /> Gói hiện tại
                        </span>
                        <span className="text-sm font-extrabold text-indigo-600 uppercase">
                          {user.plan}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5">
                        <span className="text-slate-500 font-semibold">Thời hạn sử dụng:</span>
                        <span className="font-bold text-slate-800">
                          {user.planExpiresAt ? formatDate(user.planExpiresAt) : 'Vô hạn'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5">
                        <span className="text-slate-500 font-semibold">Lượt hỏi AI:</span>
                        <span className="font-bold text-slate-800">
                          {user.plan === 'UNLIMITED' ? 'Vô hạn' : `${user.aiQuestionsUsed || 0} / ${user.aiQuestionsLimit || 20}`}
                        </span>
                      </div>
                      {user.planExpiresAt && (
                        (() => {
                          const diff = new Date(user.planExpiresAt).getTime() - new Date().getTime();
                          const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          if (diffDays > 0 && diffDays <= 5) {
                            return (
                              <div className="mt-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[11px] font-semibold text-rose-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                Gói cước của bạn sẽ hết hạn sau {diffDays} ngày nữa. Hãy gia hạn!
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}
                    </div>
                  )}

                  {/* Storage detail */}
                  <div className="rounded-xl border border-white bg-white/40 shadow-sm p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" /> Dung lượng lưu trữ
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {formatFileSize(user?.usedStorage)} / {formatFileSize(storageLimit)}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold
                          ${storagePercent >= 80
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-indigo-100 text-indigo-600'
                          }`}
                        >{storagePercent}%</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/60 overflow-hidden shadow-inner">
                      {/* Dynamic width requires style= — unavoidable for data-driven progress bars */}
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${storageColor} transition-all duration-700`}
                        style={{ width: `${storagePercent}%` }} // eslint-disable-line react/forbid-component-props
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
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

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Thay đổi ảnh đại diện</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${avatarMode === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  Tải ảnh lên
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${avatarMode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  URL hình ảnh
                </button>
              </div>

              {avatarMode === 'upload' ? (
                <div className="space-y-4">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarFileChange} />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border border-indigo-200 rounded-xl"
                  >
                    {uploadingAvatar ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingAvatar ? 'Đang tải...' : 'Chọn file từ máy tính'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="Nhập đường dẫn hình ảnh..."
                    value={tempAvatarUrl}
                    onChange={(e) => setTempAvatarUrl(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={() => { setFormData(prev => ({ ...prev, avatarUrl: tempAvatarUrl })); setShowAvatarModal(false); }}
                    className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  >
                    Xác nhận
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowAvatarModal(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">Đóng</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}