import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '../ui/button';
import type { CategoryItem, DocumentMetadata } from '../../services/api';

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  fileName?: string;
  categories: CategoryItem[];
  submitting?: boolean;
  initialValues?: Partial<DocumentMetadata>;
  allowFileChange?: boolean;
  onClose: () => void;
  onSubmit: (metadata: DocumentMetadata, file?: File | null) => void;
};

export function DocumentMetadataDialog({
  open,
  title,
  submitLabel,
  fileName,
  categories,
  submitting = false,
  initialValues,
  allowFileChange = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<DocumentMetadata>({
    title: '',
    description: '',
    subject: '',
    categoryId: '',
    isPublic: false,
  });
  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: initialValues?.title || fileName || '',
      description: initialValues?.description || '',
      subject: initialValues?.subject || '',
      categoryId: initialValues?.categoryId || '',
      isPublic: initialValues?.isPublic ?? false,
    });
    setReplacementFile(null);
  }, [open, fileName, initialValues?.title, initialValues?.description, initialValues?.subject, initialValues?.categoryId, initialValues?.isPublic]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description?.trim() || '',
      subject: form.subject?.trim() || '',
      categoryId: form.categoryId || '',
      isPublic: form.isPublic ?? true,
    }, replacementFile);
  };

  const handleReplacementFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReplacementFile(event.target.files?.[0] || null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{title}</h2>
              {fileName && <p className="text-xs text-muted-foreground truncate max-w-[340px]">{fileName}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tiêu đề tài liệu</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Slide chương 1"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Môn học / chủ đề *</label>
            <input
              value={form.subject || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              required
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Software Testing, Cấu trúc dữ liệu..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả / ghi chú nội dung</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập mô tả ngắn để khi xem chi tiết biết tài liệu dùng cho nội dung nào..."
            />
          </div>

          {allowFileChange && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">File mới để tạo version</label>
              <input
                type="file"
                onChange={handleReplacementFileChange}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-muted-foreground">
                Không chọn file thì chỉ sửa thông tin. Chọn file mới thì backend sẽ tạo version mới nếu API hỗ trợ.
              </p>
              {replacementFile && (
                <p className="text-xs font-semibold text-indigo-500 break-all">Đã chọn: {replacementFile.name}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl">
              Hủy
            </Button>
            <Button type="submit" disabled={submitting || !form.title.trim()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              {submitting ? 'Đang lưu...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
