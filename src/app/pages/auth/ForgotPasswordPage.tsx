import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>Nhập email để nhận link khôi phục mật khẩu</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-input-background"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
              </Button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground">
                  Đã xử lý yêu cầu cho email <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{message || 'Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.'}</p>
              <p className="text-xs text-muted-foreground">
                Nếu đang chạy local mà chưa nhận mail, xem terminal Backend để lấy link test reset mật khẩu.
              </p>
              <Link to="/login" className="inline-block">
                <Button variant="outline">Quay lại đăng nhập</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
