import { Outlet } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0A1A]">
      <style>{`
        @keyframes auth-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 25px) scale(0.95); }
        }
        @keyframes auth-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35px, 20px) scale(1.08); }
          66% { transform: translate(25px, -25px) scale(0.92); }
        }
        @keyframes auth-blob-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes auth-grid-drift {
          0% { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
        @keyframes auth-shimmer {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes auth-float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .auth-blob-1 { animation: auth-blob-1 14s ease-in-out infinite; }
        .auth-blob-2 { animation: auth-blob-2 17s ease-in-out infinite; }
        .auth-blob-3 { animation: auth-blob-3 10s ease-in-out infinite; }
        .auth-grid { animation: auth-grid-drift 6s linear infinite; }
        .auth-shimmer-text {
          background-image: linear-gradient(110deg, rgba(255,255,255,0.6) 8%, rgba(255,255,255,1) 18%, rgba(255,255,255,0.6) 28%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: auth-shimmer 3.5s linear infinite;
        }
        .auth-float-icon { animation: auth-float-icon 4s ease-in-out infinite; }
        .auth-fade-up { animation: auth-fade-up 0.7s ease-out both; }
        .auth-delay-1 { animation-delay: 0.05s; }
        .auth-delay-2 { animation-delay: 0.15s; }
        .auth-delay-3 { animation-delay: 0.25s; }
        .auth-delay-4 { animation-delay: 0.35s; }
        .auth-delay-5 { animation-delay: 0.45s; }
        .auth-delay-6 { animation-delay: 0.55s; }
        .auth-delay-7 { animation-delay: 0.65s; }
        .auth-pulse-dot { animation: auth-pulse-dot 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .auth-blob-1, .auth-blob-2, .auth-blob-3, .auth-grid, .auth-shimmer-text, .auth-float-icon, .auth-fade-up, .auth-pulse-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* faint ambient glow behind the form so it doesn't feel flat on light bg */}
        <div className="pointer-events-none absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-400/10 dark:bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex w-full justify-center auth-fade-up">
          <Outlet />
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#3B1F7A] via-[#4C1D95] to-[#831843] p-12 items-center justify-center relative overflow-hidden">
        {/* drifting grid texture for depth */}
        <div
          className="auth-grid pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />

        {/* floating glow orbs, animated */}
        <div className="auth-blob-1 pointer-events-none absolute top-10 right-10 w-72 h-72 bg-fuchsia-400/25 rounded-full blur-3xl" />
        <div className="auth-blob-2 pointer-events-none absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/25 rounded-full blur-3xl" />
        <div className="auth-blob-3 pointer-events-none absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-violet-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8 auth-fade-up auth-delay-1">
            <div className="relative w-12 h-12 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center ring-1 ring-white/30 shadow-lg shadow-fuchsia-900/30">
              <Sparkles className="w-6 h-6 auth-float-icon" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Study Hub</h1>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight auth-fade-up auth-delay-2">
            <span className="auth-shimmer-text">Quản lý tài liệu học tập thông minh</span>
          </h2>

          <p className="text-lg text-white/90 mb-8 auth-fade-up auth-delay-3">
            Lưu trữ, tìm kiếm và học tập hiệu quả hơn với sự hỗ trợ của AI
          </p>

          <div className="space-y-4">
            <div className="group flex items-start gap-3 rounded-2xl p-3 -m-3 transition-all duration-300 hover:bg-white/10 hover:translate-x-1 auth-fade-up auth-delay-4">
              <div className="w-8 h-8 bg-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Cloud Storage</h3>
                <p className="text-sm text-white/80">Lưu trữ tài liệu an toàn trên cloud</p>
              </div>
            </div>

            <div className="group flex items-start gap-3 rounded-2xl p-3 -m-3 transition-all duration-300 hover:bg-white/10 hover:translate-x-1 auth-fade-up auth-delay-5">
              <div className="w-8 h-8 bg-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Assistant</h3>
                <p className="text-sm text-white/80">Chatbot AI hỗ trợ học tập 24/7</p>
              </div>
            </div>

            <div className="group flex items-start gap-3 rounded-2xl p-3 -m-3 transition-all duration-300 hover:bg-white/10 hover:translate-x-1 auth-fade-up auth-delay-6">
              <div className="w-8 h-8 bg-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bảo mật dữ liệu</h3>
                <p className="text-sm text-white/80">Tài liệu của bạn luôn được mã hóa và riêng tư</p>
              </div>
            </div>
          </div>

          {/* status strip */}
          <div className="mt-10 flex items-center gap-2 text-xs text-white/70 auth-fade-up auth-delay-7">
            <span className="relative flex h-2 w-2">
              <span className="auth-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-300" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
            </span>
            Hệ thống đang hoạt động ổn định
          </div>
        </div>
      </div>
    </div>
  );
}
