import { useMemo, useState, type ReactNode } from 'react';
import { Download, FileArchive, FileText, File, Eye, Trash2, Search, Filter, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const documentStats = [
  { title: 'Tài liệu PDF', value: '3,245', subtitle: '57% tổng tài liệu' },
  { title: 'Tài liệu DOCX', value: '1,823', subtitle: '32% tổng tài liệu' },
  { title: 'Tài liệu ZIP', value: '610', subtitle: '11% tổng tài liệu' },
];

const uploadActivity = [
  { label: 'Thứ 2', value: 62 },
  { label: 'Thứ 3', value: 88 },
  { label: 'Thứ 4', value: 72 },
  { label: 'Thứ 5', value: 96 },
  { label: 'Thứ 6', value: 54 },
  { label: 'Thứ 7', value: 82 },
  { label: 'CN', value: 44 },
];

const documents = [
  {
    id: 1,
    name: 'Báo cáo doanh thu Q1.pdf',
    type: 'pdf',
    size: '3.8 MB',
    owner: 'Nguyễn Văn A',
    downloads: 342,
    status: 'public',
  },
  {
    id: 2,
    name: 'Hướng dẫn triển khai.docx',
    type: 'docx',
    size: '1.2 MB',
    owner: 'Trần Thị B',
    downloads: 186,
    status: 'private',
  },
  {
    id: 3,
    name: 'Tài liệu mẫu.zip',
    type: 'zip',
    size: '12.4 MB',
    owner: 'Lê Văn C',
    downloads: 79,
    status: 'public',
  },
  {
    id: 4,
    name: 'Kế hoạch marketing.pdf',
    type: 'pdf',
    size: '2.7 MB',
    owner: 'Phạm Thị D',
    downloads: 129,
    status: 'public',
  },
];

const typeIcons: Record<string, ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-rose-500" />,
  docx: <File className="w-4 h-4 text-sky-500" />,
  zip: <FileArchive className="w-4 h-4 text-amber-500" />,
};

export function DocumentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileType, setFileType] = useState('all');
  const [owner, setOwner] = useState('all');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchMatch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const typeMatch = fileType === 'all' || doc.type === fileType;
      const ownerMatch = owner === 'all' || doc.owner === owner;

      return searchMatch && typeMatch && ownerMatch;
    });
  }, [searchQuery, fileType, owner]);

  const maxValue = Math.max(...uploadActivity.map((item) => item.value));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Quản lý tài liệu</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tìm kiếm, lọc và kiểm soát hoạt động upload trong tuần.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-200">
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-sm font-medium">148 upload tuần này</span>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                  bộ lọc nâng cao
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {documentStats.map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Upload hàng tuần</CardTitle>
            <CardDescription>Đếm số lượng upload mỗi ngày trong tuần.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4 rounded-3xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-indigo-600/10 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Tổng upload</p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">548</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tăng 18% so với tuần trước</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {uploadActivity.map((item) => {
                const height = (item.value / maxValue) * 100;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="w-16 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
                    <div className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Danh sách tài liệu</CardTitle>
            <CardDescription>Quản lý tệp, theo dõi lượt tải và thao tác nhanh.</CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:w-[60%]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm kiếm tài liệu, người đăng..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Loại tệp" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Người đăng" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Nguyễn Văn A">Nguyễn Văn A</SelectItem>
                  <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
                  <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
                  <SelectItem value="Phạm Thị D">Phạm Thị D</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài liệu</TableHead>
                <TableHead>Dung lượng</TableHead>
                <TableHead>Người đăng</TableHead>
                <TableHead>Lượt tải</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {typeIcons[doc.type] || <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{doc.type.toUpperCase()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.owner}</TableCell>
                  <TableCell>{doc.downloads}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'public' ? 'default' : 'secondary'}>
                      {doc.status === 'public' ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Xem trước
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Tải về
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDocuments.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-400">
              Không có tài liệu phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
