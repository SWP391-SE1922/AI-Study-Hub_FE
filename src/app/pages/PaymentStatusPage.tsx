import { useNavigate, useSearchParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Button } from '../components/ui/button';
import successAnim from '../components/animation/success.json';
import failAnim from '../components/animation/fail.json';
import { useEffect } from 'react';

type PaymentStatusKind = 'success' | 'failed' | 'error' | 'invalid';

const COPY: Record<
  PaymentStatusKind,
  { title: string; description: string; animation: 'success' | 'fail' }
> = {
  success: {
    title: 'Thanh toán thành công',
    description: 'Cảm ơn bạn — giao dịch đã được xử lý thành công. Gói đăng ký đã được kích hoạt.',
    animation: 'success',
  },
  failed: {
    title: 'Thanh toán thất bại',
    description: 'Giao dịch thất bại. Vui lòng thử lại hoặc chọn phương thức khác.',
    animation: 'fail',
  },
  error: {
    title: 'Đã xảy ra lỗi',
    description: 'Giao dịch đã xảy ra lỗi. Vui lòng thử lại hoặc chọn phương thức khác.',
    animation: 'fail',
  },
  invalid: {
    title: 'Giao dịch không hợp lệ',
    description: 'Giao dịch không được chấp nhận. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
    animation: 'fail',
  },
};

interface PaymentStatusPageProps {
  status: PaymentStatusKind;
}

export function PaymentStatusPage({ status }: PaymentStatusPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copy = COPY[status];
  const animationData = copy.animation === 'success' ? successAnim : failAnim;

  const txnRef = searchParams.get('txnRef') || '';
  const amount = searchParams.get('amount');
  const plan = searchParams.get('plan') || '';
  const invoiceCode = searchParams.get('invoiceCode') || '';

  useEffect(() => {
    if (status === 'success') {
      localStorage.setItem('userNeedsRefresh', String(Date.now()));
      window.dispatchEvent(new Event('authChange'));
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa]">
      <div className="w-full max-w-lg text-center bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="mb-2">
          <Lottie
            animationData={animationData}
            loop={false}
            style={{ width: 180, height: 180, margin: '0 auto' }}
          />
        </div>

        <h2 className="mt-3 mb-1.5 text-xl font-extrabold text-[#052021]">{copy.title}</h2>
        <p className="m-0 text-sm text-slate-500">{copy.description}</p>

        {(txnRef || amount || plan || invoiceCode) && (
          <div className="mt-5 text-left rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs space-y-1.5">
            {invoiceCode && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Mã hóa đơn</span>
                <span className="font-semibold text-slate-700">{invoiceCode}</span>
              </div>
            )}
            {txnRef && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Mã giao dịch</span>
                <span className="font-semibold text-slate-700 truncate">{txnRef}</span>
              </div>
            )}
            {plan && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Gói</span>
                <span className="font-semibold text-slate-700">{plan}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Số tiền</span>
                <span className="font-bold text-slate-800">
                  {Number(amount).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="rounded-full px-6 bg-[#121214] text-white hover:bg-stone-800"
          >
            Về trang chủ
          </Button>
          {status === 'success' ? (
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('userNeedsRefresh', String(Date.now()));
                window.dispatchEvent(new Event('authChange'));
                navigate('/dashboard');
              }}
              className="rounded-full px-6"
            >
              Về Dashboard
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/#pricing')}
              className="rounded-full px-6"
            >
              Thử lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
