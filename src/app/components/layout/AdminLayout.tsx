import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MessageSquare, LogOut, Menu, X, Sun, Moon, Tag } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/95 backdrop-blur z-30 flex items-center justify-between px-4 lg:px-6 lg:pl-64 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/admin" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Admin Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-xl transition-colors relative"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Thay đổi giao diện"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="flex items-center gap-3 border-l border-border pl-4">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">QTV</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-foreground">Quản trị viên</p>
              <p className="text-[10px] text-muted-foreground font-medium">admin@example.com</p>
            </div>
          </div>
        </div>
      </header>

      <aside className={`fixed top-0 bottom-0 left-0 w-64 border-r border-border bg-card text-card-foreground z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0'}`}>
        <div>
          <div className="h-16 items-center px-6 border-b border-border hidden lg:flex">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">Admin Portal</span>
            </Link>
          </div>

          <div className="p-4 space-y-1 lg:mt-2">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menu quản lý</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:text-destructive-foreground hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <main className="pt-16 lg:pl-64 min-h-screen flex flex-col transition-colors duration-300">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
