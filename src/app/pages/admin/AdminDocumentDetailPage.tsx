import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, HardDrive, Download, ExternalLink, Tags, User, Lock, Unlock, History, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { downloadDocument, downloadFileFromUrl, getDocumentById, getDocumentVersions, openDocumentPreview, openFilePreview, type DocumentItem, type DocumentVersionItem } from '../../services/api';

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

function getVersionCount(doc: DocumentItem | null, versions: DocumentVersionItem[]) {
  const apiCount = (doc as (DocumentItem & { _count?: { versions?: number } }) | null)?._count?.versions || 0;
  return Math.max(doc?.currentVersion || 0, versions.length || 0, apiCount, 1);
}

export function AdminDocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadDocument = async () => {
      setLoading(true);
      try {
        const result = await getDocumentById(id);
        setDocument(result);
        setVersions(result.versions || []);

        setVersionLoading(true);
        try {
          const versionList = await getDocumentVersions(id);
          setVersions(versionList.length ? versionList : (result.versions || []));
        } catch {
          setVersions(result.versions || []);
        } finally {
          setVersionLoading(false);
        }
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

  const getVersionFile = (version: DocumentVersionItem) => ({
    fileUrl: version.fileUrl || (version.version === document?.currentVersion ? document?.fileUrl : ''),
    fileName: version.fileName || document?.fileName || `version-${version.version}`,
    mimeType: version.mimeType || document?.mimeType || '',
  });

  const handleViewVersion = (version: DocumentVersionItem) => {
    try {
      openFilePreview(getVersionFile(version));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xem version này');
    }
  };

  const handleDownloadVersion = (version: DocumentVersionItem) => {
    try {
      const file = getVersionFile(version);
      downloadFileFromUrl(file.fileUrl, file.fileName || `version-${version.version}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải version này');
    }
  };

  const displayVersions: DocumentVersionItem[] = versions.length > 0
    ? versions
    : document
      ? [{
          id: document.id,
          version: document.currentVersion || 1,
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          fileUrl: document.fileUrl,
          createdAt: document.updatedAt || document.createdAt,
        }]
      : [];

  const versionCount = getVersionCount(document, displayVersions);

  return (
    <div className="space-y-6 text-[#121214] selection:bg-[#121214] selection:text-white">
      <Button asChild variant="ghost" className="rounded-xl pl-2">
        <Link to={isAdminRoute ? '/admin/documents' : '/documents'}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      <div className="p-6 bg-white border border-[#121214]/5 rounded-3xl shadow-sm">
        {loading ? (
          <p className="text-sm text-stone-400">Đang tải chi tiết tài liệu từ API...</p>
        ) : document ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#121214] rounded-xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#121214]">{document.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-stone-500">
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                      {getDocumentCategory(document)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-500/20 font-semibold">
                      <History className="w-3.5 h-3.5" />
                      {versionCount} version
                    </span>
                    <span>ID: {document.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="rounded-xl gap-2 bg-[#121214] hover:bg-stone-800 text-white">
                  <Download className="w-4 h-4" />
                  Tải về
                </Button>
                <Button onClick={handleOpenFile} variant="outline" className="rounded-xl gap-2 border border-[#121214]/10 hover:bg-[#f8f9fa]">
                  <ExternalLink className="w-4 h-4" />
                  Mở file
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 rounded-2xl border border-[#121214]/5 bg-[#f8f9fa] p-5">
                <h2 className="font-semibold text-[#121214] mb-3">Mô tả / xem trước nội dung</h2>

                {document.description?.trim() && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Mô tả ghi chú</p>
                    <p className="text-sm leading-6 text-stone-600 whitespace-pre-line">
                      {document.description}
                    </p>
                  </div>
                )}

                {document.contentPreview?.trim() && (
                  <div className="rounded-xl border border-[#121214]/5 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Nội dung trích từ file</p>
                    <p className="text-sm leading-6 text-stone-600 whitespace-pre-line max-h-72 overflow-y-auto pr-2">
                      {document.contentPreview}
                    </p>
                  </div>
                )}

                {!document.description?.trim() && !document.contentPreview?.trim() && (
                  <p className="text-sm leading-6 text-stone-500">
                    Chưa đọc được nội dung xem trước từ file này. Hiện hệ thống hỗ trợ trích nội dung cho TXT/CSV/JSON/MD và file Office mới như DOCX, PPTX, XLSX.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#121214]/5 bg-[#f8f9fa] p-5 space-y-3">
                <h2 className="font-semibold text-[#121214]">Phân loại</h2>
                <div className="text-sm text-stone-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-stone-400" />
                    <span>Danh mục: {document.category?.name || 'Chưa phân loại'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span>Môn học: {document.subjectRef?.name || document.subject || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.isPublic ? <Unlock className="w-4 h-4 text-stone-400" /> : <Lock className="w-4 h-4 text-stone-400" />}
                    <span>{document.isPublic ? 'Tài liệu công khai' : 'Tài liệu riêng tư'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-600 mb-6">
              <div className="flex items-center gap-2 rounded-xl border border-[#121214]/5 p-3">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>Ngày tải lên: {formatDate(document.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#121214]/5 p-3">
                <HardDrive className="w-4 h-4 text-stone-400" />
                <span>Dung lượng: {formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#121214]/5 p-3">
                <FileText className="w-4 h-4 text-stone-400" />
                <span>Tên file: {document.fileName}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#121214]/5 p-3">
                <User className="w-4 h-4 text-stone-400" />
                <span>Người tải: {document.user?.fullName || 'Không rõ'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#121214]/5 p-3">
                <Download className="w-4 h-4 text-stone-400" />
                <span>Lượt tải: {document.downloadCount ?? 0}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8f9fa] border border-[#121214]/5 p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-[#121214]">Xem lại lịch sử phiên bản</h2>
                  <p className="text-xs text-stone-500 mt-1">Tài liệu này hiện có {versionCount} version.</p>
                </div>
                <span className="text-xs font-semibold text-[#121214] bg-white border border-[#121214]/10 px-3 py-1 rounded-full shadow-sm">
                  Version hiện tại: {document.currentVersion || versions[0]?.version || 1}
                </span>
              </div>

              {versionLoading ? (
                <p className="text-sm text-stone-500">Đang tải lịch sử version...</p>
              ) : displayVersions.length > 0 ? (
                <div className="space-y-2">
                  {displayVersions.map((version) => (
                    <div key={version.id || version.version} className="text-sm text-stone-600 border border-[#121214]/5 bg-white rounded-xl p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-[#121214]">Version {version.version}</p>
                          <p className="break-all">{version.fileName}</p>
                          <p className="text-xs mt-1 text-stone-400">{formatFileSize(version.fileSize)} • {formatDate(version.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-2 hover:bg-[#f8f9fa] text-[#121214]"
                            onClick={() => handleViewVersion(version)}
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-2 hover:bg-[#f8f9fa] text-[#121214]"
                            onClick={() => handleDownloadVersion(version)}
                          >
                            <Download className="w-4 h-4" />
                            Tải
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">Chưa có lịch sử version cho tài liệu này.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-stone-400">Không tìm thấy tài liệu.</p>
        )}
      </div>
    </div>
  );
}
