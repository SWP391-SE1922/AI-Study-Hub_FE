import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Shield,
  Cloud,
  Search,
  ArrowRight,
  LogOut,
  Sun,
  Moon,
  FileText,
  Mail,
  HardDrive,
  Users2,
  KeyRound,
  FolderOpen,
  UploadCloud,
  Bot,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Preloader } from '../components/Preloader';
import Lottie from 'lottie-react';
import documentAnimation from '../../animation/document.json';
import botAnimation from '../../animation/Cute Bot Say Users Hello.json';
import safeAnimation from '../../animation/Safe and secure.json';
import cloudAnimation from '../../animation/Cloud Storage Icon Animation.json';
import { Magnetic } from '../components/Magnetic';
import { upgradeUserPlan, getToken, getActivePlans, createVnpayPaymentForPlan, subscribeFreePlan, type SubscriptionPlan } from '../services/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';

import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function formatPlanPrice(price: number) {
  if (!price || price <= 0) return '0đ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

function formatStorage(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 900) return 'Vô hạn';
  return `${Math.round(gb)} GB`;
}

export function LandingPage() {
  const [showPreloader, setShowPreloader] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const userObj = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const initials = (() => {
    const source = userObj.fullName || userObj.email || 'SV';
    const words = source.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  })();

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    const token = getToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập để nâng cấp gói cước!');
      navigate('/login');
      return;
    }

    try {
      setPayingPlanId(plan.id);

      // Gói miễn phí → đăng ký trực tiếp
      if (!plan.price || plan.price <= 0) {
        const data = await subscribeFreePlan(plan.id, plan.code);
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('authChange'));
        }
        toast.success(`Đăng ký gói ${plan.name} thành công!`);
        navigate('/profile');
        return;
      }

      // Gói trả phí → tạo hóa đơn tạm + redirect VNPay
      toast.message(`Đang tạo hóa đơn gói ${plan.name}...`);
      const { paymentUrl, invoice } = await createVnpayPaymentForPlan(plan.id);
      if (invoice) {
        toast.message(`Hóa đơn ${invoice.invoiceCode}: ${Number(invoice.amount).toLocaleString('vi-VN')}₫`);
      }
      if (!paymentUrl) {
        throw new Error('Không nhận được URL thanh toán VNPay.');
      }
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi nâng cấp gói.');
    } finally {
      setPayingPlanId(null);
    }
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getToken()) || localStorage.getItem('isAuthenticated') === 'true');
    setTheme('light');

    getActivePlans()
      .then(setPlans)
      .catch(() => {
        // fallback UI vẫn render nếu API lỗi
      });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const syncAuth = () => {
      setIsLoggedIn(Boolean(getToken()) || localStorage.getItem('isAuthenticated') === 'true');
    };
    window.addEventListener('authChange', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('authChange', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  useGSAP(() => {
    if (showPreloader) return;

    // Hero animations
    gsap.fromTo(
      '.hero-fade',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out' }
    );

    // Feature slides reveal & Parallax images
    if (featureSectionRef.current) {
      const items = featureSectionRef.current.querySelectorAll('.feature-slide');
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      const imgs = featureSectionRef.current.querySelectorAll('.parallax-img');
      imgs.forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }
  }, [showPreloader]);

  return (
    <>
      {showPreloader && (
        <Preloader
          onComplete={() => {
            setShowPreloader(false);
            sessionStorage.setItem('hasSeenIntro', 'true');
          }}
        />
      )}

      <div className="min-h-screen bg-[#f8f9fa] text-[#121214] font-sans selection:bg-[#121214] selection:text-white overflow-x-hidden relative">
        {/* Fine Dotted Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
          style={{
            backgroundImage: 'radial-gradient(#121214 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Soft colorful glow background behind hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-1/4 left-1/4 w-[600px] h-[400px] bg-gradient-to-r from-sky-300 via-indigo-200 to-rose-200 opacity-60 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-orange-100 opacity-40 rounded-full blur-[80px]" />
        </div>

        {/* NAVBAR CONTAINER WITH FIXED POSITION */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-all duration-300">
          <nav className={`w-full transition-all duration-500 flex items-center justify-between px-8 py-3 ${scrolled
              ? 'max-w-5xl bg-white/80 backdrop-blur-xl border border-[#121214]/5 rounded-full shadow-lg'
              : 'max-w-7xl bg-transparent border-b border-transparent'
            }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm font-extrabold tracking-widest text-[#121214] hover:opacity-70 transition-opacity"
              >
                AI STUDY HUB
              </button>
            </div>

            {/* Middle routes / anchors */}
            <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-[#121214]/70 dark:text-stone-300">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#121214] dark:hover:text-white transition-colors"
              >
                Products
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#121214] dark:hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#121214] dark:hover:text-white transition-colors"
              >
                About Us
              </button>

              {isLoggedIn && (
                <>
                  <Link to="/documents" className="hover:text-[#121214] dark:hover:text-white transition-colors">
                    Tài liệu của tôi
                  </Link>
                  <Link to="/chat" className="hover:text-[#121214] dark:hover:text-white transition-colors">
                    AI Chat
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none">
                        <Avatar className="w-8 h-8 border border-[#121214]/10 dark:border-white/10 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer">
                          <AvatarImage src={userObj.avatarUrl || ''} />
                          <AvatarFallback className="bg-zinc-800 text-white text-[10px] font-bold">{initials}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#16141a] border border-zinc-200 dark:border-white/5 rounded-xl shadow-lg">
                      <DropdownMenuItem onSelect={() => navigate('/profile')} className="text-xs font-semibold py-2 cursor-pointer">
                        Hồ sơ
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('/transactions')} className="text-xs font-semibold py-2 cursor-pointer">
                        Lịch sử giao dịch
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleLogout} className="text-xs font-semibold py-2 cursor-pointer text-rose-500 hover:text-rose-650">
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-[#121214]/70 dark:text-stone-400 hover:text-[#121214] dark:hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/login">
                    <Button className="bg-[#121214] dark:bg-white text-white dark:text-black hover:bg-stone-850 dark:hover:bg-stone-100 font-bold text-xs uppercase tracking-wider rounded-full px-6 py-2">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* HERO SECTION */}
        <section ref={heroRef} className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative z-10">
          <div className="max-w-4xl space-y-8">
            <h1 className="hero-fade text-4xl md:text-6xl font-extrabold tracking-tight text-[#121214] leading-[1.1] max-w-3xl mx-auto">
              Accelerate every stage of your document learning
            </h1>

            <p className="hero-fade text-sm md:text-base text-stone-500 max-w-xl mx-auto leading-relaxed">
              Organize, retrieve, and chat with your files using AI. Built for modern students and developers.
            </p>

            <div className="hero-fade flex items-center justify-center gap-4 pt-2">
              <Link to="/login">
                <Button className="bg-[#121214] text-white hover:bg-stone-800 font-bold text-xs uppercase tracking-wider rounded-full px-8 py-3.5 h-auto">
                  Get Started
                </Button>
              </Link>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white border border-[#121214]/10 text-[#121214] hover:bg-stone-50 font-bold text-xs uppercase tracking-wider rounded-full px-8 py-3.5 h-auto shadow-sm transition-all"
              >
                Explore Products
              </button>
            </div>
          </div>

          {/* Trusted Client banner */}
          <div className="hero-fade w-full max-w-5xl mt-24 space-y-6">
            <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">Trusted by 3,000+ professionals worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 select-none">
              <span className="font-extrabold tracking-widest text-sm uppercase">Somewhere.</span>
              <span className="font-extrabold tracking-widest text-sm uppercase">brick</span>
              <span className="font-extrabold tracking-widest text-sm uppercase">VMI</span>
              <span className="font-extrabold tracking-widest text-sm uppercase">AECOM</span>
              <span className="font-extrabold tracking-widest text-sm uppercase">Gensler</span>
              <span className="font-extrabold tracking-widest text-sm uppercase">DBOX</span>
            </div>
          </div>
        </section>

        {/* PRODUCTS / FEATURE SHOWCASE */}
        <section id="products" ref={featureSectionRef} className="py-24 border-t border-[#121214]/[0.03] bg-white relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <div className="inline-flex gap-2.5 items-center justify-center">
                <span className="w-6 h-6 rounded bg-sky-100 flex items-center justify-center text-xs">⚡</span>
                <span className="w-6 h-6 rounded bg-violet-100 flex items-center justify-center text-xs">🅡</span>
                <span className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center text-xs">🅓</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#121214]">Meet the products</h2>
              <p className="text-xs text-stone-400">Pick the tool that fits your needs.</p>
            </div>

            <div className="space-y-36">
              {/* Product 1: Quản lý tài liệu đơn giản */}
              <div className="feature-slide grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                    [ Document Management ]
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#121214] leading-tight">Quản lý tài liệu tối giản & hiệu quả</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Đăng tải, tổ chức và truy xuất mọi loại tài liệu học tập của bạn ở cùng một nơi. Giao diện trực quan giúp bạn tiết kiệm hàng giờ tìm kiếm và sắp xếp thủ công.
                  </p>
                  <Button className="bg-[#121214] hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 py-2.5">
                    Khám phá Kho tài liệu
                  </Button>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-stone-200/60 shadow-xl bg-[#f8f9fa] h-80 flex items-center justify-center p-8">
                  <Lottie animationData={documentAnimation} loop={true} autoplay={true} className="w-full h-full max-w-sm" />
                </div>
              </div>

              {/* Product 2: Chat với AI về tài liệu của bạn */}
              <div className="feature-slide grid md:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-2xl overflow-hidden border border-stone-200/60 shadow-xl bg-[#f8f9fa] h-80 flex items-center justify-center p-8">
                  <Lottie animationData={botAnimation} loop={true} autoplay={true} className="w-full h-full max-w-sm" />
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                    [ AI Chat Companion ]
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#121214] leading-tight">Trò chuyện về tài liệu với AI</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Hỏi đáp thông minh, tóm tắt chương sách, hoặc tra cứu nhanh công thức trực tiếp từ file tài liệu của bạn. Trợ lý AI đồng hành hỗ trợ phân tích tài liệu 24/7.
                  </p>
                  <Button className="bg-violet-600 text-white hover:bg-violet-700 font-bold text-xs uppercase tracking-wider rounded-full px-6 py-2.5">
                    Trò chuyện ngay
                  </Button>
                </div>
              </div>

              {/* Product 3: Tài liệu được bảo mật */}
              <div className="feature-slide grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                    [ Secure Vault ]
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#121214] leading-tight">Bảo mật dữ liệu học tập tuyệt đối</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Tài liệu cá nhân và nghiên cứu của bạn được mã hóa an toàn và bảo vệ quyền riêng tư tuyệt đối trên đám mây. Bạn hoàn toàn làm chủ và kiểm soát dữ liệu học tập của mình.
                  </p>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs uppercase tracking-wider rounded-full px-6 py-2.5">
                    Xem chính sách Bảo mật
                  </Button>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-stone-200/60 shadow-xl bg-[#f8f9fa] h-80 flex items-center justify-center p-8">
                  <Lottie animationData={safeAnimation} loop={true} autoplay={true} className="w-full h-full max-w-sm" />
                </div>
              </div>

              {/* Product 4: Dung lượng lưu trữ đám mây */}
              <div className="feature-slide grid md:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-2xl overflow-hidden border border-stone-200/60 shadow-xl bg-[#f8f9fa] h-80 flex items-center justify-center p-8">
                  <Lottie animationData={cloudAnimation} loop={true} autoplay={true} className="w-full h-full max-w-sm" />
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                    [ Cloud Capacity ]
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#121214] leading-tight">Không gian lưu trữ không giới hạn</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Gom toàn bộ giáo trình, slide bài giảng, bài tập lớn và tài liệu ôn tập của các học kỳ vào một kho lưu trữ đám mây tốc độ cao. Truy cập và học tập mọi lúc mọi nơi.
                  </p>
                  <Button className="bg-sky-600 text-white hover:bg-sky-700 font-bold text-xs uppercase tracking-wider rounded-full px-6 py-2.5">
                    Nâng cấp Dung lượng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 border-t border-[#121214]/[0.03] bg-[#f8f9fa] relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
                [ Simple Plans ]
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#121214]">Pricing Plans</h2>
              <p className="text-xs text-stone-400">Choose the best fit for your study scale.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {(plans.length
                ? plans
                : [
                  {
                    id: 'fallback-basic',
                    code: 'BASIC',
                    name: 'BASIC (FREE)',
                    price: 0,
                    storageLimit: 5 * 1024 * 1024 * 1024,
                    aiQuestionsLimit: 20,
                    aiModel: 'llama3',
                    durationDays: 0,
                    features: ['5 GB dung lượng lưu trữ', '20 lượt hỏi AI', 'Mô hình Llama3 tiêu chuẩn'],
                    isActive: true,
                    sortOrder: 1,
                  },
                  {
                    id: 'fallback-premium',
                    code: 'PREMIUM',
                    name: 'PREMIUM',
                    price: 250000,
                    storageLimit: 10 * 1024 * 1024 * 1024,
                    aiQuestionsLimit: 50,
                    aiModel: 'mistral',
                    durationDays: 30,
                    features: ['10 GB dung lượng lưu trữ', '50 lượt hỏi AI', 'Ưu tiên xử lý nhanh'],
                    isActive: true,
                    sortOrder: 2,
                  },
                  {
                    id: 'fallback-vip',
                    code: 'VIP',
                    name: 'VIP',
                    price: 500000,
                    storageLimit: 50 * 1024 * 1024 * 1024,
                    aiQuestionsLimit: 250,
                    aiModel: 'qwen2.5',
                    durationDays: 30,
                    features: ['50 GB dung lượng lưu trữ', '250 lượt hỏi AI', 'Hỗ trợ ưu tiên 24/7'],
                    isActive: true,
                    sortOrder: 3,
                  },
                  {
                    id: 'fallback-unlimited',
                    code: 'UNLIMITED',
                    name: 'UNLIMITED',
                    price: 1200000,
                    storageLimit: 999 * 1024 * 1024 * 1024,
                    aiQuestionsLimit: 999999,
                    aiModel: 'qwen2.5',
                    durationDays: 30,
                    features: ['Vô hạn dung lượng', 'Không giới hạn lượt hỏi AI', 'Trải nghiệm thoải mái nhất'],
                    isActive: true,
                    sortOrder: 4,
                  },
                ] as SubscriptionPlan[]
              ).map((plan) => {
                const isPopular = plan.code === 'VIP';
                const isUnlimited = plan.code === 'UNLIMITED';
                const isFree = !plan.price || plan.price <= 0;
                const accent =
                  plan.code === 'PREMIUM'
                    ? 'text-indigo-600'
                    : plan.code === 'VIP'
                      ? 'text-indigo-600'
                      : plan.code === 'UNLIMITED'
                        ? 'text-fuchsia-600'
                        : 'text-stone-400';

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm relative ${isPopular ? 'border-2 border-indigo-600/20 shadow-md' : 'border border-[#121214]/5'
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 right-4 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-extrabold uppercase tracking-widest font-mono">
                        POPULAR
                      </div>
                    )}
                    <div className="space-y-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${accent}`}>
                        {plan.name}
                      </span>
                      <div className="text-2xl font-extrabold">
                        {formatPlanPrice(plan.price)}{' '}
                        <span className="text-xs font-normal text-stone-400">/mo</span>
                      </div>
                      <ul className="text-stone-500 text-xs space-y-2 leading-relaxed">
                        {(plan.features?.length
                          ? plan.features
                          : [
                            `${formatStorage(plan.storageLimit)} dung lượng lưu trữ`,
                            `${plan.aiQuestionsLimit >= 999999 ? 'Không giới hạn' : plan.aiQuestionsLimit} lượt hỏi AI`,
                            `Mô hình ${plan.aiModel}`,
                          ]
                        ).map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      disabled={payingPlanId === plan.id || plan.id.startsWith('fallback-')}
                      onClick={() => handleUpgrade(plan)}
                      className={`w-full rounded-full py-2 mt-6 font-bold text-xs ${isUnlimited
                          ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90'
                          : isPopular
                            ? 'bg-[#121214] text-white hover:bg-stone-800 uppercase tracking-wider'
                            : plan.code === 'PREMIUM'
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-white border border-[#121214]/10 text-[#121214] hover:bg-stone-50'
                        }`}
                    >
                      {payingPlanId === plan.id
                        ? 'Đang xử lý...'
                        : isFree
                          ? 'Đăng ký miễn phí'
                          : `Thanh toán ${formatPlanPrice(plan.price)}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about-us" className="py-24 border-t border-[#121214]/[0.03] bg-white relative z-10">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
              [ Our Vision ]
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#121214]">About AI Study Hub</h2>
            <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed">
              We build intelligent educational hubs that allow developers, students, and research teams to upload text modules and query them seamlessly using advanced Large Language Models. Our mission is to accelerate the learning lifecycle.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-[#121214]/[0.03] bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-stone-500">
            <span className="font-extrabold text-xs uppercase tracking-widest text-[#121214]">AI STUDY HUB</span>
            <p className="text-[10px] font-mono">© 2026 AI Study Hub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}