import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MessageSquare, LogOut, Menu, X, Sun, Moon, Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard, exact: true },
    { path: '/admin/users', label: 'Quản lý User', icon: Users },
    { path: '/admin/documents', label: 'Quản lý Tài liệu', icon: FileText },
    { path: '/admin/category', label: 'Quản lý Danh mục', icon: Tag },
    { path: '/admin/aichat', label: 'AI Chat Admin', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0A1A] text-foreground transition-colors duration-300">
      {/* Local keyframes for the ambient / hover effects below */}
      <style>{`
        @keyframes admin-blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, 14px) scale(1.12); }
        }
        @keyframes admin-blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-14px, -10px) scale(1.08); }
        }
        @keyframes admin-shimmer {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes admin-border-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes admin-pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          80%, 100% { transform: scale(1.6); opacity: 0; }
        }
        .admin-blob-1 { animation: admin-blob-float-1 9s ease-in-out infinite; }
        .admin-blob-2 { animation: admin-blob-float-2 11s ease-in-out infinite; }
        .admin-active-shimmer {
          background-image: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: admin-shimmer 2.6s ease-in-out infinite;
        }
        .admin-header-glow {
          background-image: linear-gradient(90deg, transparent, rgba(167,139,250,0.55), rgba(217,70,239,0.45), transparent);
          background-size: 200% 100%;
          animation: admin-shimmer 6s linear infinite;
        }
        .admin-status-ping {
          animation: admin-pulse-ring 1.8s cubic-bezier(0,0,0.2,1) infinite;
        }
        .admin-logo-ring {
          animation: admin-border-glow 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-blob-1, .admin-blob-2, .admin-active-shimmer, .admin-header-glow, .admin-status-ping, .admin-logo-ring {
            animation: none !important;
          }
        }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-[#0B0A1A]/80 backdrop-blur-md z-30 flex items-center justify-between px-4 lg:px-7 lg:pl-72 transition-colors duration-300">
        {/* subtle animated gradient hairline along the very top of the header */}
        <div className="admin-header-glow pointer-events-none absolute top-0 left-0 right-0 h-px opacity-70" />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/admin" className="group flex items-center gap-2.5 lg:hidden">
            <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">Admin Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-4">
            <div className="relative">
              <Avatar className="w-9 h-9 ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0A1A] transition-shadow duration-300 hover:shadow-[0_0_18px_-2px_rgba(139,92,246,0.6)]">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">QTV</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0A1A]" />
              <span className="admin-status-ping absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-foreground">Quản trị viên</p>
              <p className="text-[10px] text-muted-foreground font-medium">admin@example.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 ease-out flex flex-col justify-between
        bg-gradient-to-b from-[#1B1140] via-[#15102E] to-[#0B0A1A] text-slate-200
        shadow-2xl shadow-black/40 overflow-hidden
        ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0'}`}
      >
        {/* ambient glow accents, now gently floating */}
        <div className="admin-blob-1 pointer-events-none absolute -top-24 -left-16 w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl" />
        <div className="admin-blob-2 pointer-events-none absolute bottom-24 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="h-16 items-center px-6 border-b border-white/10 hidden lg:flex">
            <Link to="/admin" className="group flex items-center gap-2.5">
              <div className="relative">
                <div className="admin-logo-ring absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 blur-md opacity-60" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">Admin Portal</span>
            </Link>
          </div>

          <div className="p-4 space-y-1.5 lg:mt-3">
            <div className="flex items-center justify-between lg:hidden mb-4 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menu quản lý</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="hidden lg:block px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Quản trị</p>

            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                  <span
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                    ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30 translate-x-0.5'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1 hover:shadow-[0_0_18px_-6px_rgba(167,139,250,0.6)]'
                      }`}
                  >
                    {/* active-state left indicator bar */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-white/90 transition-all duration-300 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                        }`}
                    />
                    {/* moving shimmer highlight on the active pill */}
                    {isActive && <span className="admin-active-shimmer absolute inset-0 pointer-events-none" />}

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