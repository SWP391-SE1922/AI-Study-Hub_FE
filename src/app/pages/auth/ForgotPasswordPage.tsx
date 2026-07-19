import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '../../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setSent(true);
      setMessage(result.message);

      if (result.emailSent === false) {
        toast.warning('Chưa gửi được mail thật. Kiểm tra SMTP trong .env hoặc xem link test ở terminal BE.');
      } else {
        toast.success(result.message || 'Email khôi phục đã được gửi!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi email khôi phục');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border border-[#121214]/10 text-[#121214] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#121214]/20 focus:border-[#121214]/30 transition-all text-xs font-semibold placeholder:text-stone-400";

  return (
    <div className="w-full max-w-[380px] mx-auto bg-white rounded-[40px] shadow-2xl border border-[#121214]/5 p-10 flex flex-col justify-center">
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#121214] rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[#121214] tracking-tight">Quên mật khẩu</h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-mono">
            Nhập email để khôi phục
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#121214] hover:bg-stone-800 text-white font-bold rounded-full shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-70"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-stone-500 hover:text-[#121214] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-stone-50 border border-[#121214]/5 rounded-2xl">
              <p className="text-sm text-[#121214] font-medium leading-relaxed">
                Đã xử lý yêu cầu cho email <br/>
                <strong className="text-stone-500">{email}</strong>
              </p>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              {message || 'Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.'}
            </p>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">
              Nếu không nhận được, hãy kiểm tra mục Spam.
            </p>
            <div className="pt-2">
              <Link to="/login" className="block">
                <button className="w-full py-3.5 bg-white border border-[#121214]/10 hover:bg-stone-50 text-[#121214] font-bold rounded-full shadow-sm transition-all text-xs uppercase tracking-wider">
                  Quay lại đăng nhập
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
