import React, { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../../services/api';

interface DocumentItem {
  id: string;
  title: string;
  uploadedBy: string;
  createdAt: string;
  isPublic: boolean;
  user: {
    email: string;
    fullName: string;
  };
}

export function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users count
      const usersData = await apiRequest('/users');
      setTotalUsers(usersData.users ? usersData.users.length : usersData.length || 0);

      // Fetch documents
      const docsData = await apiRequest('/documents');
      setDocuments(docsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi đồng bộ dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const totalDocs = documents.length;
  const pendingDocs = documents.filter(doc => !doc.isPublic);

  const stats = [
    { label: 'Tổng số User', value: totalUsers, icon: Users, change: 'Người dùng trong hệ thống', color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Tổng số Tài liệu', value: totalDocs, icon: FileText, change: 'Tài liệu đã đăng tải', color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Giới hạn Lượt AI', value: 'Không giới hạn', icon: MessageSquare, change: 'Chế độ hoạt động bình thường', color: 'text-green-600 bg-green-500/10' },
    { label: 'Tài liệu riêng tư (Private)', value: pendingDocs.length, icon: AlertCircle, change: 'Tài liệu nội bộ/chưa công khai', color: 'text-amber-600 bg-amber-500/10' },
  ];

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tổng quan hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">Báo cáo số liệu hiệu năng, quản lý người dùng và tài liệu học tập toàn hệ thống.</p>
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
          <p className="text-sm text-slate-500">Đang đồng bộ số liệu hệ thống...</p>
        </div>
      ) : (
        <>
          {/* 1. Hàng Thẻ Thống Kê Nhanh (Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-6 bg-card border border-border rounded-2xl shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Phần dưới cùng: Bảng quản lý tài liệu chờ duyệt nhanh */}
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground">Tài liệu tải lên mới nhất</h3>
              <p className="text-xs text-muted-foreground">Danh sách giáo trình, tài liệu học tập vừa cập nhật.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground bg-accent/30">
                    <th className="p-3">Mã số</th>
                    <th className="p-3">Tên tài liệu</th>
                    <th className="p-3">Người đăng</th>
                    <th className="p-3">Ngày tải lên</th>
                    <th className="p-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-medium">
                  {recentDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-accent/30 transition-colors">
                      <td className="p-3 text-muted-foreground font-mono text-xs truncate max-w-[100px]">{doc.id}</td>
                      <td className="p-3 text-foreground truncate max-w-xs">{doc.title}</td>
                      <td className="p-3 text-muted-foreground text-xs">{doc.user?.fullName || doc.uploadedBy}</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          doc.isPublic 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {doc.isPublic ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {doc.isPublic ? 'Công khai' : 'Riêng tư'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
