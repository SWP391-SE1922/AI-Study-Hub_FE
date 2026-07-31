import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { login, register, saveAuth, loginGoogle } from '../../services/api';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  // Login State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phoneNumber: '', password: '' });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoginLoading(true);
      try {
        const data = await loginGoogle(tokenResponse.access_token);
        saveAuth(data);
        toast.success('Đăng nhập Google thành công!');
        const from = (location.state as any)?.from?.pathname || '/documents';
        navigate(from, { replace: true });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Đăng nhập Google thất bại');
      } finally {
        setLoginLoading(false);
      }
    },
    onError: () => toast.error('Đăng nhập Google bị hủy hoặc có lỗi xảy ra'),
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await login(loginForm.email, loginForm.password);
      saveAuth(data);
      toast.success('Đăng nhập thành công!');
      const from = (location.state as any)?.from?.pathname || '/documents';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.phoneNumber);
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setIsLogin(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đăng ký');
    } finally {
      setRegisterLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border border-[#121214]/10 text-[#121214] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#121214]/20 focus:border-[#121214]/30 transition-all text-xs font-semibold placeholder:text-stone-400";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden font-sans selection:bg-[#121214] selection:text-white">
      
      {/* Fine Dotted Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]"
           style={{
             backgroundImage: 'radial-gradient(#121214 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {/* Background blobs matching Landing Page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-sky-300 via-indigo-200 to-rose-200 opacity-40 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl mx-auto h-[80vh] min-h-[600px] relative overflow-hidden bg-white rounded-[40px] shadow-2xl border border-[#121214]/5 flex items-center justify-center z-10">

      {/* ---------------- LOGIN PANEL ---------------- */}
      <motion.div
        className="absolute top-0 left-0 w-full md:w-1/2 h-full p-10 flex flex-col justify-center z-10 bg-white"
        initial={false}
        animate={{
          opacity: isLogin ? 1 : 0,
          zIndex: isLogin ? 20 : 10,
          pointerEvents: isLogin ? 'auto' : 'none'
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div className="max-w-[320px] w-full mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-[#121214] tracking-tight">Sign in</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-mono">Or use your email account</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-[#121214] transition-colors"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/forgot-password" className="text-[11px] font-bold text-stone-500 hover:text-[#121214] transition-colors border-b border-stone-300 pb-0.5">
                Forgot your password?
              </Link>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loginLoading}
                className="py-3.5 px-12 bg-[#121214] hover:bg-stone-800 text-white font-bold rounded-full shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-70"
              >
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="flex items-center w-full gap-2 text-stone-400">
                <div className="h-px w-full bg-[#121214]/10"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest">OR</span>
                <div className="h-px w-full bg-[#121214]/10"></div>
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full py-3 px-4 bg-white border border-[#121214]/10 hover:bg-stone-50 text-[#121214] font-bold rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-70"
                disabled={loginLoading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
            
            {/* Mobile Toggle */}
            <div className="md:hidden text-center pt-6">
              <p className="text-xs text-stone-500 font-medium">Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="font-bold text-[#121214] underline">Sign Up</button></p>
            </div>
          </form>
        </div>
      </motion.div>

      {/* ---------------- REGISTER PANEL ---------------- */}
      <motion.div
        className="absolute top-0 left-0 md:left-auto md:right-0 w-full md:w-1/2 h-full p-10 flex flex-col justify-center z-10 bg-white"
        initial={false}
        animate={{
          opacity: isLogin ? 0 : 1,
          zIndex: isLogin ? 10 : 20,
          pointerEvents: isLogin ? 'none' : 'auto'
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div className="max-w-[320px] w-full mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-[#121214] tracking-tight">Create Account</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-mono">Or use email for registration</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={registerForm.phoneNumber}
                onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-[#121214] transition-colors"
              >
                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={registerLoading}
                className="py-3.5 px-12 bg-[#121214] hover:bg-stone-800 text-white font-bold rounded-full shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-70"
              >
                {registerLoading ? 'Signing up...' : 'Sign Up'}
              </button>
              
              <div className="flex items-center w-full gap-2 text-stone-400">
                <div className="h-px w-full bg-[#121214]/10"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest">OR</span>
                <div className="h-px w-full bg-[#121214]/10"></div>
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full py-3 px-4 bg-white border border-[#121214]/10 hover:bg-stone-50 text-[#121214] font-bold rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-70"
                disabled={registerLoading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
            
            {/* Mobile Toggle */}
            <div className="md:hidden text-center pt-4">
              <p className="text-xs text-stone-500 font-medium">Already have an account? <button type="button" onClick={() => setIsLogin(true)} className="font-bold text-[#121214] underline">Sign In</button></p>
            </div>
          </form>
        </div>
      </motion.div>

      {/* ---------------- SLIDING OVERLAY PANEL (Desktop Only) ---------------- */}
      <motion.div
        className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full bg-[#121214] overflow-hidden z-30 shadow-2xl"
        initial={false}
        animate={{
          x: isLogin ? 0 : '-100%',
          borderTopLeftRadius: isLogin ? '0px' : '40px',
          borderBottomLeftRadius: isLogin ? '0px' : '40px',
          borderTopRightRadius: isLogin ? '40px' : '0px',
          borderBottomRightRadius: isLogin ? '40px' : '0px',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Subtle background circles for decoration in the overlay */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

        <motion.div 
          className="relative w-[200%] h-full flex"
          initial={false}
          animate={{ x: isLogin ? '-50%' : '0%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          
          {/* Overlay Login Panel (Shown when Registering) */}
          <div
            className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center"
          >
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Hello Friend!</h2>
            <p className="text-sm text-stone-400 font-medium mb-10 max-w-[250px] leading-relaxed">
              Already have an account? Log in to continue your learning journey.
            </p>
            <button
              onClick={() => setIsLogin(true)}
              className="py-3.5 px-12 bg-transparent text-white font-bold rounded-full border border-white/20 hover:bg-white hover:text-[#121214] transition-all text-xs uppercase tracking-wider"
            >
              Sign In
            </button>
          </div>

          {/* Overlay Register Panel (Shown when Logging in) */}
          <div
            className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center"
          >
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Welcome Back!</h2>
            <p className="text-sm text-stone-400 font-medium mb-10 max-w-[250px] leading-relaxed">
              Don't have an account yet? Join us today to start your journey.
            </p>
            <button
              onClick={() => setIsLogin(false)}
              className="py-3.5 px-12 bg-white text-[#121214] font-bold rounded-full shadow-lg hover:bg-stone-200 transition-all text-xs uppercase tracking-wider"
            >
              Sign Up
            </button>
          </div>

        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
