import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';

/* ----------------------------------------------------------------------
   CONTENT — lấy đúng theo brief dự án (AI Study Hub)
---------------------------------------------------------------------- */

const scatteredSources = [
  { label: 'Google Drive', icon: HardDrive },
  { label: 'Messenger', icon: MessageSquare },
  { label: 'Facebook Group', icon: Users2 },
  { label: 'Email', icon: Mail },
  { label: 'USB cá nhân', icon: FileText },
];

const catalogModules = [
  {
    code: 'MỤC 01',
    icon: KeyRound,
    title: 'Authentication',
    description: 'Đăng ký, đăng nhập, quên mật khẩu và cập nhật hồ sơ — một tài khoản cho toàn bộ tài liệu của bạn.',
  },
  {
    code: 'MỤC 02',
    icon: FolderOpen,
    title: 'Document Management',
    description: 'Upload, xem, tải xuống, chỉnh sửa, tìm kiếm và lọc tài liệu theo môn học chỉ trong vài giây.',
  },
  {
    code: 'MỤC 03',
    icon: UploadCloud,
    title: 'Cloud Storage',
    description: 'Tài liệu được đẩy lên cloud, theo dõi trạng thái upload và preview trực tiếp không cần tải về.',
  },
  {
    code: 'MỤC 04',
    icon: Bot,
    title: 'AI Chatbot',
    description: 'Hỏi đáp trực tiếp về nội dung tài liệu, nhận câu trả lời từ AI và xem lại lịch sử trò chuyện.',
  },
];

const problems = [
  'Tài liệu nằm rải rác ở Drive, Messenger, Email, USB cá nhân',
  'Khó tìm lại tài liệu cũ, không có hệ thống phân loại rõ ràng',
  'Không thể hỏi nhanh nội dung tài liệu khi cần gấp',
  'Chia sẻ tài liệu giữa sinh viên còn thủ công, dung lượng máy hạn chế',
];

const outcomes = [
  'Quản lý tài liệu học tập tập trung tại một nơi duy nhất',
  'Giảm thất lạc, tăng khả năng tìm kiếm và truy cập tài liệu',
  'Tạo môi trường chia sẻ tài liệu thuận tiện giữa sinh viên',
  'Ứng dụng AI chatbot hỗ trợ giải đáp nội dung học tập 24/7',
];

const stats = [
  { value: '10,000+', label: 'Sinh viên tin tưởng' },
  { value: '50,000+', label: 'Tài liệu đã lưu trữ' },
  { value: '100k+', label: 'Câu hỏi AI giải đáp' },
  { value: '99.9%', label: 'Uptime hệ thống' },
];

/* ----------------------------------------------------------------------
   COMPONENT
---------------------------------------------------------------------- */

export function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    let frame: number;
    const target = 48213;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDocCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  const scrollToFeatures = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      <style>{`
        @keyframes converge-1 { 0% { transform: translate(-280px,-180px) rotate(-14deg); opacity:0; } 12% { opacity:1; } 55%,100% { transform: translate(0,0) rotate(0deg); opacity:0; } }
        @keyframes converge-2 { 0% { transform: translate(290px,-140px) rotate(10deg); opacity:0; } 12% { opacity:1; } 55%,100% { transform: translate(0,0) rotate(0deg); opacity:0; } }
        @keyframes converge-3 { 0% { transform: translate(-230px,200px) rotate(8deg); opacity:0; } 12% { opacity:1; } 55%,100% { transform: translate(0,0) rotate(0deg); opacity:0; } }
        @keyframes converge-4 { 0% { transform: translate(260px,210px) rotate(-9deg); opacity:0; } 12% { opacity:1; } 55%,100% { transform: translate(0,0) rotate(0deg); opacity:0; } }
        @keyframes converge-5 { 0% { transform: translate(0,-300px) rotate(3deg); opacity:0; } 12% { opacity:1; } 55%,100% { transform: translate(0,0) rotate(0deg); opacity:0; } }
        .anim-c1 { animation: converge-1 5.5s ease-in-out infinite; }
        .anim-c2 { animation: converge-2 5.5s ease-in-out infinite 1.1s; }
        .anim-c3 { animation: converge-3 5.5s ease-in-out infinite 2.2s; }
        .anim-c4 { animation: converge-4 5.5s ease-in-out infinite 3.3s; }
        .anim-c5 { animation: converge-5 5.5s ease-in-out infinite 4.4s; }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.35); } 100% { box-shadow: 0 0 0 28px rgba(139,92,246,0); } }
        .pulse-core { animation: pulse-ring 2.4s ease-out infinite; }
        @keyframes drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .drift { animation: drift 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-c1,.anim-c2,.anim-c3,.anim-c4,.anim-c5,.pulse-core,.drift { animation: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">AI Study Hub</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-xl"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {isLoggedIn ? (
                <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </Button>
              ) : (
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO — tài liệu rải rác hội tụ vào một kho duy nhất */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="container mx-auto px-4 py-20 md:py-28 relative grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-full text-xs font-medium tracking-wide uppercase text-primary">
              Hệ thống quản lý tài liệu học tập AI
            </div>

            <h1 className="text-4xl md:text-[3.3rem] font-extrabold leading-[1.12] tracking-tight">
              Tài liệu của bạn,
              <br />
              từ <span className="text-muted-foreground line-through decoration-2">rải rác</span>{' '}
              đến{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                một nơi duy nhất
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Drive, Messenger, Facebook Group, Email, USB — gom hết về AI Study Hub.
              Lưu trữ trên cloud, tìm kiếm tức thì và hỏi đáp trực tiếp với AI ngay trên tài liệu của bạn.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl px-6 h-11 group">
                  Bắt đầu lưu trữ
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={scrollToFeatures}
                className="border-border rounded-xl px-6 h-11 bg-transparent hover:bg-muted"
              >
                Xem mục lục tính năng
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-primary tabular-nums">{docCount.toLocaleString('vi-VN')}</span>
              <span>tài liệu đang được lưu trữ ngay lúc này</span>
            </div>
          </div>

          {/* Right: convergence animation */}
          <div className="relative h-[560px] flex items-center justify-center">
            <div className="relative w-[420px] h-[420px] flex items-center justify-center">
              {/* center hub */}
              <div className="pulse-core drift relative z-10 w-40 h-40 rounded-3xl bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center shadow-2xl">
                <Cloud className="w-11 h-11 text-white" />
                <span className="text-xs font-bold text-white mt-2 tracking-wide">
                  STUDY HUB
                </span>
              </div>

              {/* scattered source chips converging */}
              {scatteredSources.map((src, i) => {
                const Icon = src.icon;
                const animClass = `anim-c${i + 1}`;
                return (
                  <div
                    key={src.label}
                    className={`absolute z-0 ${animClass} flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-md text-sm font-medium whitespace-nowrap text-foreground`}
                  >
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    {src.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-border/60">
            {stats.map((stat) => (
              <div key={stat.label}>
                <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM -> OUTCOME */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10">
          <div className="bg-card border border-border rounded-2xl p-8">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Trước AI Study Hub
            </span>
            <h3 className="text-2xl font-bold mt-2 mb-6">
              Việc học gián đoạn vì tài liệu thất lạc
            </h3>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/30 rounded-2xl p-8">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Với AI Study Hub
            </span>
            <h3 className="text-2xl font-bold mt-2 mb-6">
              Một hệ thống, mọi tài liệu, mọi câu hỏi
            </h3>
            <ul className="space-y-4">
              {outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 text-sm text-foreground">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CATALOG / FEATURES — đánh số theo đúng 4 module thật của hệ thống */}
      <section id="catalog" className="py-20 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-14 max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Mục lục hệ thống
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              4 module dựng nên AI Study Hub
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              Từ đăng nhập đến hỏi đáp AI — mỗi module được thiết kế để giải quyết một bước trong hành trình quản lý tài liệu của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {catalogModules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.code} className="bg-card p-8 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold text-muted-foreground tracking-widest">
                      {m.code}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUPPORTING FEATURES STRIP */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4 grid sm:grid-cols-3 gap-6">
          {[
            { icon: Search, title: 'Tìm kiếm thông minh', desc: 'Lọc tài liệu theo môn học, tìm ra thứ cần trong vài giây.' },
            { icon: MessageSquare, title: 'AI hỏi đáp 24/7', desc: 'Hỏi trực tiếp nội dung tài liệu, không cần đọc lại từ đầu.' },
            { icon: Shield, title: 'Bảo mật & bản quyền', desc: 'Dữ liệu mã hóa, tôn trọng quyền sở hữu tài liệu cá nhân.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <BookOpen className="w-9 h-9 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Sẵn sàng gom tài liệu về một nơi?
            </h2>
            <p className="text-muted-foreground">
              Tham gia cùng hàng ngàn sinh viên đang dùng AI Study Hub để học tập hiệu quả hơn mỗi ngày.
            </p>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl px-7 h-11">
                Tạo tài khoản miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-border bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">AI Study Hub</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 AI Study Hub. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}