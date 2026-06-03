import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Download,
  Share2,
  Star,
  Trash2,
  Eye,
  Calendar,
  FileText,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';

export function DocumentDetailPage() {
  const { id } = useParams();

  // Mock document data
  const document = {
    id: id,
    name: 'Bài giảng Cấu trúc dữ liệu - Chương 3.pdf',
    subject: 'Cấu trúc dữ liệu',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2024-05-15',
    uploadedBy: 'Sinh viên',
    description: 'Tài liệu bài giảng chi tiết về cấu trúc dữ liệu Chương 3: Danh sách liên kết, Stack và Queue. Bao gồm lý thuyết, ví dụ minh họa và bài tập thực hành.',
    views: 127,
    downloads: 45,
    starred: true,
    tags: ['Cấu trúc dữ liệu', 'Danh sách liên kết', 'Stack', 'Queue'],
    relatedDocs: [
      {
        id: 2,
        name: 'Bài giảng Cấu trúc dữ liệu - Chương 2.pdf',
        subject: 'Cấu trúc dữ liệu'
      },
      {
        id: 3,
        name: 'Bài tập Cấu trúc dữ liệu - Chương 3.pdf',
        subject: 'Cấu trúc dữ liệu'
      }
    ]
  };

  const handleDownload = () => {
    toast.success('Đang tải xuống tài liệu...');
  };

  const handleShare = () => {
    toast.success('Đã sao chép link chia sẻ!');
  };

  const handleDelete = () => {
    toast.success('Đã xóa tài liệu!');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/documents">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{document.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{document.type}</Badge>
                <span className="text-sm text-muted-foreground">{document.size}</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{document.views} lượt xem</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Download className="w-3 h-3" />
                  <span>{document.downloads} tải xuống</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Star className={`w-4 h-4 ${document.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={handleDownload} className="bg-gradient-to-r from-primary to-secondary">
            <Download className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    PDF Preview sẽ hiển thị ở đây
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    Tải xuống để xem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{document.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FolderOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Môn học</p>
                  <p className="text-sm text-muted-foreground">{document.subject}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ngày upload</p>
                  <p className="text-sm text-muted-foreground">{document.uploadedAt}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dung lượng</p>
                  <p className="text-sm text-muted-foreground">{document.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Documents */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Tài liệu liên quan</CardTitle>
              <CardDescription>Các tài liệu cùng môn học</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.relatedDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doc.subject}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border/50 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tài liệu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
