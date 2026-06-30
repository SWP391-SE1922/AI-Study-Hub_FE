import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Shield,
  Zap,
  Cloud,
  Search,
  ArrowRight,
  LogOut,
  Sun,
  Moon,
  Users,
  Target,
  Award,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import bannerImg from "../../assets/image/banner.png";

const features = [
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Lưu trữ tài liệu an toàn trên cloud, truy cập mọi lúc mọi nơi'
  },
  {
    icon: Search,
    title: 'Tìm kiếm thông minh',
    description: 'Tìm tài liệu nhanh chóng với công nghệ AI'
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Chatbot AI hỗ trợ học tập 24/7'
  },
  {
    icon: Shield,
    title: 'Bảo mật cao',
    description: 'Dữ liệu được mã hóa và bảo vệ tuyệt đối'
  },
  {
    icon: Zap,
    title: 'Nhanh chóng',
    description: 'Upload và download tốc độ cao'
  },
  {
    icon: BookOpen,
    title: 'Quản lý dễ dàng',
    description: 'Giao diện trực quan, dễ sử dụng'
  }
];

const stats = [
  { value: '10,000+', label: 'Sinh viên tin tưởng' },
  { value: '50,000+', label: 'Tài liệu chia sẻ' },
  { value: '100k+', label: 'Câu hỏi AI giải đáp' },
  { value: '99.9%', label: 'Uptime hệ thống' }
];

const values = [
  {
    icon: <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: "Sứ mệnh định hướng",
    description: "Đơn giản hóa việc quản lý tri thức học tập, giúp sinh viên tiếp cận tài liệu thông minh hơn thông qua sức mạnh của trí tuệ nhân tạo."
  },
  {
    icon: <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    title: "Chất lượng hàng đầu",
    description: "Mọi tài liệu lưu trữ và câu trả lời từ AI Chat đều được tối ưu hóa cấu trúc, mang lại độ chính xác cao nhất cho người học."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    title: "Bảo mật & Chia sẻ",
    description: "Xây dựng môi trường chia sẻ học thuật an toàn, tôn trọng bản quyền cá nhân và nâng cao tinh thần cộng đồng sinh viên."
  }
];

export function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo bên trái */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">AI Study Hub</span>
            </div>

            {/* Cụm nút chức năng bên phải */}
            <div className="flex items-center gap-3">
              {/* Nút chuyển chế độ sáng tối */}
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
                <>
                  {/* <Link to="/login"><Button variant="ghost">Đăng nhập</Button></Link> */}
                  <Link to="/login">
                    <Button className="bg-gradient-to-r from-primary to-secondary">Đăng nhập</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
          <img
            src={bannerImg}
            alt="AI Study Hub Banner"
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
          />
        </div>
      </div>

      {/* 2. HERO SECTION (ĐÃ BỎ CÁC NÚT CTA & ĐỂ CÁC KHỐI SỐ LIỆU ĐI LIỀN MẠCH) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div className="container mx-auto px-3 py-20 md:py-22 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
              <Sparkles className="w-10 h-10 text-primary" />
              
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Chào mừng bạn đến với <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Study Hub</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Lưu trữ, tìm kiếm và học tập với sự hỗ trợ của AI. Mọi tài liệu học tập của bạn ở một nơi, an toàn và dễ dàng truy cập.
            </p>

            {/* Khối thống kê số liệu kết nối liền mạch ngay dưới đoạn text */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/40 mt-12">
              {stats.map((stat, index) => (
                <div key={index}>
                  <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (TÍNH NĂNG) */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">Tính năng nổi bật</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Tất cả công cụ bạn cần để nâng cao và tối ưu tốc độ học tập
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION (GIỚI THIỆU THƯƠNG HIỆU & GIÁ TRỊ CỐT LÕI) */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Users className="w-3.5 h-3.5" /> Câu chuyện hành trình
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Hệ sinh thái kết nối tri thức sinh viên Việt Nam
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Chúng tôi không chỉ dừng lại ở một kho chứa dữ liệu tĩnh. AI Study Hub sinh ra để đem trí tuệ nhân tạo tích hợp sâu vào từng trang tài liệu, bài giảng, hỗ trợ giải đáp trực tiếp 24/7 nhằm san sẻ gánh nặng học thuật, tối ưu hóa điểm số cho sinh viên.
              </p>
            </div>

            {/* Khối giá trị cốt lõi */}
            <div className="space-y-4">
              {values.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-muted/40 rounded-xl border border-border/50">
                  <div className="p-2.5 bg-background rounded-lg border h-fit">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-base">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Sẵn sàng bắt đầu?</h2>
            <p className="text-lg text-white/90">
              Tham gia cùng hàng ngàn sinh viên đang sử dụng AI Study Hub để học tập hiệu quả hơn
            </p>

          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 bg-card border-t border-border w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">AI Study Hub</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 AI Study Hub. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}