import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Search, UserPlus, CheckCircle2, XCircle } from 'lucide-react';

const recentUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'Student',
    status: 'active',
    joinedAt: '2024-05-15',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'Student',
    status: 'active',
    joinedAt: '2024-05-14',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'Student',
    status: 'inactive',
    joinedAt: '2024-05-13',
  },
];

const systemLogs = [
  {
    id: 1,
    action: 'Đăng nhập hệ thống',
    user: 'nguyenvana@example.com',
    timestamp: '2024-05-17 10:30:00',
    status: 'success',
  },
  {
    id: 2,
    action: 'Tải lên tài liệu',
    user: 'tranthib@example.com',
    timestamp: '2024-05-17 10:25:00',
    status: 'success',
  },
  {
    id: 3,
    action: 'Đăng nhập thất bại',
    user: 'unknown@example.com',
    timestamp: '2024-05-17 10:20:00',
    status: 'error',
  },
  {
    id: 4,
    action: 'Yêu cầu AI Chat',
    user: 'levanc@example.com',
    timestamp: '2024-05-17 10:15:00',
    status: 'success',
  },
];

export function UserPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quản lý người dùng</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Danh sách người dùng có quyền truy cập hệ thống.</p>
            </div>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Thêm người dùng
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Tìm nhanh theo tên hoặc email"
                className="pl-10"
              />
            </label>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {user.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joinedAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <div className="border-t border-slate-200/70 dark:border-slate-800" />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nhật ký hoạt động</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi mọi hành động liên quan người dùng và hệ thống.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            Xuất file log
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3.5">Thời gian</TableHead>
                  <TableHead className="p-3.5">Hành động</TableHead>
                  <TableHead className="p-3.5">Người dùng</TableHead>
                  <TableHead className="p-3.5">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="p-3.5 text-muted-foreground font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell className="p-3.5 font-medium text-slate-900 dark:text-slate-100">{log.action}</TableCell>
                    <TableCell className="p-3.5 text-slate-600 dark:text-slate-300">{log.user}</TableCell>
                    <TableCell className="p-3.5">
                      <Badge
                        variant={log.status === 'success' ? 'default' : 'destructive'}
                        className="inline-flex items-center gap-2"
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
