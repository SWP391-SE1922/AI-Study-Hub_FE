import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, HardDrive, Download, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../services/api';
import { toast } from 'sonner';

interface DocumentDetail {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  category: {
    name: string;
  } | null;
  subjectRef: {
    name: string;
    code: string | null;
  } | null;
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  useEffect(() => {
    const fetchDocDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest(`/documents/${id}`);
        setDoc(data.document || data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Lỗi khi tải chi tiết tài liệu.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDocDetail();
  }, [id]);

  useEffect(() => {
    const loadTextFile = async () => {
      if (!doc) return;
      
      const isText = doc.mimeType?.startsWith('text/') || 
                     doc.fileName?.toLowerCase().endsWith('.txt') ||
                     doc.fileName?.toLowerCase().endsWith('.json') ||
                     doc.fileName?.toLowerCase().endsWith('.js') ||
                     doc.fileName?.toLowerCase().endsWith('.ts');

      if (isText) {
        setTextLoading(true);
        try {
          const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3636';
          const fileUrl = doc.fileUrl.startsWith('http') ? doc.fileUrl : `${cleanUrl}${doc.fileUrl}`;
          
          const response = await fetch(fileUrl);
          if (response.ok) {
            const text = await response.text();
            setTextContent(text);
          } else {
            setTextContent('Không thể tải nội dung văn bản.');
          }
        } catch (err) {
          console.error('Lỗi khi fetch file text:', err);
          setTextContent('Lỗi khi kết nối để tải nội dung tài liệu.');
        } finally {
          setTextLoading(false);
        }
      } else {
        setTextContent(null);
      }
    };

    loadTextFile();
  }, [doc]);

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const data = await apiRequest(`/documents/${doc.id}/download`);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        toast.error('Không tìm thấy link tải tệp tin.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải tài liệu.');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Nút quay lại */}
      <Button asChild variant="ghost" className="rounded-xl pl-2 text-slate-500 hover:text-foreground">
        <Link to="/documents">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang tải thông tin tài liệu...</p>
        </div>
      ) : doc ? (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{doc.title}</h1>
                <p className="text-xs text-muted-foreground mt-1">File gốc: {doc.fileName}</p>
              </div>
            </div>
            <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-md shrink-0 self-start md:self-auto">
              <Download className="w-4 h-4" />
              Tải tệp tin về
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400 p-4 bg-muted/40 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Đăng lúc: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span>Dung lượng: {formatBytes(doc.fileSize)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Danh mục: {doc.category?.name || 'Chưa phân loại'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-foreground text-sm">Mô tả tài liệu</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {doc.description || 'Không có mô tả chi tiết cho tài liệu này.'}
            </p>
          </div>

          {/* Area Xem trước tài liệu */}
          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="font-bold text-foreground text-sm">Xem trước tài liệu</h3>
            <div className="w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-border">
              {(() => {
                const cleanUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3636';
                const fileUrl = doc.fileUrl.startsWith('http') ? doc.fileUrl : `${cleanUrl}${doc.fileUrl}`;
                
                const isPdf = doc.mimeType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
                const isImage = doc.mimeType?.startsWith('image/') || 
                                doc.fileName.toLowerCase().endsWith('.jpg') || 
                                doc.fileName.toLowerCase().endsWith('.jpeg') || 
                                doc.fileName.toLowerCase().endsWith('.png') || 
                                doc.fileName.toLowerCase().endsWith('.webp') || 
                                doc.fileName.toLowerCase().endsWith('.gif');
                const isText = doc.mimeType?.startsWith('text/') || 
                               doc.fileName.toLowerCase().endsWith('.txt') ||
                               doc.fileName.toLowerCase().endsWith('.json') ||
                               doc.fileName.toLowerCase().endsWith('.js') ||
                               doc.fileName.toLowerCase().endsWith('.ts');

                if (isPdf) {
                  return (
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-[600px] border-none"
                      title={doc.title}
                    />
                  );
                }

                if (isImage) {
                  return (
                    <div className="flex items-center justify-center p-6 min-h-[300px]">
                      <img
                        src={fileUrl}
                        className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm"
                        alt={doc.title}
                      />
                    </div>
                  );
                }

                if (isText) {
                  if (textLoading) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <div className="w-6 h-6 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs text-muted-foreground">Đang tải nội dung văn bản...</p>
                      </div>
                    );
                  }
                  return (
                    <div className="p-5 max-h-[500px] overflow-auto text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground bg-slate-50 dark:bg-slate-950">
                      {textContent}
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 p-6">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-500 text-sm font-semibold">
                      Định dạng file không hỗ trợ xem trước trực tiếp
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
                      Tệp tin này ({doc.fileName.split('.').pop()?.toUpperCase()}) không hỗ trợ xem trước trực tuyến. Vui lòng nhấn nút "Tải tệp tin về" để đọc tài liệu.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">Không tìm thấy tài liệu yêu cầu.</div>
      )}
    </div>
  );
}