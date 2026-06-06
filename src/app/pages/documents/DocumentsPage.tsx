import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Upload,
  Filter,
  FileText,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  FileCode,
  FileArchive,
  FileCheck,
  Edit2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

interface DocumentItem {
  id: number;
  name: string;
  subject: string;
  type: 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | string;
  size: string;
  uploadedAt: string;
  starred: boolean;
  pages?: number;
}

const mockDocuments: DocumentItem[] = [
  { id: 1, name: 'Bài giảng Cấu trúc dữ liệu - Chương 3.pdf', subject: 'Cấu trúc dữ liệu', type: 'PDF', size: '2.4 MB', uploadedAt: '2024-05-15', starred: true, pages: 18 },
  { id: 2, name: 'Đề thi giữa kỳ Toán cao cấp.docx', subject: 'Toán cao cấp', type: 'DOCX', size: '1.1 MB', uploadedAt: '2024-05-14', starred: false, pages: 42 },
  { id: 3, name: 'Source code Java - Project quản lý.zip', subject: 'Lập trình Java', type: 'ZIP', size: '8.2 MB', uploadedAt: '2024-05-13', starred: true, pages: 0 },
  { id: 4, name: 'Slide bài thuyết trình AI.pptx', subject: 'Trí tuệ nhân tạo', type: 'PPTX', size: '5.6 MB', uploadedAt: '2024-05-12', starred: false, pages: 25 },
  { id: 5, name: 'Báo cáo thực tập web development.pdf', subject: 'Thực tập doanh nghiệp', type: 'PDF', size: '3.2 MB', uploadedAt: '2024-05-11', starred: false, pages: 30 },
  { id: 6, name: 'Database Design - Chương 5.pdf', subject: 'Cơ sở dữ liệu', type: 'PDF', size: '4.1 MB', uploadedAt: '2024-05-10', starred: true, pages: 15 }
];

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = ['all', 'Cấu trúc dữ liệu', 'Toán cao cấp', 'Lập trình Java', 'Trí tuệ nhân tạo', 'Thực tập doanh nghiệp', 'Cơ sở dữ liệu'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const toggleStar = (id: number) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, starred: !doc.starred } : doc));
    toast.success('Đã cập nhật mục lưu trữ!');
  };

  const handleDelete = (id: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Đã xóa tài liệu!');
  };

  const getFileStyleConfig = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return { icon: FileText, iconClass: 'text-red-500', bgClass: 'bg-red-50 border-red-100' };
      case 'DOCX':
        return { icon: FileCheck, iconClass: 'text-blue-500', bgClass: 'bg-blue-50 border-blue-100' };
      case 'ZIP':
        return { icon: FileArchive, iconClass: 'text-amber-500', bgClass: 'bg-amber-50 border-amber-100' };
      case 'PPTX':
        return { icon: FileCode, iconClass: 'text-orange-500', bgClass: 'bg-orange-50 border-orange-100' };
      default:
        return { icon: FileText, iconClass: 'text-slate-500', bgClass: 'bg-slate-50 border-slate-100' };
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto text-slate-700">

      {/* Header tiêu đề và nút Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tài liệu</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và tìm kiếm tài liệu học tập</p>
        </div>
        <Button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl px-5 h-11 font-medium shadow-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload tài liệu
        </Button>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc môn học */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 bg-slate-50/60 border-slate-200/80 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/10 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[220px] h-11 bg-slate-50/60 border-slate-200/80 rounded-xl text-sm">
              <SelectValue placeholder="Tất cả môn học" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả môn học</SelectItem>
              {subjects.slice(1).map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 w-11 rounded-xl border-slate-200 shrink-0 p-0 flex items-center justify-center bg-white" aria-label="Bộ lọc nâng cao">
            <Filter className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Bộ đếm kết quả */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <span>Tìm thấy</span>
        <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold">{filteredDocuments.length}</span>
        <span>tài liệu</span>
      </div>

      {/* Lưới hiển thị danh sách thẻ tài liệu */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const style = getFileStyleConfig(doc.type);
            const FileIcon = style.icon;

            return (
              <Card key={doc.id} className="bg-white border border-slate-150 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col justify-between">

                <CardContent className="p-5 flex flex-col justify-between flex-1">

                  {/* Khối Icon đầu thẻ & Cụm hành động Star/Menu */}
                  <div className="flex items-start justify-between w-full mb-5">
                    <div className={`w-14 h-14 ${style.bgClass} border rounded-xl flex items-center justify-center shrink-0`}>
                      <FileIcon className={`w-6 h-6 ${style.iconClass}`} />
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => toggleStar(doc.id)}
                        className="p-2 rounded-xl text-slate-300 hover:text-amber-500 transition-colors"
                        aria-label={doc.starred ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                      >
                        <Star className={`w-4 h-4 ${doc.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-50" aria-label="Xem thêm tùy chọn">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1.5 min-w-[160px]">
                          <DropdownMenuItem asChild className="rounded-lg text-xs cursor-pointer py-2">
                            <Link to={`/documents/${doc.id}`}>
                              <Eye className="w-4 h-4 mr-2.5 text-slate-400" /> Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="rounded-lg text-xs font-medium cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50/60">
                            <Trash2 className="w-4 h-4 mr-2.5" /> Xóa tài liệu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Tên tiêu đề tài liệu */}
                  <div className="mb-4">
                    <Link to={`/documents/${doc.id}`}>
                      <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[44px]">
                        {doc.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Tag nhãn môn học */}
                  <div className="mb-4">
                    <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide bg-teal-50 text-teal-700 border border-teal-100">
                      {doc.subject}
                    </span>
                  </div>

                  {/* Meta text thông tin tệp */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                    <span>{doc.uploadedAt}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    {doc.pages && doc.pages > 0 ? (
                      <>
                        <span>•</span>
                        <span>{doc.pages} trang</span>
                      </>
                    ) : null}
                  </div>

                </CardContent>

                {/* Thanh 4 nút hành động dưới đáy thẻ theo Figma */}
                <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50/50 text-slate-500 text-[11px] font-semibold">
                  <button
                    onClick={() => toast.success(`Đang tải xuống ${doc.name}...`)}
                    className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-slate-100/80 hover:text-indigo-600 transition-all border-r border-slate-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => toast(`Tính năng chỉnh sửa đang phát triển`)}
                    className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-slate-100/80 hover:text-indigo-600 transition-all border-r border-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-slate-100/80 hover:text-red-600 transition-all border-r border-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => toast(`Đang tải bản xem trước...`)}
                    className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-slate-100/80 hover:text-indigo-600 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="font-semibold text-sm text-slate-700 mb-1">Không tìm thấy tài liệu</h3>
            <p className="text-xs text-slate-400 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc môn học</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}