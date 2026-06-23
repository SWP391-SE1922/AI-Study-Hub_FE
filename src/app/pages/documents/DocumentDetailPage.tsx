import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, HardDrive, Download, ExternalLink, Tags, User, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { downloadDocument, getDocumentById, openDocumentPreview, type DocumentItem } from '../../services/api';

function formatDate(value?: string) {
  if (!value) return 'Không rõ ngày';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function formatFileSize(size?: number) {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getDocumentCategory(doc: DocumentItem) {
  return doc.category?.name || doc.subjectRef?.name || doc.subject || 'Chưa phân loại';
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadDocument = async () => {
      setLoading(true);
      try {
        const result = await getDocumentById(id);
        setDocument(result);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải chi tiết tài liệu');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      await downloadDocument(document.id, document.fileName || document.title);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải tài liệu');
    }
  };

  const handleOpenFile = () => {
    if (!document) return;
    try {
      openDocumentPreview(document);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể mở file');
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="rounded-xl pl-2">
        <Link to="/documents">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400">Đang tải chi tiết tài liệu từ API...</p>
        ) : document ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">{document.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {getDocumentCategory(document)}
                    </span>
                    <span>ID: {document.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="rounded-xl gap-2">
                  <Download className="w-4 h-4" />
                  Tải về
                </Button>
                <Button onClick={handleOpenFile} variant="outline" className="rounded-xl gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Mở file
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Mô tả / xem trước nội dung</h2>

                {document.description?.trim() && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Mô tả ghi chú</p>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {document.description}
                    </p>
                  </div>
                )}

                {document.contentPreview?.trim() && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-2">Nội dung trích từ file</p>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 whitespace-pre-line max-h-72 overflow-y-auto pr-2">
                      {document.contentPreview}
                    </p>
                  </div>
                )}

                {!document.description?.trim() && !document.contentPreview?.trim() && (
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Chưa đọc được nội dung xem trước từ file này. Hiện hệ thống hỗ trợ trích nội dung cho TXT/CSV/JSON/MD và file Office mới như DOCX, PPTX, XLSX.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3">
                <h2 className="font-semibold text-slate-900 dark:text-white">Phân loại</h2>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-slate-400" />
                    <span>Danh mục: {document.category?.name || 'Chưa phân loại'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Môn học: {document.subjectRef?.name || document.subject || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.isPublic ? <Unlock className="w-4 h-4 text-slate-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    <span>{document.isPublic ? 'Tài liệu công khai' : 'Tài liệu riêng tư'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày tải lên: {formatDate(document.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span>Dung lượng: {formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Tên file: {document.fileName}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Loại file: {document.mimeType}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <User className="w-4 h-4 text-slate-400" />
                <span>Người tải: {document.user?.fullName || 'Không rõ'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <Download className="w-4 h-4 text-slate-400" />
                <span>Lượt tải: {document.downloadCount ?? 0}</span>
              </div>
            </div>

            {document.versions && document.versions.length > 0 && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Lịch sử phiên bản</h2>
                <div className="space-y-2">
                  {document.versions.map((version) => (
                    <div key={version.id} className="text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      Version {version.version} • {version.fileName} • {formatFileSize(version.fileSize)} • {formatDate(version.createdAt)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">Không tìm thấy tài liệu.</p>
        )}
      </div>
    </div>
  );
}
