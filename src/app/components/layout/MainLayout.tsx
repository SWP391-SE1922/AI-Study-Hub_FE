import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes'; // Sử dụng thư viện quản lý theme hệ thống
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme(); // Hook lấy trạng thái và hàm thay đổi theme

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Tài liệu', icon: FileText },
    { path: '/ai-chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    // Đồng bộ màu nền gốc: Sáng (slate-50), Tối (#0b0f19)
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors">

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 flex items-center justify-between px-4 lg:px-6 lg:pl-64 transition-colors">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-500 dark:text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo hiển thị trên Mobile */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">AI Study Hub</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* ================= NÚT CHUYỂN CHẾ ĐỘ SÁNG / TỐI (ĐÃ KHÔI PHỤC) ================= */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Đổi giao diện"
          >
            {/* Hiển thị icon Mặt trời nếu là theme dark, ngược lại hiển thị Mặt trăng */}
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {/* ============================================================================ */}

          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
              <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">SV</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sinh viên</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">student@example.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar Layout */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0'}`}>

        <div>
          {/* Logo cố định góc trái trên PC */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 hidden lg:flex">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">AI Study Hub</span>
            </Link>
          </div>

          {/* Menu Điều Hướng */}
          <div className="p-4 space-y-1 lg:mt-2">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu quản lý</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/15' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Nút Đăng xuất */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}