import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { login, saveAuth } from '../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập từ api.ts
      const responseData = await login(email, password);

      if (!responseData) {
        throw new Error('Không nhận được phản hồi từ máy chủ.');
      }

      // 2. BÓC TÁCH THÔNG MINH: Tự động tìm Token ở mọi cấp độ cấu trúc dữ liệu
      let token = (responseData as any).token;
      let user = (responseData as any).user;

      // Nếu cấu trúc bị bọc trong lớp .data (ví dụ: responseData.data.token)
      if (!token && (responseData as any).data) {
        token = (responseData as any).data.token;
        user = (responseData as any).data.user;
      }

      const finalAuthData = { token, user };

      // 3. Kiểm tra điều kiện nghiêm ngặt trước khi lưu và chuyển trang
      if (!finalAuthData.token) {
        console.error("Dữ liệu nhận được bị sai cấu trúc:", responseData);
        throw new Error('Dữ liệu xác thực bị thiếu hoặc không hợp lệ (Không tìm thấy Token).');
      }

      // 4. Lưu thông tin đăng nhập vào localStorage
      saveAuth(finalAuthData);

      toast.success('Đăng nhập thành công!');

      // 5. Điều hướng theo quyền hạn của tài khoản
      const userRole = finalAuthData.user?.role;
      navigate(userRole === 'ADMIN' ? '/admin' : '/dashboard');

    } catch (error) {
      console.error("Lỗi đăng nhập chi tiết:", error);
      toast.error(error instanceof Error ? error.message : 'Không thể đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Backend hiện chưa có API đăng nhập Google. Vui lòng dùng email và mật khẩu.');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6">

      {/* Tiêu đề chào mừng */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Enter your email and password to access your account.
        </p>
      </div>

      {/* Biểu mẫu đăng nhập */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="sv1@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm placeholder:text-slate-400 font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm placeholder:text-slate-400 font-medium shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Khối Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
            />
            <span>Remember Me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-bold text-violet-600 hover:text-violet-500 transition-colors">
            Forgot Your Password?
          </Link>
        </div>

        {/* Nút Đăng nhập chính */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {loading ? 'Đang đăng nhập...' : 'Log In'}
        </button>
      </form>

      {/* Đường gạch phân cách "Or Login With" */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-300"></div>
        <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Or Login With</span>
        <div className="flex-grow border-t border-slate-300"></div>
      </div>

      {/* Nút Đăng nhập Google - ĐÃ ĐƯỢC CHUẨN HÓA LOGO GỐC CHUẨN BỐN MÀU */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.766 12.2764c0-.9175-.0764-1.7935-.2109-2.6541H12.24v5.0207h6.4909c-.2891 1.5309-1.1636 2.8283-2.4746 3.7011v3.0973h4.0027c2.3505-2.1652 3.7059-5.3585 3.7059-9.165z"
          />
          <path
            fill="#34A853"
            d="M12.24 24c3.3055 0 6.0764-1.0947 8.1018-2.9673l-4.0027-3.0973c-1.1073.7404-2.5327 1.1782-4.099 1.1782-3.1546 0-5.8218-2.1291-6.7746-4.9905H1.34v3.1937C3.3564 21.5013 7.4818 24 12.24 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.4655 14.3236c-.2455-.7405-.3855-1.5309-.3855-2.3236s.14-1.5831.3855-2.3236V6.4827H1.34C.4855 8.1809 0 10.0273 0 12s.4855 3.8191 1.34 5.5173l4.1255-3.1937z"
          />
          <path
            fill="#EA4335"
            d="M12.24 4.7503c1.7973 0 3.4128.6178 4.6836 1.8281l3.5127-3.5127C18.3095 1.1868 15.5427 0 12.24 0 7.4818 0 3.3564 2.4986 1.34 6.4827l4.1255 3.1937c.9527-2.8614 3.62-4.9905 6.7745-4.9905z"
          />
        </svg>
        <span>Google</span>
      </button>

      {/* Dòng chuyển hướng Đăng ký tài khoản */}
      <p className="text-center text-sm text-slate-500">
        Don't Have An Account?{' '}
        <Link to="/register" className="font-extrabold text-violet-600 hover:text-violet-500 underline-offset-2 hover:underline transition-all">
          Register Now.
        </Link>
      </p>

    </div>
  );
}