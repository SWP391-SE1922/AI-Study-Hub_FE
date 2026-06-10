import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  Activity,
  Clock3,
  Sparkles,
  ShieldCheck,
  Eye,
  MessageSquare,
} from 'lucide-react';

const chatbotStats = [
  { metric: 'Tổng Request', value: '2,456', change: '+18%', trend: 'success' },
  { metric: 'Thời gian phản hồi', value: '1.2s', change: '-5%', trend: 'success' },
  { metric: 'Tỷ lệ chính xác', value: '98.5%', change: '+2%', trend: 'success' },
  { metric: 'Mức độ hài lòng', value: '4.8/5', change: '+0.2', trend: 'default' },
];

const hourlyRequests = [
  { label: '06:00', value: 18 },
  { label: '09:00', value: 54 },
  { label: '12:00', value: 72 },
  { label: '15:00', value: 88 },
  { label: '18:00', value: 96 },
  { label: '21:00', value: 68 },
  { label: '00:00', value: 42 },
];

const aiModelStatus = [
  { title: 'Model', value: 'GPT-4 Turbo', description: 'Đang hoạt động ổn định', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
  { title: 'Phiên bản', value: 'v4.1', description: 'Cập nhật 2 ngày trước', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
  { title: 'Độ chính xác', value: '98.7%', description: 'Mức độ phản hồi chính xác cao', icon: <Activity className="w-5 h-5 text-sky-500" /> },
];

const chatSessions = [
  {
    id: 'CS-1092',
    email: 'nguyenvana@example.com',
    questions: 12,
    tokens: 4_820,
    rating: 'Tốt',
  },
  {
    id: 'CS-1105',
    email: 'tranthib@example.com',
    questions: 8,
    tokens: 3_160,
    rating: 'Tốt',
  },
  {
    id: 'CS-1119',
    email: 'levanc@example.com',
    questions: 21,
    tokens: 8_540,
    rating: 'Kém',
  },
  {
    id: 'CS-1130',
    email: 'phamthi@example.com',
    questions: 15,
    tokens: 5_480,
    rating: 'Tốt',
  },
];

export function AIChatPage() {
  const maxRequests = Math.max(...hourlyRequests.map((item) => item.value));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {chatbotStats.map((stat) => (
          <Card
            key={stat.metric}
            className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700/80 dark:bg-slate-900"
          >
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stat.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <p className="text-3xl font-semibold text-slate-950 dark:text-slate-50">{stat.value}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stat.trend === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
          <CardHeader>
            <div>
              <CardTitle>Request theo khung giờ</CardTitle>
              <CardDescription>Biểu đồ tần suất requests trong ngày</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid gap-3">
              {hourlyRequests.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-16 text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                  <div className="relative flex-1 rounded-full bg-slate-100 dark:bg-slate-800 h-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-width duration-300"
                      style={{ width: `${(item.value / maxRequests) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {aiModelStatus.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 text-slate-800 shadow-sm dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <div className="rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
          <CardHeader>
            <div>
              <CardTitle>Model Status</CardTitle>
              <CardDescription>Tổng quan tình trạng mô hình AI hiện tại</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 p-6 text-white shadow-lg shadow-indigo-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-indigo-100/80">Trạng thái mô hình</p>
                  <h3 className="mt-2 text-2xl font-semibold">Hoạt động ổn định</h3>
                </div>
                <div className="rounded-3xl bg-white/15 p-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">Latency trung bình</p>
                  <p className="mt-2 text-3xl font-semibold">1.2s</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">Phiên active</p>
                  <p className="mt-2 text-3xl font-semibold">128</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
        <CardHeader>
          <div>
            <CardTitle>Chat Sessions</CardTitle>
            <CardDescription>Danh sách phiên trò chuyện để admin theo dõi chất lượng AI.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số câu hỏi</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chatSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{session.id}</TableCell>
                  <TableCell className="text-muted-foreground">{session.email}</TableCell>
                  <TableCell>{session.questions}</TableCell>
                  <TableCell>{session.tokens.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={session.rating === 'Tốt' ? 'default' : 'secondary'}>
                      {session.rating}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Xem đoạn chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
