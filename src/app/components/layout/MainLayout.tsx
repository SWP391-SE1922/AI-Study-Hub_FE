import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, MessageSquare, Settings, LogOut,
  Menu, X, Sun, Moon, Bot, Shield, Sparkles, Globe,
  Check, Crown, HardDrive, ChevronRight, ShieldCheck, Copy, RefreshCw,
  Search
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { getMe, getToken, logoutLocal, type User } from '../../services/api';
// @ts-ignore
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

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

const BYTES_PER_GB = 1024 ** 3;
const FREE_STORAGE_LIMIT_GB = 5;

function getProLabel(storageLimitBytes?: number): string | null {
  if (!storageLimitBytes) return null;
  const storageLimitGB = storageLimitBytes / BYTES_PER_GB;
  if (storageLimitGB <= 5) return null;
  if (storageLimitGB >= 900) return 'UNLIMITED';
  if (storageLimitGB >= 50) return 'VIP';
  if (storageLimitGB >= 10) return 'PREMIUM';
  return null;
}

const PLANS = [
  {
    id: 'free',
    code: 'BASIC',
    name: 'BASIC (FREE)',
    storage: '5 GB',
    storageBytes: 5 * BYTES_PER_GB,
    price: 0,
    priceLabel: '0đ',
    period: '/mo',
    popular: false,
    features: ['5 GB dung lượng lưu trữ', '20 lượt hỏi AI', 'Mô hình Llama3 tiêu chuẩn'],
  },
  {
    id: 'premium',
    code: 'PREMIUM',
    name: 'PREMIUM',
    storage: '10 GB',
    storageBytes: 10 * BYTES_PER_GB,
    price: 250000,
    priceLabel: '250.000đ',
    period: '/mo',
    popular: false,
    features: ['10 GB dung lượng lưu trữ', '50 lượt hỏi AI', 'Ưu tiên xử lý nhanh', 'Mô hình Mistral'],
  },
  {
    id: 'vip',
    code: 'VIP',
    name: 'VIP',
    storage: '50 GB',
    storageBytes: 50 * BYTES_PER_GB,
    price: 500000,
    priceLabel: '500.000đ',
    period: '/mo',
    popular: true,
    features: ['50 GB dung lượng lưu trữ', '250 lượt hỏi AI', 'Hỗ trợ ưu tiên 24/7', 'Mô hình Qwen2.5'],
  },
  {
    id: 'unlimited',
    code: 'UNLIMITED',
    name: 'UNLIMITED',
    storage: 'Vô hạn',
    storageBytes: 999 * BYTES_PER_GB,
    price: 1200000,
    priceLabel: '1.200.000đ',
    period: '/mo',
    popular: false,
    features: ['Vô hạn dung lượng', 'Không giới hạn lượt hỏi AI', 'Trải nghiệm thoải mái nhất', 'Mô hình Qwen2.5'],
  },
];

type UpgradeStep = 'plans' | 'payment';

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UpgradeStep>('plans');
  const [selected, setSelected] = useState(PLANS[1]);

  const user = readStoredUser();
  const userIdShort = user?.id ? user.id.slice(-6).toUpperCase() : 'STUDY';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

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
        // Bỏ qua lỗi kết nối tạm thời
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [step, selected, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 text-slate-900 rounded-3xl shadow-2xl border border-white/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-md rounded-t-3xl">
          <div className="flex items-center gap-3">
            {step !== 'plans' && (
              <button
                type="button"
                onClick={() => setStep('plans')}
                aria-label="Quay lại"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
            <Crown className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {step === 'plans' && 'Nâng cấp Pro'}
                {step === 'payment' && 'Thanh toán'}
              </h2>
              <p className="text-[10px] text-slate-500">
                {step === 'plans' && 'Mở rộng giới hạn lưu trữ'}
                {step === 'payment' && `${selected.name} · ${selected.priceLabel}${selected.period}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Plans */}
        {step === 'plans' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan) => {
                const isCurrentPlan = (user?.storageLimit || FREE_STORAGE_LIMIT_GB * BYTES_PER_GB) >= plan.storageBytes;
                const isPopular = plan.popular;
                const isUnlimited = plan.code === 'UNLIMITED';
                const isFree = plan.price === 0;
                const accent =
                  plan.code === 'PREMIUM'
                    ? 'text-indigo-600'
                    : plan.code === 'VIP'
                      ? 'text-indigo-600'
                      : plan.code === 'UNLIMITED'
                        ? 'text-fuchsia-600'
                        : 'text-slate-400';

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm relative ${
                      isPopular ? 'border-2 border-indigo-600/20 shadow-md' : 'border border-slate-200/50'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 right-4 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-extrabold uppercase tracking-widest font-mono shadow-sm">
                        POPULAR
                      </div>
                    )}
                    <div className="space-y-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${accent}`}>
                        {plan.name}
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {plan.priceLabel}{' '}
                        <span className="text-xs font-normal text-slate-400">{plan.period}</span>
                      </div>
                      <ul className="text-slate-500 text-xs space-y-2 leading-relaxed">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="mt-0.5 text-slate-400">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      disabled={isCurrentPlan}
                      onClick={() => {
                        setSelected(plan);
                        if (!isFree) setStep('payment');
                        else toast.success('Bạn đang dùng gói Free!');
                      }}
                      className={`w-full rounded-full py-2 mt-6 font-bold text-xs transition-all ${
                        isCurrentPlan 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                          : isUnlimited
                            ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90'
                            : isPopular
                              ? 'bg-[#121214] text-white hover:bg-stone-800 uppercase tracking-wider'
                              : plan.code === 'PREMIUM'
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isCurrentPlan 
                        ? 'Đang sử dụng'
                        : isFree
                          ? 'Đăng ký miễn phí'
                          : `Thanh toán ${plan.priceLabel}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <div className={`rounded-2xl p-5 bg-slate-50 border border-slate-200 text-slate-900 flex justify-between items-center shadow-sm`}>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Gói chọn</p>
                <p className="font-bold text-sm">{selected.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Tổng cộng</p>
                <p className="font-bold text-xl text-indigo-600">{selected.priceLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3.5">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Thông tin chuyển khoản</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ngân hàng</p>
                      <p className="font-bold text-slate-800">NCB</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Số tài khoản</p>
                      <p className="font-bold text-slate-800 tracking-wider">9704198524025937</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100" onClick={() => copyToClipboard('9704198524025937', 'Số tài khoản')}>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nội dung</p>
                      <p className="font-extrabold text-indigo-600 text-sm">
                        {`STUDYHUB PRO ${userIdShort}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100" onClick={() => copyToClipboard(`STUDYHUB PRO ${userIdShort}`, 'Nội dung')}>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-3xl bg-white shadow-sm">
                <img
                  src={`https://img.vietqr.io/image/NCB-9704198524025937-compact.png?amount=${selected.price}&addInfo=STUDYHUB%20PRO%20${userIdShort}&accountName=AI%20STUDY%20HUB`}
                  alt="VietQR Code"
                  className="w-40 h-40 object-contain rounded-xl shadow-sm"
                />
                <div className="flex items-center gap-1.5 mt-6 text-xs font-bold text-indigo-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Đang kiểm tra giao dịch...
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">Hệ thống sẽ tự động cập nhật<br/>sau khi nhận được thanh toán.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<Partial<User>>(() => readStoredUser());
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const refreshUser = async () => {
      const stored = readStoredUser();
      setCurrentUser(stored);
      if (!getToken()) return;
      try {
        const user = await getMe();
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);

        // Kiểm tra thời hạn gói cước
        if (user && user.planExpiresAt && user.plan !== 'BASIC') {
          const expiresAt = new Date(user.planExpiresAt).getTime();
          const now = new Date().getTime();
          const diffTime = expiresAt - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0 && diffDays <= 5) {
            const hasShown = sessionStorage.getItem('expiry_warning_shown');
            if (!hasShown) {
              toast.warning(`Gói cước ${user.plan} của bạn sắp hết hạn! Chỉ còn ${diffDays} ngày nữa là hết hạn dịch vụ.`, {
                duration: 8000,
              });
              sessionStorage.setItem('expiry_warning_shown', 'true');
            }
          }
        }
      } catch {
        // keep localStorage user
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
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield, shortcut: '⌘A' }] : []),
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘D' },
    { path: '/documents', label: 'My Vault', icon: FileText, shortcut: '⌘V' },
    { path: '/public-documents', label: 'Global Docs', icon: Globe, shortcut: '⌘G' },
    { path: '/chat', label: 'AI Console', icon: Bot, shortcut: '⌘C' },
    { path: '/profile', label: 'Settings', icon: Settings, shortcut: '⌘S' },
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#09090b] text-[#121214] dark:text-[#eaeaea] transition-colors duration-300 relative flex flex-col">
      {/* Fine Dotted Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.3] dark:opacity-[0.08] z-0"
           style={{
             backgroundImage: 'radial-gradient(#121214 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {/* Soft colorful glow background behind content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden z-0 opacity-60 dark:opacity-30">
        <div className="absolute -top-1/4 left-1/4 w-[500px] h-[300px] bg-gradient-to-r from-sky-200 via-indigo-100 to-rose-100 dark:from-sky-900/30 dark:via-indigo-900/20 dark:to-rose-900/20 rounded-full blur-[90px]" />
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

      {/* FLOATING TOP NAVBAR */}
      <div className="sticky top-0 z-50 w-full flex justify-center p-4">
        <nav className={`w-full transition-all duration-500 flex items-center justify-between px-6 py-3 ${
          scrolled 
            ? 'max-w-5xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-full shadow-lg' 
            : 'max-w-7xl bg-white/30 dark:bg-zinc-950/20 backdrop-blur-md border border-zinc-200/20 dark:border-white/5 rounded-2xl'
        }`}>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-extrabold tracking-widest text-[#121214] dark:text-white">
              AI STUDY HUB
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-[#121214]/70 dark:text-stone-300">
            <a href="/#products" className="hover:text-[#121214] dark:hover:text-white transition-colors">
              Products
            </a>
            <a href="/#pricing" className="hover:text-[#121214] dark:hover:text-white transition-colors">
              Pricing
            </a>
            <a href="/#about-us" className="hover:text-[#121214] dark:hover:text-white transition-colors">
              About Us
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className={`transition-colors ${location.pathname.startsWith('/admin') ? 'text-[#121214] dark:text-white' : 'hover:text-[#121214] dark:hover:text-white'}`}
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/documents"
              className={`transition-colors ${location.pathname.startsWith('/documents') ? 'text-[#121214] dark:text-white' : 'hover:text-[#121214] dark:hover:text-white'}`}
            >
              Tài liệu của tôi
            </Link>
            <Link
              to="/chat"
              className={`transition-colors ${location.pathname.startsWith('/chat') ? 'text-[#121214] dark:text-white' : 'hover:text-[#121214] dark:hover:text-white'}`}
            >
              AI Chat
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {/* Quick Upgrade */}
            <button
              onClick={() => {
                if (!isPro) setUpgradeOpen(true);
              }}
              className={`hidden sm:block text-[9px] font-mono tracking-wider uppercase text-stone-600 dark:text-stone-400 border border-[#121214]/10 dark:border-white/10 ${!isPro ? 'hover:border-sky-500 dark:hover:border-sky-500 hover:text-sky-500 cursor-pointer' : 'cursor-default'} px-3 py-1.5 rounded-full transition-all`}
            >
              {isPro ? `[ Plan: ${proLabel} ]` : '[ Upgrade Pro ]'}
            </button>

            {/* User Profile avatar dropdown / trigger */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="w-8 h-8 border border-[#121214]/10 dark:border-white/10 hover:ring-2 hover:ring-sky-500 transition-all cursor-pointer">
                      <AvatarImage src={currentUser.avatarUrl || ''} />
                      <AvatarFallback className="bg-zinc-800 text-white text-[10px] font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#16141a] border border-zinc-200 dark:border-white/5 rounded-xl shadow-lg">
                  <DropdownMenuItem onSelect={() => window.location.href = '/profile'} className="text-xs font-semibold py-2 cursor-pointer">
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => window.location.href = '/transactions'} className="text-xs font-semibold py-2 cursor-pointer">
                    Lịch sử giao dịch
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout} className="text-xs font-semibold py-2 cursor-pointer text-rose-500 hover:text-rose-600">
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Page Area */}
      <main className="flex-grow p-4 md:p-8 max-w-6xl w-full mx-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
}