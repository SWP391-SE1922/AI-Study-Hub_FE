import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Upload, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Fake data mẫu để render giao diện không bị lỗi trống
const documentsData = [
  { id: '1', title: 'Bài giảng Cấu trúc dữ liệu - Chương 3.pdf', category: 'Cấu trúc dữ liệu', date: '2024-05-15', size: '2.4 MB' },
  { id: '2', title: 'Đề thi giữa kỳ Toán cao cấp.docx', category: 'Toán cao cấp', date: '2024-05-14', size: '1.1 MB' },
  { id: '3', title: 'Source code Java - Project quản lý.zip', category: 'Lập trình Java', date: '2024-05-13', size: '8.2 MB' }
];

// Sử dụng đúng Named Export để App.tsx nhận diện được { DocumentsPage }
export function DocumentsPage() {
  return (
    <div className="space-y-6 text-slate-300 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tài liệu</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý và tìm kiếm tài liệu học tập</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/10 self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          Upload tài liệu
        </Button>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 rounded-xl gap-2 hover:bg-slate-800">
            Tất cả môn học
          </Button>
          <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 rounded-xl p-2.5 hover:bg-slate-800">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-medium">Tìm thấy <span className="text-indigo-400">{documentsData.length}</span> tài liệu</p>

      {/* Danh sách tài liệu dưới dạng Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentsData.map((doc) => (
          <div key={doc.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/60 transition-all shadow-sm flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {doc.category}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <span>{doc.date}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>

            {/* Khối Action Buttons */}
            <div className="grid grid-cols-4 gap-1 border-t border-slate-800/60 pt-4 mt-5 text-slate-400 text-xs">
              <button type="button" className="flex flex-col items-center gap-1 py-1 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                <span>Tải về</span>
              </button>
              <button type="button" className="flex flex-col items-center gap-1 py-1 hover:text-white transition-colors">
                <Edit className="w-4 h-4" />
                <span>Sửa</span>
              </button>
              <button type="button" className="flex flex-col items-center gap-1 py-1 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
              <Link to={`/documents/${doc.id}`} className="flex flex-col items-center gap-1 py-1 hover:text-indigo-400 transition-colors text-center">
                <Eye className="w-4 h-4" />
                <span>Xem</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}