import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, Tag, BookOpen, ShieldCheck, DollarSign, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  const adminMenuGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { path: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard, exact: true },
        { path: '/admin/users', label: 'Quản lý User', icon: Users },
        { path: '/admin/finance', label: 'Quản lý Tài chính', icon: DollarSign },
        { path: '/admin/plans', label: 'Quản lý Gói đăng ký', icon: Package },
      ],
    },
    {
      title: 'QUẢN LÝ NỘI DUNG',
      items: [
        { path: '/admin/subjects', label: 'Quản lý Môn học', icon: BookOpen },
        { path: '/admin/category', label: 'Quản lý Danh mục', icon: Tag },
        { path: '/admin/documents', label: 'Quản lý Tài liệu', icon: FileText },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#121214] transition-colors duration-300 font-sans selection:bg-[#121214] selection:text-white relative overflow-x-hidden">
      
      {/* Fine Dotted Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.4] z-0"
           style={{
             backgroundImage: 'radial-gradient(#121214 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#121214]/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-[#121214]/5 bg-white/90 backdrop-blur-md z-30 flex items-center justify-between px-4 lg:px-7 lg:pl-[288px] transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-stone-500 hover:text-[#121214] hover:bg-stone-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/admin" className="group flex items-center gap-2.5 lg:hidden">
            <div className="relative w-8 h-8 bg-[#121214] rounded flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-[#121214] text-lg uppercase">Admin Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-[#121214]/10">
            <div className="relative">
              <Avatar className="w-9 h-9 border border-[#121214]/10 hover:ring-2 hover:ring-[#121214]/20 transition-all cursor-pointer">
                <AvatarFallback className="bg-[#121214] text-white text-[10px] font-bold">QTV</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#121214]">Quản trị viên</p>
              <p className="text-[10px] text-stone-400 font-mono">admin@example.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 transform lg:transform-none transition-all duration-300 ease-out flex flex-col justify-between
        bg-white text-[#121214] border-r border-[#121214]/5 shadow-xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-[#121214]/5 hidden lg:flex">
            <Link to="/admin" className="group flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#121214] rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight uppercase">Admin Portal</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 lg:mt-2">
            <div className="flex items-center justify-between lg:hidden mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">Menu quản lý</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-stone-500 hover:text-[#121214] hover:bg-stone-100" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {adminMenuGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">{group.title}</p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                      <span
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all duration-200 relative overflow-hidden
                        ${isActive
                            ? 'bg-[#121214] text-white shadow-md'
                            : 'text-stone-500 hover:text-[#121214] hover:bg-stone-100'
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative">{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="relative z-10 p-4 border-t border-[#121214]/5">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="group w-full justify-start gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      <main className="pt-16 lg:pl-72 min-h-screen flex flex-col transition-all duration-300 relative z-10">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}