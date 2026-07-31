import { Outlet } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fa] text-[#121214] overflow-x-hidden relative">
      <style>{`
        @keyframes auth-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.98); }
        }
        @keyframes auth-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 15px) scale(1.05); }
          66% { transform: translate(15px, -15px) scale(0.95); }
        }
        @keyframes auth-float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .auth-blob-1 { animation: auth-blob-1 12s ease-in-out infinite; }
        .auth-blob-2 { animation: auth-blob-2 15s ease-in-out infinite; }
        .auth-float-icon { animation: auth-float-icon 4s ease-in-out infinite; }
        .auth-fade-up { animation: auth-fade-up 0.6s ease-out both; }
        .auth-delay-1 { animation-delay: 0.05s; }
        .auth-delay-2 { animation-delay: 0.12s; }
        .auth-delay-3 { animation-delay: 0.20s; }
        .auth-delay-4 { animation-delay: 0.28s; }
        .auth-delay-5 { animation-delay: 0.36s; }
        .auth-delay-6 { animation-delay: 0.44s; }
        .auth-delay-7 { animation-delay: 0.52s; }
        .auth-pulse-dot { animation: auth-pulse-dot 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .auth-blob-1, .auth-blob-2, .auth-float-icon, .auth-fade-up, .auth-pulse-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Dotted Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
           style={{
             backgroundImage: 'radial-gradient(#121214 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden z-10">
        <div className="pointer-events-none absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-60 h-60 bg-rose-100/25 rounded-full blur-3xl" />
        <div className="relative z-10 w-full max-w-md auth-fade-up">
          <Outlet />
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-white border-l border-[#121214]/[0.03] p-16 items-center justify-center relative overflow-hidden z-10">
        {/* Soft colorful glow background behind hero */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="auth-blob-1 absolute -top-10 left-10 w-[400px] h-[300px] bg-gradient-to-r from-sky-200 via-indigo-100 to-rose-100 opacity-60 rounded-full blur-[80px]" />
          <div className="auth-blob-2 absolute bottom-10 right-10 w-[300px] h-[200px] bg-orange-100 opacity-40 rounded-full blur-[70px]" />
        </div>

        <div className="relative z-10 max-w-md text-[#121214]">
          <div className="flex items-center gap-3 mb-10 auth-fade-up auth-delay-1">
            <div className="relative w-10 h-10 bg-[#121214] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white auth-float-icon" />
            </div>
            <span className="text-sm font-extrabold tracking-widest uppercase">AI Study Hub</span>
          </div>

          <h2 className="text-3xl font-extrabold mb-6 leading-[1.25] tracking-tight auth-fade-up auth-delay-2">
            Quản lý tài liệu học tập thông minh
          </h2>

          <p className="text-sm text-stone-500 mb-10 leading-relaxed auth-fade-up auth-delay-3">
            Lưu trữ, tìm kiếm và học tập hiệu quả hơn với sự hỗ trợ của AI trong giao diện thiết kế hiện đại, tinh gọn.
          </p>

          <div className="space-y-6">
            <div className="group flex items-start gap-4 rounded-xl p-3 -m-3 transition-all duration-300 hover:bg-[#f8f9fa] auth-fade-up auth-delay-4">
              <div className="w-9 h-9 bg-[#121214]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#121214]/5 transition-transform duration-300 group-hover:scale-105">
                <BookOpen className="w-4.5 h-4.5 text-stone-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Cloud Storage</h3>
                <p className="text-xs text-stone-500 leading-normal">Lưu trữ tài liệu học tập an toàn và đồng bộ hóa trên đám mây.</p>
              </div>
            </div>

            <div className="group flex items-start gap-4 rounded-xl p-3 -m-3 transition-all duration-300 hover:bg-[#f8f9fa] auth-fade-up auth-delay-5">
              <div className="w-9 h-9 bg-[#121214]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#121214]/5 transition-transform duration-300 group-hover:scale-105">
                <MessageSquare className="w-4.5 h-4.5 text-stone-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">AI Assistant</h3>
                <p className="text-xs text-stone-500 leading-normal">Chatbot AI đồng hành tóm tắt nội dung và giải đáp 24/7.</p>
              </div>
            </div>

            <div className="group flex items-start gap-4 rounded-xl p-3 -m-3 transition-all duration-300 hover:bg-[#f8f9fa] auth-fade-up auth-delay-6">
              <div className="w-9 h-9 bg-[#121214]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#121214]/5 transition-transform duration-300 group-hover:scale-105">
                <ShieldCheck className="w-4.5 h-4.5 text-stone-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Bảo mật dữ liệu</h3>
                <p className="text-xs text-stone-500 leading-normal">Tài liệu cá nhân luôn được bảo mật, mã hóa riêng tư tối đa.</p>
              </div>
            </div>
          </div>

          {/* status strip */}
          <div className="mt-12 flex items-center gap-2 text-[10px] font-mono tracking-widest text-stone-400 uppercase auth-fade-up auth-delay-7">
            <span className="relative flex h-2 w-2">
              <span className="auth-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Hệ thống đang hoạt động ổn định
          </div>
        </div>
      </div>
    </div>
  );
}