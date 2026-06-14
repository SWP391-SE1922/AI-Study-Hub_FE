import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  FolderOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { apiRequest } from '../services/api';
import { toast } from 'sonner';

interface DashboardStats {
  totalDocuments: number;
  totalCourses: number;
  totalQuizzes: number;
  totalAIChats: number;
}

interface DocumentItem {
  id: string;
  title: string;
  subject: string | null;
  fileSize: number;
  createdAt: string;
  downloadCount: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
      const statsData = await apiRequest('/dashboard');
      setStats(statsData);

      // Fetch my documents (recent ones)
      const docsData = await apiRequest('/documents/my-documents?limit=5');
      setRecentDocuments(docsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải thông tin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Safe defaults
  const docCount = stats?.totalDocuments ?? 0;
  const courseCount = stats?.totalCourses ?? 0;
  const quizCount = stats?.totalQuizzes ?? 0;
  const chatCount = stats?.totalAIChats ?? 0;

  const metricCards = [
    { title: 'Tài liệu của bạn', value: docCount, icon: FileText, color: 'text-blue-600', desc: 'Đã tải lên hệ thống' },
    { title: 'Khóa học', value: courseCount, icon: FolderOpen, color: 'text-green-600', desc: 'Có sẵn để học' },
    { title: 'Lượt AI Chat', value: chatCount, icon: MessageSquare, color: 'text-purple-600', desc: 'Trò chuyện trong phiên' },
    { title: 'Giới hạn quiz', value: quizCount, icon: TrendingUp, color: 'text-orange-600', desc: 'Bài thi thử đã làm' }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Chào mừng trở lại! Đây là tổng quan tài liệu học tập của bạn.</p>
        </div>
        <Link to="/documents">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Quản lý tài liệu
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang đồng bộ hóa dữ liệu hệ thống...</p>
        </div>
      ) : (
        <>
          {/* Thẻ Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((stat, index) => (
              <Card key={index} className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bố cục lưới */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white text-lg font-bold">Tài liệu tải lên gần đây</CardTitle>
                  <CardDescription>Các tài liệu học tập cá nhân của bạn</CardDescription>
                </div>
                <Link to="/documents">
                  <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs">Xem tất cả</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentDocuments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    Bạn chưa tải lên tài liệu nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-slate-100/50 dark:border-slate-800">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>{doc.subject || 'Chưa phân loại'}</span>
                            <span>•</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeAgo(doc.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thao tác nhanh */}
            <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white text-lg font-bold">Thao tác nhanh</CardTitle>
                <CardDescription>Shortcuts tiện ích</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/documents" className="block p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm hover:opacity-95 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Upload className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-semibold text-sm">Upload tài liệu</h4>
                      <p className="text-xs text-white/80">Thêm tài liệu mới</p>
                    </div>
                  </div>
                </Link>

                <Link to="/ai-chat" className="block p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm hover:opacity-95 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-semibold text-sm">AI Chat</h4>
                      <p className="text-xs text-white/80">Hỏi đáp với trợ lý thông minh</p>
                    </div>
                  </div>
                </Link>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">AI Assistant</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Tóm tắt và giải đáp thắc mắc tài liệu tự động</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}