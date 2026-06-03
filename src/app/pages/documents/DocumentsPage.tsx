import { useState } from 'react';
import { Link } from 'react-router';
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
  FolderOpen,
  Calendar
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
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const mockDocuments = [
  {
    id: 1,
    name: 'Bài giảng Cấu trúc dữ liệu - Chương 3.pdf',
    subject: 'Cấu trúc dữ liệu',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2024-05-15',
    starred: true,
    color: 'bg-red-500'
  },
  {
    id: 2,
    name: 'Đề thi giữa kỳ Toán cao cấp.docx',
    subject: 'Toán cao cấp',
    type: 'DOCX',
    size: '1.1 MB',
    uploadedAt: '2024-05-14',
    starred: false,
    color: 'bg-blue-500'
  },
  {
    id: 3,
    name: 'Source code Java - Project quản lý.zip',
    subject: 'Lập trình Java',
    type: 'ZIP',
    size: '8.2 MB',
    uploadedAt: '2024-05-13',
    starred: true,
    color: 'bg-yellow-500'
  },
  {
    id: 4,
    name: 'Slide bài thuyết trình AI.pptx',
    subject: 'Trí tuệ nhân tạo',
    type: 'PPTX',
    size: '5.6 MB',
    uploadedAt: '2024-05-12',
    starred: false,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    name: 'Báo cáo thực tập web development.pdf',
    subject: 'Thực tập doanh nghiệp',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '2024-05-11',
    starred: false,
    color: 'bg-red-500'
  },
  {
    id: 6,
    name: 'Database Design - Chương 5.pdf',
    subject: 'Cơ sở dữ liệu',
    type: 'PDF',
    size: '4.1 MB',
    uploadedAt: '2024-05-10',
    starred: true,
    color: 'bg-red-500'
  }
];

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const subjects = ['all', 'Cấu trúc dữ liệu', 'Toán cao cấp', 'Lập trình Java', 'Trí tuệ nhân tạo', 'Cơ sở dữ liệu'];

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: number) => {
    toast.success('Đã xóa tài liệu!');
  };

  const handleDownload = (name: string) => {
    toast.success(`Đang tải ${name}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tài liệu</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và tìm kiếm tài liệu học tập
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Upload tài liệu
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input-background"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-[200px] bg-input-background">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjects.slice(1).map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tìm thấy <strong>{filteredDocuments.length}</strong> tài liệu
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="border-border/50 hover:border-primary/50 transition-colors group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${doc.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <FileText className={`w-6 h-6 ${doc.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
                    <Star className={`w-4 h-4 ${doc.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/documents/${doc.id}`} className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(doc.name)} className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="cursor-pointer text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Link to={`/documents/${doc.id}`}>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {doc.name}
                </h3>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {doc.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FolderOpen className="w-3 h-3" />
                  <span className="truncate">{doc.subject}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedSubject('all');
            }}>
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
