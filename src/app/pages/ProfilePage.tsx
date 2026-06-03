import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';

export function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Sinh viên',
    email: 'student@example.com',
    phone: '0123456789',
    studentId: 'SV001'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Ảnh đại diện của bạn</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              SV
            </AvatarFallback>
          </Avatar>
          <Button variant="outline">Đổi ảnh</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Mã sinh viên</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-input-background"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
