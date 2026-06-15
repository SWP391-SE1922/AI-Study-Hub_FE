import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Award, ShieldCheck, ArrowRight, MessageSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';

export function AboutPage() {
    const { theme, setTheme } = useTheme();

    const stats = [
        { label: 'Người dùng tin tưởng', value: '10,000+' },
        { label: 'Tài liệu chia sẻ', value: '50,000+' },
        { label: 'Câu hỏi AI giải đáp', value: '100k+' },
        { label: 'Trường đại học kết nối', value: '20+' },
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
            description: "Xây dựng môi trường chia sẻ học thuật an toàn, tôn trọng bản quyền cá nhân và nâng cao tinh thần cộng đồng sinh viên Việt Nam."
        }
    ];

    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300">

            {/* 1. THANH HEADER NGANG ĐỒNG BỘ TRANG CHỦ */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">AI Study Hub</span>
                    </Link>

                    {/* Menu Điều hướng */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
                        <a href="/#features" className="hover:text-indigo-600 transition-colors">Tính năng</a>
                        <a href="/#pricing" className="hover:text-indigo-600 transition-colors">Giá cả</a>
                        <Link to="/about" className="text-indigo-600 dark:text-indigo-400 font-semibold">Về chúng tôi</Link>
                    </nav>

                    {/* Cụm nút chức năng bên phải */}
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-xl"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        <Link to="/login">
                            <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs px-4 py-2 font-semibold shadow-md shadow-indigo-600/10">
                                Bắt đầu miễn phí
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. NỘI DUNG CHÍNH CỦA TRANG ABOUT */}
            <div className="flex-1 space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
                        Về chúng tôi
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Nâng tầm tri thức học tập cùng <span className="text-indigo-600 dark:text-indigo-400">AI Study Hub</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
                        Chúng tôi là nền tảng công nghệ tiên phong đem AI tích hợp sâu vào quy trình quản lý, tìm kiếm và phân tích tài liệu dành riêng cho cộng đồng sinh viên.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Our Value Section */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight">Giá trị cốt lõi của chúng tôi</h2>
                        <p className="text-sm text-muted-foreground mt-1">Nền tảng vững chắc làm nên sự khác biệt</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {values.map((item, idx) => (
                            <div key={idx} className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-indigo-500/30 transition-all flex flex-col justify-between shadow-sm group">
                                <div className="space-y-3">
                                    <div className="p-3 bg-background border border-border rounded-xl w-fit shadow-inner group-hover:scale-105 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-indigo-600/10 space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Sẵn sàng trải nghiệm phương pháp học tập mới?
                    </h2>
                    <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base">
                        Tham gia cùng hàng nghìn sinh viên khác tối ưu hóa điểm số và thời gian nghiên cứu tài liệu ngay hôm nay.
                    </p>
                    <div className="pt-2 flex justify-center gap-4">
                        <Link to="/register">
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-6 py-2.5 font-semibold shadow-md gap-2 border-none">
                                Bắt đầu miễn phí
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 3. FOOTER GỐC CŨ (ĐƯỢC ĐƯA VÀO ĐÂY ĐỂ ĐỒNG BỘ VỚI TRANG CHỦ) */}
            <footer className="border-t border-border bg-card py-12 text-sm text-muted-foreground mt-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            AI
                        </div>
                        <span className="font-semibold text-foreground">AI Study Hub</span>
                    </div>
                    <p className="text-xs">© 2024 AI Study Hub. All rights reserved.</p>
                    <div className="flex gap-6 text-xs">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}