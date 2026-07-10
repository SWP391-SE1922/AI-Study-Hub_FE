import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
// @ts-ignore
import confetti from 'canvas-confetti';

interface PaymentResultProps {
  status?: 'success' | 'failed';
}

export function PaymentResult({ status: propStatus }: PaymentResultProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Lấy các tham số từ URL do VNPay trả về
  const code = searchParams.get('code');
  const txnRef = searchParams.get('txnRef') || searchParams.get('orderCode') || 'N/A';
  const amountParam = searchParams.get('amount');
  const method = searchParams.get('method') || 'VNPAY';
  const message = searchParams.get('message');

  // Xác định trạng thái cuối cùng (dựa trên prop hoặc query param code)
  const isSuccess = propStatus === 'success' || code === '00';
  const amount = amountParam ? parseInt(amountParam).toLocaleString('vi-VN') + ' ₫' : 'N/A';

  useEffect(() => {
    // Giả lập hiệu ứng tải thông tin giao dịch nhẹ nhàng
    const timer = setTimeout(() => {
      setLoading(false);
      if (isSuccess) {
        // Hiệu ứng pháo hoa confetti ăn mừng nâng cấp Pro thành công
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // since particles fall down, start a bit higher than random
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isSuccess]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Đang xử lý kết quả giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-1">
      <style>{`
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ring-glow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.08); opacity: 0.4; }
        }
        .animate-float-badge { animation: float-badge 3s ease-in-out infinite; }
        .animate-ring-glow { animation: ring-glow 2s ease-in-out infinite; }
      `}</style>

      <div className="relative bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Decorative ambient background glow */}
        {isSuccess ? (
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        ) : (
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
        )}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Circular Icon Area */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {isSuccess ? (
              <>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ring-glow" />
                <div className="w-18 h-18 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ring-glow" />
                <div className="w-18 h-18 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
              </>
            )}
          </div>

          {/* Status Title & Message */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isSuccess 
                ? 'Chúc mừng! Tài khoản của bạn đã được nâng cấp dung lượng lưu trữ thành công. Bạn hiện có thể tải lên thêm nhiều tài liệu học tập.' 
                : message || 'Giao dịch thanh toán đã bị hủy hoặc không thành công. Bạn vui lòng thử lại hoặc chọn hình thức thanh toán khác.'}
            </p>
          </div>

          {/* Transaction Invoice Detail Block */}
          <div className="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 sm:p-6 text-left space-y-3.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/50">Thông tin giao dịch</h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
              <span className="text-muted-foreground font-medium">Mã giao dịch:</span>
              <span className="font-semibold text-right truncate select-all">{txnRef}</span>

              <span className="text-muted-foreground font-medium">Số tiền thanh toán:</span>
              <span className="font-bold text-right text-foreground">{amount}</span>

              <span className="text-muted-foreground font-medium">Phương thức:</span>
              <span className="font-semibold text-right text-indigo-500 dark:text-indigo-400">{method}</span>

              <span className="text-muted-foreground font-medium">Trạng thái:</span>
              <span className={`font-bold text-right ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isSuccess ? 'Thành công' : 'Thất bại'}
              </span>
            </div>
          </div>

          {/* Pro Benefits Card (Only if Success) */}
          {isSuccess && (
            <div className="w-full border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-5 flex items-center gap-4 text-left animate-float-badge">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Đã tăng dung lượng lưu trữ
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md tracking-wider">ACTIVE</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tài khoản của bạn đã được mở rộng không gian lưu trữ tài liệu. Hãy tải lên những bài giảng và tài liệu học tập của bạn ngay nào.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            {isSuccess ? (
              <>
                <Button
                  onClick={() => {
                    // Kích hoạt cập nhật thông tin user trong Layout
                    localStorage.setItem('userNeedsRefresh', String(Date.now()));
                    window.dispatchEvent(new Event('authChange'));
                    navigate('/dashboard');
                  }}
                  className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2 shadow-lg shadow-indigo-500/35 hover:-translate-y-0.5 transition-all"
                >
                  Về Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl gap-2 shadow-lg shadow-indigo-500/35 hover:-translate-y-0.5 transition-all"
                >
                  Thử lại
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="h-11 px-6 font-semibold rounded-xl border-border hover:bg-muted/50"
                >
                  Về Dashboard
                </Button>
              </>
            )}
          </div>

          {/* Trusted Footer */}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Hệ thống thanh toán bảo mật liên kết AI Study Hub
          </p>

        </div>
      </div>
    </div>
  );
}
