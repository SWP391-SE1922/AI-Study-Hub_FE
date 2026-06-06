import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const stats = [
  {
    title: 'Tổng tài liệu',
    value: '48',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Đã upload tháng này',
    value: '12',
    change: '+4',
    icon: Upload,
    color: 'text-green-600'
  },
  {
    title: 'AI Chat Sessions',
    value: '23',
    change: '+8',
    icon: MessageSquare,
    color: 'text-purple-600'
  },
  {
    title: 'Dung lượng',
    value: '2.4 GB',
    change: '/ 5 GB',
    icon: TrendingUp,
    color: 'text-orange-600'
  }
];

const recentDocuments = [
  {
    id: 1,
    name: 'Bài giảng Cấu trúc dữ liệu - Chương 3.pdf',
    subject: 'Cấu trúc dữ liệu',
    size: '2.4 MB',
    uploadedAt: '2 giờ trước',
    starred: true
  },
  {
    id: 2,
    name: 'Đề thi giữa kỳ Toán cao cấp.docx',
    subject: 'Toán cao cấp',
    size: '1.1 MB',
    uploadedAt: '5 giờ trước',
    starred: false
  },
  {
    id: 3,
    name: 'Source code Java - Project quản lý.zip',
    subject: 'Lập trình Java',
    size: '8.2 MB',
    uploadedAt: 'Hôm qua',
    starred: true
  },
  {
    id: 4,
    name: 'Slide bài thuyết trình AI.pptx',
    subject: 'Trí tuệ nhân tạo',
    size: '5.6 MB',
    uploadedAt: '2 ngày trước',
    starred: false
  }
];

const quickActions = [
  {
    title: 'Upload tài liệu',
    description: 'Thêm tài liệu mới',
    icon: Upload,
    href: '/documents',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'AI Chat',
    description: 'Hỏi đáp với AI',
    icon: MessageSquare,
    href: '/ai-chat',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Tìm kiếm',
    description: 'Tìm tài liệu nhanh',
    icon: FileText,
    href: '/documents',
    gradient: 'from-green-500 to-emerald-500'
  }
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Chào mừng trở lại! Đây là tổng quan tài liệu của bạn.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Upload tài liệu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Usage */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Dung lượng lưu trữ</CardTitle>
          <CardDescription>Đã sử dụng 2.4 GB / 5 GB</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={48} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Còn lại 2.6 GB dung lượng trống
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tài liệu gần đây</CardTitle>
              <CardDescription>Các tài liệu bạn vừa truy cập</CardDescription>
            </div>
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{doc.name}</h4>
                      {doc.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <FolderOpen className="w-3 h-3" />
                      <span>{doc.subject}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{doc.uploadedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Shortcuts tiện ích</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="block p-4 rounded-lg bg-gradient-to-br hover:opacity-90 transition-opacity text-white"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-white/80">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}

            {/* AI Assistant Promo */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Assistant</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỏi bất cứ điều gì về tài liệu của bạn
                  </p>
                  <Link to="/ai-chat">
                    <Button size="sm" variant="link" className="px-0 mt-2 h-auto">
                      Thử ngay →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
