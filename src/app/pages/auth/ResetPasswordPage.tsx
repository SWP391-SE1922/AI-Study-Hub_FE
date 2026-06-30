import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { resetPassword } from '../../services/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Link đặt lại mật khẩu thiếu token. Vui lòng bấm lại link trong email.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword(token, newPassword);
      toast.success(message || 'Đặt lại mật khẩu thành công!');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu');
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
            <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                Link đặt lại mật khẩu không hợp lệ hoặc thiếu token.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={loading || !token}
            >
              {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
            </Button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
