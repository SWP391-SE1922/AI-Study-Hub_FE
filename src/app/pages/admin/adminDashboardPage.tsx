import React from 'react';
import { Users, FileText, MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export function AdminDashboardPage() {
  // Mock data giả lập cấu trúc dữ liệu từ Backend trả về
  const stats = [
    { label: 'Tổng số User', value: '1,248', icon: Users, change: '+12% tháng này', color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Tổng số Tài liệu', value: '452', icon: FileText, change: '+24 tài liệu mới', color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Lượt AI Chat', value: '8,921', icon: MessageSquare, change: '+143 lượt hôm nay', color: 'text-green-600 bg-green-500/10' },
    { label: 'Tài liệu chờ duyệt', value: '14', icon: AlertCircle, change: 'Cần xử lý ngay', color: 'text-amber-600 bg-amber-500/10' },
  ];

  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'vừa đăng ký tài khoản mới', time: '2 phút trước' },
    { id: 2, user: 'Trần Thị B', action: 'đã tải lên tài liệu "Giải tích 1"', time: '15 phút trước' },
    { id: 3, user: 'Lê Hoàng C', action: 'đạt giới hạn câu hỏi AI Chat trong ngày', time: '1 giờ trước' },
  ];

  const pendingDocuments = [
    { id: 'DOC001', name: 'Đề thi cuối kỳ Toán Cao Cấp A1', author: 'student1@example.com', date: '08/06/2026', status: 'Chờ duyệt' },
    { id: 'DOC002', name: 'Slide bài giảng Kiến trúc máy tính', author: 'admin@example.com', date: '07/06/2026', status: 'Đã duyệt' },
    { id: 'DOC003', name: 'Tóm tắt công thức Vật lý đại cương', author: 'user_test@example.com', date: '06/06/2026', status: 'Chờ duyệt' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tổng quan hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">Báo cáo số liệu hiệu năng, quản lý người dùng và tài liệu học tập.</p>
      </div>

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

      {/* 2. Phần giữa: Biểu đồ & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khung giả lập Biểu đồ xu hướng */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Tần suất tương tác hệ thống</h3>
            <p className="text-xs text-muted-foreground">Thống kê lượng người truy cập và tương tác AI Chat theo tuần.</p>
          </div>
          {/* Vùng vẽ chart (Backend chỉ cần trả về mảng dữ liệu để map vào đây) */}
          <div className="h-48 my-4 bg-accent/20 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-sm font-medium">
            [ Khu vực hiển thị Biểu đồ tăng trưởng ]
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
            <span>Dữ liệu cập nhật thời gian thực</span>
            <span className="flex items-center gap-1 text-primary font-semibold cursor-pointer hover:underline">
              Xem báo cáo chi tiết <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Khung Hoạt động gần đây (Recent Activities) */}
        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Nhật ký hệ thống</h3>
            <p className="text-xs text-muted-foreground">Các thao tác mới nhất của người dùng.</p>
          </div>
          <div className="mt-4 space-y-4 flex-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-sm items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">
                    {act.user} <span className="text-muted-foreground font-normal">{act.action}</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Phần dưới cùng: Bảng quản lý tài liệu chờ duyệt nhanh */}
      <div className="p-6 bg-card border border-border rounded-2xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground">Yêu cầu phê duyệt tài liệu</h3>
          <p className="text-xs text-muted-foreground">Danh sách giáo trình, đề thi vừa được cập nhật cần quản trị viên xem xét.</p>
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
              {pendingDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-accent/30 transition-colors">
                  <td className="p-3 text-muted-foreground font-mono">{doc.id}</td>
                  <td className="p-3 text-foreground truncate max-w-xs">{doc.name}</td>
                  <td className="p-3 text-muted-foreground">{doc.author}</td>
                  <td className="p-3 text-muted-foreground">{doc.date}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      doc.status === 'Đã duyệt' 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {doc.status === 'Đã duyệt' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
