import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  Shield,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const stats = [
  {
    title: 'Tổng người dùng',
    value: '1,234',
    change: '+12.5%',
    icon: Users,
    trend: 'up',
    color: 'text-indigo-600'
  },
  {
    title: 'Tổng tài liệu',
    value: '5,678',
    change: '+8.2%',
    icon: FileText,
    trend: 'up',
    color: 'text-blue-600'
  },
  {
    title: 'Chat sessions',
    value: '892',
    change: '+15.3%',
    icon: MessageSquare,
    trend: 'up',
    color: 'text-purple-600'
  },
  {
    title: 'Dung lượng đã dùng',
    value: '234 GB',
    change: '+5.1%',
    icon: TrendingUp,
    trend: 'up',
    color: 'text-pink-600'
  }
];

const recentUsersData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'Student',
    status: 'active',
    joinedAt: '2026-05-15'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'Student',
    status: 'active',
    joinedAt: '2026-05-14'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'Student',
    status: 'inactive',
    joinedAt: '2026-05-13'
  },
  {
    id: 4,
    name: 'Phạm Minh D',
    email: 'minhdpham@example.com',
    role: 'Admin',
    status: 'active',
    joinedAt: '2026-05-10'
  }
];

const systemLogs = [
  {
    id: 1,
    action: 'User Login',
    user: 'nguyenvana@example.com',
    timestamp: '2026-06-14 22:30:00',
    status: 'success'
  },
  {
    id: 2,
    action: 'Document Upload',
    user: 'tranthib@example.com',
    timestamp: '2026-06-14 22:25:00',
    status: 'success'
  },
  {
    id: 3,
    action: 'Failed Login',
    user: 'unknown@example.com',
    timestamp: '2026-06-14 22:20:00',
    status: 'error'
  },
  {
    id: 4,
    action: 'AI Chat Request',
    user: 'levanc@example.com',
    timestamp: '2026-06-14 22:15:00',
    status: 'success'
  }
];

const chatbotStats = [
  { metric: 'Tổng yêu cầu', value: '2,456', change: '+18%' },
  { metric: 'Phản hồi trung bình', value: '1.2s', change: '-5%' },
  { metric: 'Tỷ lệ thành công', value: '98.5%', change: '+2%' },
  { metric: 'Mức độ hài lòng', value: '4.8/5', change: '+0.2' }
];

const uploadActivityData = [
  { name: 'Thứ 2', pdf: 12, docx: 8, others: 3 },
  { name: 'Thứ 3', pdf: 15, docx: 9, others: 4 },
  { name: 'Thứ 4', pdf: 18, docx: 11, others: 5 },
  { name: 'Thứ 5', pdf: 22, docx: 13, others: 5 },
  { name: 'Thứ 6', pdf: 20, docx: 12, others: 6 },
  { name: 'Thứ 7', pdf: 25, docx: 14, others: 7 },
  { name: 'Chủ Nhật', pdf: 30, docx: 16, others: 9 },
];

const chatbotPerformanceData = [
  { hour: '00:00', requests: 120, responseTime: 1.1 },
  { hour: '04:00', requests: 80, responseTime: 0.9 },
  { hour: '08:00', requests: 250, responseTime: 1.3 },
  { hour: '12:00', requests: 480, responseTime: 1.4 },
  { hour: '16:00', requests: 380, responseTime: 1.2 },
  { hour: '20:00', requests: 310, responseTime: 1.1 },
];

const satisfactionData = [
  { name: 'Rất hài lòng (5★)', value: 65, color: '#6366f1' },
  { name: 'Hài lòng (4★)', value: 25, color: '#3b82f6' },
  { name: 'Bình thường (3★)', value: 8, color: '#10b981' },
  { name: 'Tệ (2★/1★)', value: 2, color: '#ef4444' },
];

export function AdminPage() {
  const [users, setUsers] = useState(recentUsersData);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const toggleUserRole = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: u.role === 'Student' ? 'Admin' : 'Student' } : u));
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hệ thống và theo dõi hoạt động tổng quan của AI Study Hub
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <p className="text-xs text-emerald-500 font-medium">{stat.change}</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} className="space-y-6">

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">Quản lý người dùng</CardTitle>
                <CardDescription>Danh sách và cấu hình vai trò, trạng thái tài khoản</CardDescription>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Thêm Admin/Sinh viên
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="w-[250px]">Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-border">
                              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-semibold"
                            onClick={() => toggleUserRole(user.id)}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={`cursor-pointer transition-colors font-semibold ${user.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-0' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{user.joinedAt}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleUserStatus(user.id)} 
                            className={`h-8 px-3 rounded-lg text-xs font-bold ${user.status === 'active' ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                          >
                            {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tài liệu PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">3,245</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">57% tổng số tài liệu lưu trữ</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tài liệu DOCX</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1,823</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">32% tổng số tài liệu lưu trữ</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tài liệu khác</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">610</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">11% tổng số tài liệu lưu trữ</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Hoạt động upload</CardTitle>
              <CardDescription>Số lượng tài liệu được tải lên theo tuần trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uploadActivityData}>
                    <defs>
                      <linearGradient id="pdfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.15}/>
                      </linearGradient>
                      <linearGradient id="docxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.15}/>
                      </linearGradient>
                      <linearGradient id="othersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        borderRadius: '12px',
                        color: 'var(--foreground)'
                      }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="pdf" name="Tài liệu PDF" stackId="a" fill="url(#pdfGrad)" />
                    <Bar dataKey="docx" name="Tài liệu DOCX" stackId="a" fill="url(#docxGrad)" />
                    <Bar dataKey="others" name="Định dạng khác" stackId="a" fill="url(#othersGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chatbotStats.map((stat, index) => (
              <Card key={index} className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-500 font-semibold mt-1">{stat.change} so với tháng trước</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Tần suất Yêu cầu & Tốc độ phản hồi</CardTitle>
                <CardDescription>Số lượng câu hỏi xử lý và thời gian phản hồi trung bình theo giờ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chatbotPerformanceData}>
                      <defs>
                        <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Area yAxisId="left" type="monotone" dataKey="requests" name="Lượt yêu cầu (lần)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#reqGrad)" />
                      <Line yAxisId="right" type="monotone" dataKey="responseTime" name="Thời gian phản hồi (giây)" stroke="#f43f5e" strokeWidth={2} activeDot={{ r: 8 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Độ hài lòng của User</CardTitle>
                <CardDescription>Tỷ lệ đánh giá phản hồi sau khi chat với AI</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pb-6">
                <div className="h-[180px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px',
                          color: 'var(--foreground)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">4.8</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Trên 5 sao</p>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-4">
                  {satisfactionData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground font-medium">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">System Logs</CardTitle>
              <CardDescription>Nhật ký ghi nhận hoạt động hệ thống theo thời gian thực</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="w-[180px]">Thời gian</TableHead>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs font-semibold">
                          {log.timestamp}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{log.user}</TableCell>
                        <TableCell>
                          <Badge
                            variant={log.status === 'success' ? 'default' : 'destructive'}
                            className={`gap-1 font-semibold ${log.status === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-0' : 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white border-0'}`}
                          >
                            {log.status === 'error' && <AlertCircle className="w-3 h-3" />}
                            {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
