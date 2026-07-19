import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { verifyEmail } from '../../services/api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Link xác thực không hợp lệ hoặc thiếu token.');
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const performVerification = async () => {
      setStatus('loading');
      try {
        const message = await verifyEmail(token);
        setStatus('success');
        toast.success(message || 'Xác thực email thành công!');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Xác thực email thất bại');
        toast.error(error instanceof Error ? error.message : 'Xác thực email thất bại');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-inner">
              {status === 'loading' ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : status === 'error' ? (
                <XCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">Xác thực Email</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Đang tiến hành xác thực tài khoản của bạn...'}
              {status === 'success' && 'Tài khoản của bạn đã được xác thực thành công.'}
              {status === 'error' && 'Có lỗi xảy ra trong quá trình xác thực.'}
              {status === 'idle' && 'Chuẩn bị xác thực...'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 text-sm text-destructive text-center border border-destructive/20">
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 rounded-lg bg-green-500/10 text-sm text-green-500 text-center border border-green-500/20">
              Cảm ơn bạn đã tham gia AI Study Hub. Bây giờ bạn có thể đăng nhập để trải nghiệm tất cả tính năng.
            </div>
          )}

          <div className="pt-2">
            {(status === 'success' || status === 'error') && (
              <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-11 text-base">
                <Link to="/login">
                  Quay lại đăng nhập
                </Link>
              </Button>
            )}

            {status === 'loading' && (
              <Button disabled className="w-full h-11 text-base">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vui lòng đợi...
              </Button>
            )}
          </div>

          {(status === 'success' || status === 'error') && (
            <div className="flex justify-center mt-4">
              <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Trở về trang chủ
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
