import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, MessageSquare, Settings, LogOut,
  Menu, X, Sun, Moon, Bot, Shield, Sparkles, Globe,
  Check, Crown, HardDrive, ChevronRight, ShieldCheck, Copy, RefreshCw,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getMe, getToken, logoutLocal, type User } from '../../services/api';
// @ts-ignore
import confetti from 'canvas-confetti';

function readStoredUser(): Partial<User> {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function getInitials(name?: string, email?: string) {
  const source = name || email || 'SV';
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

// Gói mặc định (free) là 5 GB. Nếu storageLimit lớn hơn, coi như user đã nâng cấp Pro.
const BYTES_PER_GB = 1024 ** 3;
const FREE_STORAGE_LIMIT_GB = 5;

function getProLabel(storageLimitBytes?: number): string | null {
  if (!storageLimitBytes) return null;
  const storageLimitGB = storageLimitBytes / BYTES_PER_GB;
  if (storageLimitGB <= FREE_STORAGE_LIMIT_GB) return null;
  if (storageLimitGB >= 200) return 'PREMIUM';
  return 'PRO';
}

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'pro_10',
    name: 'Pro 10 GB',
    storage: '10 GB',
    price: 29_000,
    priceLabel: '29.000 ₫',
    period: '/ tháng',
    color: 'from-indigo-500 to-violet-500',
    ring: 'ring-indigo-400/40',
    popular: false,
    features: ['10 GB lưu trữ', 'Không giới hạn tải lên', 'Ưu tiên hỗ trợ', 'Lịch sử 1 năm'],
  },
  {
    id: 'pro_50',
    name: 'Pro 50 GB',
    storage: '50 GB',
    price: 79_000,
    priceLabel: '79.000 ₫',
    period: '/ tháng',
    color: 'from-fuchsia-500 to-pink-500',
    ring: 'ring-fuchsia-400/40',
    popular: true,
    features: ['50 GB lưu trữ', 'Không giới hạn tải lên', 'Ưu tiên hỗ trợ cao', 'Lịch sử vĩnh viễn', 'Badge Pro'],
  },
  {
    id: 'pro_200',
    name: 'Pro 200 GB',
    storage: '200 GB',
    price: 199_000,
    priceLabel: '199.000 ₫',
    period: '/ tháng',
    color: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-400/40',
    popular: false,
    features: ['200 GB lưu trữ', 'Không giới hạn mọi thứ', 'Hỗ trợ 24/7', 'Lịch sử vĩnh viễn', 'Badge Premium', 'API access'],
  },
];

type UpgradeStep = 'plans' | 'payment';

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UpgradeStep>('plans');
  const [selected, setSelected] = useState(PLANS[1]);

  const user = readStoredUser();
  const userIdShort = user?.id ? user.id.slice(-6).toUpperCase() : 'STUDY';

  // Sao chép nhanh thông tin chuyển khoản vào bộ nhớ tạm
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  // Tự động kiểm tra trạng thái nâng cấp tài khoản qua API mỗi 4 giây khi đang ở bước thanh toán
  useEffect(() => {
    if (step !== 'payment') return;

    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const currentUserData = await getMe();
        const proLabel = getProLabel(currentUserData.storageLimit);
        if (proLabel) {
          active = false;
          clearInterval(interval);
          localStorage.setItem('user', JSON.stringify(currentUserData));
          window.dispatchEvent(new Event('authChange'));

          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          toast.success(`Chúc mừng! Bạn đã nâng cấp thành công gói ${selected.name}`);
          onClose();
        }
      } catch (err) {
        // Bỏ qua lỗi kết nối tạm thời khi đang kiểm tra ngầm
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [step, selected, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0F0C1D] rounded-3xl shadow-2xl shadow-black/40 border border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#0F0C1D]/95 backdrop-blur-md rounded-t-3xl">
          <div className="flex items-center gap-3">
            {step !== 'plans' && (
              <button
                type="button"
                onClick={() => setStep('plans')}
                aria-label="Quay lại bước trước"
                title="Quay lại bước trước"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {step === 'plans' && 'Nâng cấp tài khoản Pro'}
                {step === 'payment' && 'Thanh toán tài khoản Pro'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {step === 'plans' && 'Chọn gói phù hợp với nhu cầu'}
                {step === 'payment' && `Gói ${selected.name} · ${selected.priceLabel}${selected.period}`}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mr-8">
            {(['plans', 'payment'] as UpgradeStep[]).map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-indigo-500' : 'w-3 bg-slate-200 dark:bg-white/10'
                  }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            title="Đóng hộp thoại"
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step 1: Plans ──────────────────────────────────────────────── */}
        {step === 'plans' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Mua thêm dung lượng lưu trữ để tải lên không giới hạn tài liệu học tập.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan)}
                  className={`relative text-left rounded-2xl p-4 border-2 transition-all duration-200 ${selected.id === plan.id
                    ? `border-transparent ring-2 ${plan.ring} bg-gradient-to-b from-white to-slate-50 dark:from-white/10 dark:to-white/5 shadow-lg`
                    : 'border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 bg-white dark:bg-white/5'
                    }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow">
                      PHỔ BIẾN
                    </span>
                  )}

                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3 shadow-md`}>
                    <HardDrive className="w-4 h-4 text-white" />
                  </div>

                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{plan.name}</p>
                  <p className="text-xs text-slate-400 mb-3">{plan.storage} dung lượng</p>

                  <p className="font-extrabold text-lg text-slate-900 dark:text-white leading-none">
                    {plan.priceLabel}
                  </p>
                  <p className="text-[10px] text-slate-400 mb-3">{plan.period}</p>

                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {selected.id === plan.id && (
                    <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r ${plan.color}`} />
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('payment')}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
            >
              Tiếp tục thanh toán
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Chuyển khoản an toàn · Hệ thống kiểm tra cập nhật liên tục
            </p>
          </div>
        )}

        {/* ── Step 2: Payment (Chỉ giữ phần chuyển khoản VietQR) ──────────── */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            {/* Order summary */}
            <div className={`rounded-2xl p-4 bg-gradient-to-br ${selected.color} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold opacity-80">Gói nâng cấp</p>
                  <p className="font-extrabold text-base">{selected.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-80">Cần thanh toán</p>
                  <p className="font-extrabold text-xl">{selected.priceLabel}</p>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Bank Account Details */}
              <div className="space-y-3.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Thông tin chuyển khoản (VietQR)
                </h3>

                <div className="space-y-2 text-sm">
                  {/* Ngân hàng */}
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Ngân hàng</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">NCB (Ngân hàng Quốc Dân)</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => copyToClipboard('NCB', 'Ngân hàng')}
                      title="Sao chép tên ngân hàng"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Số tài khoản */}
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Số tài khoản</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wider">9704198524025937</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => copyToClipboard('9704198524025937', 'Số tài khoản')}
                      title="Sao chép số tài khoản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Chủ tài khoản</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">AI STUDY HUB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => copyToClipboard('AI STUDY HUB', 'Chủ tài khoản')}
                      title="Sao chép tên chủ tài khoản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex justify-between items-center ring-1 ring-indigo-500/30">
                    <div>
                      <p className="text-[10px] text-indigo-500 font-semibold uppercase">Nội dung bắt buộc</p>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-wide text-base">
                        {`STUDYHUB PRO ${userIdShort}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg text-indigo-500 hover:text-indigo-600"
                      onClick={() => copyToClipboard(`STUDYHUB PRO ${userIdShort}`, 'Nội dung chuyển khoản')}
                      title="Sao chép nội dung"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: QR Code */}
              <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] h-full">
                <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <img
                    src={`https://img.vietqr.io/image/NCB-9704198524025937-compact.png?amount=${selected.price}&addInfo=STUDYHUB%20PRO%20${userIdShort}&accountName=AI%20STUDY%20HUB`}
                    alt="VietQR Code"
                    className="w-36 h-36 object-contain"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <Crown className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 text-center leading-relaxed font-medium">
                  Quét mã VietQR bằng ứng dụng Mobile Banking để thanh toán nhanh.
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Hệ thống đang kiểm tra tự động...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MainLayout ───────────────────────────────────────────────────────────────
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>(() => readStoredUser());
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const refreshUser = async () => {
      setCurrentUser(readStoredUser());
      if (!getToken()) return;
      try {
        const user = await getMe();
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      } catch {
        // keep localStorage user on transient API error
      }
    };

    refreshUser();
    window.addEventListener('authChange', refreshUser);
    window.addEventListener('storage', refreshUser);
    return () => {
      window.removeEventListener('authChange', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  const initials = useMemo(() => getInitials(currentUser.fullName, currentUser.email), [currentUser]);
  const proLabel = useMemo(() => getProLabel(currentUser.storageLimit), [currentUser.storageLimit]);
  const isPro = Boolean(proLabel);

  const handleLogout = () => {
    logoutLocal();
    window.location.href = '/';
  };

  const isAdmin = currentUser.role === 'ADMIN';

  const menuItems = [
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Tài liệu của tôi', icon: FileText },
    { path: '/public-documents', label: 'Tài liệu cộng đồng', icon: Globe },
    { path: '/chat', label: 'Chat AI', icon: Bot },
    { path: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0A1A] text-foreground transition-colors duration-300">
      <style>{`
        @keyframes main-blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, 14px) scale(1.12); }
        }
        @keyframes main-blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-14px, -10px) scale(1.08); }
        }
        @keyframes main-shimmer {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes main-border-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes main-pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          80%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes main-upgrade-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .main-blob-1 { animation: main-blob-float-1 9s ease-in-out infinite; }
        .main-blob-2 { animation: main-blob-float-2 11s ease-in-out infinite; }
        .main-active-shimmer {
          background-image: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: main-shimmer 2.6s ease-in-out infinite;
        }
        .main-header-glow {
          background-image: linear-gradient(90deg, transparent, rgba(167,139,250,0.55), rgba(217,70,239,0.45), transparent);
          background-size: 200% 100%;
          animation: main-shimmer 6s linear infinite;
        }
        .main-status-ping { animation: main-pulse-ring 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        .main-logo-ring   { animation: main-border-glow 2.4s ease-in-out infinite; }
        .main-upgrade-btn { animation: main-upgrade-bounce 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .main-blob-1, .main-blob-2, .main-active-shimmer, .main-header-glow,
          .main-status-ping, .main-logo-ring, .main-upgrade-btn { animation: none !important; }
        }
      `}</style>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-[#0B0A1A]/80 backdrop-blur-md z-30 flex items-center justify-between px-4 lg:px-7 lg:pl-72 transition-colors duration-300">
        <div className="main-header-glow pointer-events-none absolute top-0 left-0 right-0 h-px opacity-70" />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/dashboard" className="group flex items-center gap-2.5 lg:hidden">
            <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">AI Study Hub</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* ── Upgrade / quản lý gói button ── */}
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            title={isPro ? 'Quản lý gói Pro' : 'Nâng cấp tài khoản Pro'}
            className={`main-upgrade-btn relative flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold
              text-white shadow-md hover:-translate-y-0.5 transition-all duration-300
              ${isPro
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30 hover:from-amber-500 hover:to-orange-600 hover:shadow-amber-500/50'
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30 hover:from-violet-600 hover:to-fuchsia-600 hover:shadow-fuchsia-500/50'
              }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPro ? proLabel : 'Nâng cấp'}</span>
            {!isPro && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white dark:border-[#0B0A1A]" />
            )}
          </button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-9 h-9 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all duration-300 hover:shadow-[0_0_16px_-2px_rgba(245,158,11,0.6)]"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Thay đổi giao diện"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-indigo-300" />
          </Button>

          {/* Avatar */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-3">
            <div className="relative">
              <Avatar
                className={`w-9 h-9 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0A1A] transition-shadow duration-300 ${isPro
                  ? 'ring-amber-400/60 hover:shadow-[0_0_18px_-2px_rgba(251,191,36,0.7)]'
                  : 'ring-indigo-500/30 hover:shadow-[0_0_18px_-2px_rgba(139,92,246,0.6)]'
                  }`}
              >
                <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.fullName || currentUser.email} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0A1A]" />
              <span className="main-status-ping absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400" />
              {isPro && (
                <span
                  title={proLabel === 'PREMIUM' ? 'Tài khoản Premium' : 'Tài khoản Pro'}
                  className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white dark:border-[#0B0A1A] flex items-center justify-center shadow-sm"
                >
                  <Crown className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left max-w-[180px]">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground truncate">{currentUser.fullName || 'Sinh viên'}</p>
                {isPro && (
                  <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-white tracking-wide">
                    {proLabel}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium truncate">{currentUser.email || 'Chưa có email đăng nhập'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 ease-out flex flex-col justify-between
        bg-gradient-to-b from-[#1B1140] via-[#15102E] to-[#0B0A1A] text-slate-200
        shadow-2xl shadow-black/40 overflow-hidden
        ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0'}`}
      >
        <div className="main-blob-1 pointer-events-none absolute -top-24 -left-16 w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl" />
        <div className="main-blob-2 pointer-events-none absolute bottom-24 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="h-16 items-center px-6 border-b border-white/10 hidden lg:flex">
            <Link to="/dashboard" className="group flex items-center gap-2.5">
              <div className="relative">
                <div className="main-logo-ring absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 blur-md opacity-60" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">AI Study Hub</span>
            </Link>
          </div>

          <div className="p-4 space-y-1.5 lg:mt-3">
            <div className="flex items-center justify-between lg:hidden mb-4 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menu</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="hidden lg:block px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Điều hướng</p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                  <span
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                    ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30 translate-x-0.5'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1 hover:shadow-[0_0_18px_-6px_rgba(167,139,250,0.6)]'
                      }`}
                  >
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-white/90 transition-all duration-300 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`} />
                    {isActive && <span className="main-active-shimmer absolute inset-0 pointer-events-none" />}
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-6'}`} />
                    <span className="relative">{item.label}</span>
                    {isActive && <Sparkles className="w-3.5 h-3.5 ml-auto opacity-80 relative" />}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="group w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/15 transition-all duration-300 hover:shadow-[0_0_18px_-6px_rgba(244,63,94,0.5)] hover:translate-x-1"
          >
            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <main className="pt-16 lg:pl-72 min-h-screen flex flex-col transition-colors duration-300">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}