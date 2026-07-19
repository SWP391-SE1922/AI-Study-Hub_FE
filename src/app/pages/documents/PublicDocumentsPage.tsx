import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Folder, FileText, ChevronRight, ChevronDown, Download, Eye } from 'lucide-react';
import { getPublicDocuments, openDocumentPreview, downloadDocument, type DocumentItem } from '../../services/api';
import { toast } from 'sonner';

interface SubjectGroup {
    id: string;
    name: string;
    code: string;
    documents: DocumentItem[];
}

interface CategoryGroup {
    name: string;
    subjects: Record<string, SubjectGroup>;
}

const PUBLIC_DOCUMENTS_PAGE_SIZE = 50;
const SUBJECT_DOCUMENTS_PAGE_SIZE = 8;

export function PublicDocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Lưu trạng thái đóng/mở của Danh mục
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Lưu mã môn học đang được chọn để hiển thị danh sách file ngay phía dưới
    const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
    const [subjectPages, setSubjectPages] = useState<Record<string, number>>({});

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setSelectedSubjectCode(null);
        setSubjectPages({});
    }, [debouncedSearch]);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                setLoading(true);
                // Lấy đủ tất cả trang tài liệu công khai để tổng số ở User khớp với số công khai bên Admin.
                const firstResult = await getPublicDocuments({
                    page: 1,
                    limit: PUBLIC_DOCUMENTS_PAGE_SIZE,
                    search: debouncedSearch.trim() || undefined,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                });

                const allDocuments = [...(firstResult.documents || [])];
                const totalPages = Math.max(1, Number(firstResult.pagination?.totalPages || 1));

                for (let page = 2; page <= totalPages; page += 1) {
                    const nextResult = await getPublicDocuments({
                        page,
                        limit: PUBLIC_DOCUMENTS_PAGE_SIZE,
                        search: debouncedSearch.trim() || undefined,
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                    });
                    allDocuments.push(...(nextResult.documents || []));
                }

                // Lọc lại lần nữa ở frontend để tài liệu riêng tư không xuất hiện nếu backend cũ chưa lọc chuẩn.
                const onlyPublic = allDocuments.filter((doc) => doc.isPublic !== false);
                setDocuments(onlyPublic);
            } catch (error: any) {
                console.error(error);
                toast.error(error?.message || 'Không thể tải danh sách tài liệu cộng đồng');
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [debouncedSearch]);

    // Nhóm dữ liệu theo Danh mục -> Môn học
    // GHI CHÚ: field danh mục đang giả định là doc.categoryRef?.name || doc.category.
    // Nếu backend đặt tên field khác, chỉ cần sửa dòng "categoryName" bên dưới.
    const groupDataByCategoryAndSubject = useMemo(() => {
        const groups: Record<string, CategoryGroup> = {};

        documents.forEach((doc) => {
            const categoryName = doc.category?.name || 'Chưa phân loại';
            const subjectCode = doc.subjectRef?.code || doc.subject || 'KHAC';
            const subjectName = doc.subjectRef?.name || doc.subject || 'Môn học khác';

            if (!groups[categoryName]) {
                groups[categoryName] = { name: categoryName, subjects: {} };
            }

            if (!groups[categoryName].subjects[subjectCode]) {
                groups[categoryName].subjects[subjectCode] = {
                    id: doc.subjectId || subjectCode,
                    name: subjectName,
                    code: subjectCode,
                    documents: [],
                };
            }

            groups[categoryName].subjects[subjectCode].documents.push(doc);
        });

        // Sắp xếp Danh mục theo alphabet, "Chưa phân loại" luôn xuống cuối
        return Object.keys(groups)
            .sort((a, b) => {
                if (a === 'Chưa phân loại') return 1;
                if (b === 'Chưa phân loại') return -1;
                return a.localeCompare(b);
            })
            .reduce((acc, key) => {
                acc[key] = groups[key];
                return acc;
            }, {} as Record<string, CategoryGroup>);
    }, [documents]);

    // Mặc định mở tất cả danh mục khi dữ liệu thay đổi
    useEffect(() => {
        const keys = Object.keys(groupDataByCategoryAndSubject);
        if (keys.length > 0) {
            setExpandedCategories((prev) => {
                const next = { ...prev };
                keys.forEach((k) => {
                    if (next[k] === undefined) next[k] = true;
                });
                return next;
            });
        }
    }, [groupDataByCategoryAndSubject]);

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };

    const handleSubjectClick = (subjectCode: string) => {
        // Nếu bấm lại môn đang chọn thì đóng xuống, ngược lại thì mở môn mới
        setSelectedSubjectCode(prev => {
            const nextSubjectCode = prev === subjectCode ? null : subjectCode;
            if (nextSubjectCode) {
                setSubjectPages(pages => ({ ...pages, [nextSubjectCode]: pages[nextSubjectCode] || 1 }));
            }
            return nextSubjectCode;
        });
    };

    const changeSubjectPage = (subjectCode: string, page: number, totalPages: number) => {
        const safePage = Math.min(Math.max(page, 1), totalPages);
        setSubjectPages(prev => ({ ...prev, [subjectCode]: safePage }));
    };

    const handleDownload = async (doc: DocumentItem) => {
        try {
            toast.loading(`Đang tải xuống: ${doc.title}...`, { id: doc.id });
            await downloadDocument(doc.id, doc.fileName);
            toast.success('Tải tài liệu thành công!', { id: doc.id });
        } catch (error: any) {
            toast.error(error?.message || 'Lỗi khi tải tài liệu', { id: doc.id });
        }
    };

    return (
        <div className="space-y-6">
            {/* Khối Tiêu Đề */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Tài liệu cộng đồng
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tra cứu hệ thống tài liệu công khai phân chia chi tiết theo danh mục và môn học.
                </p>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm nhanh môn học hoặc mã tài liệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#15102E]/40 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-foreground"
                    />
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    Tổng số: <span className="text-indigo-400 font-bold">{documents.length}</span> tài liệu công khai
                </div>
            </div>

            {/* Giao diện cây danh mục */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-24 space-y-3">
                    <Loader2 className="w-9 h-9 animate-spin text-indigo-500" />
                    <p className="text-sm text-muted-foreground">Đang tải cấu trúc danh mục...</p>
                </div>
            ) : Object.keys(groupDataByCategoryAndSubject).length === 0 ? (
                <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center bg-white/50 dark:bg-[#15102E]/10">
                    <p className="text-muted-foreground text-sm">Không tìm thấy tài liệu hoặc môn học nào phù hợp.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupDataByCategoryAndSubject).map(([categoryName, categoryGroup]) => {
                        const totalDocsInCategory = Object.values(categoryGroup.subjects).reduce((sum, s) => sum + s.documents.length, 0);
                        return (
                            <div
                                key={categoryName}
                                className="space-y-4 bg-white dark:bg-[#130E2E]/40 border border-indigo-500/10 dark:border-indigo-400/10 rounded-2xl p-5 shadow-[0_0_25px_-8px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_-6px_rgba(99,102,241,0.5)] transition-shadow duration-300"
                            >

                                {/* Header Danh Mục */}
                                <button
                                    onClick={() => toggleCategory(categoryName)}
                                    className="flex items-center gap-3 w-full text-left group"
                                >
                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0 shadow-[0_0_12px_-2px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_18px_-2px_rgba(99,102,241,0.8)] transition-shadow">
                                        {expandedCategories[categoryName] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </span>
                                    <span className="font-bold text-lg text-indigo-500 dark:text-indigo-300 tracking-tight">
                                        {categoryName}
                                    </span>
                                    <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        {totalDocsInCategory} tài liệu · {Object.keys(categoryGroup.subjects).length} môn
                                    </span>
                                </button>

                                {/* Grid danh sách Môn học */}
                                {expandedCategories[categoryName] && (
                                    <div className="space-y-4 pt-1 border-t border-indigo-500/10">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-4">
                                            {Object.values(categoryGroup.subjects).map((sub) => {
                                                const isSelected = selectedSubjectCode === sub.code;
                                                return (
                                                    <button
                                                        key={sub.code}
                                                        onClick={() => handleSubjectClick(sub.code)}
                                                        title={`${sub.code} - ${sub.name}`}
                                                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${isSelected
                                                            ? 'bg-indigo-600/15 text-indigo-300 border-indigo-400/60 shadow-[0_0_16px_-3px_rgba(99,102,241,0.7)]'
                                                            : 'bg-slate-50 dark:bg-[#15102E]/60 hover:bg-indigo-500/5 dark:hover:bg-[#1c1642]/80 text-foreground border-slate-200 dark:border-white/10 hover:border-indigo-400/40 hover:shadow-[0_0_14px_-4px_rgba(99,102,241,0.45)]'
                                                            }`}
                                                    >
                                                        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-300' : 'text-amber-500 dark:text-amber-400/90'}`} />
                                                        <span className="truncate flex-1 text-left">
                                                            {sub.code}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isSelected ? 'bg-indigo-400/20 text-indigo-200' : 'bg-slate-200 dark:bg-white/10 text-muted-foreground'}`}>
                                                            {sub.documents.length}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Vùng hiển thị file thuộc môn được chọn, chia 8 tài liệu mỗi trang */}
                                        {Object.values(categoryGroup.subjects).some(sub => sub.code === selectedSubjectCode) && (() => {
                                            const selectedSubject = categoryGroup.subjects[selectedSubjectCode!];
                                            const selectedDocuments = selectedSubject?.documents || [];
                                            const totalPages = Math.max(1, Math.ceil(selectedDocuments.length / SUBJECT_DOCUMENTS_PAGE_SIZE));
                                            const currentPage = Math.min(subjectPages[selectedSubjectCode!] || 1, totalPages);
                                            const startIndex = (currentPage - 1) * SUBJECT_DOCUMENTS_PAGE_SIZE;
                                            const visibleDocuments = selectedDocuments.slice(startIndex, startIndex + SUBJECT_DOCUMENTS_PAGE_SIZE);

                                            return (
                                                <div className="bg-slate-50 dark:bg-[#0F0A24]/80 border border-indigo-400/25 rounded-xl p-4 space-y-1 shadow-[0_0_22px_-6px_rgba(99,102,241,0.4)] animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-indigo-500 dark:text-indigo-300 mb-2 px-1 pb-2 border-b border-indigo-400/15">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">{selectedSubjectCode} — {selectedSubject?.name}</span>
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                                            Hiển thị {selectedDocuments.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + SUBJECT_DOCUMENTS_PAGE_SIZE, selectedDocuments.length)} / {selectedDocuments.length} tài liệu
                                                        </span>
                                                    </div>

                                                    <div className="divide-y divide-slate-200 dark:divide-white/5">
                                                        {visibleDocuments.map((doc) => (
                                                            <div
                                                                key={doc.id}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-2 rounded-lg hover:bg-indigo-500/5 dark:hover:bg-white/5 transition-colors gap-3 group"
                                                            >
                                                                <div className="flex items-start gap-3 min-w-0">
                                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                                                        <FileText className="w-4 h-4 text-indigo-400" />
                                                                    </span>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-semibold text-foreground truncate max-w-xl" title={doc.title}>
                                                                            {doc.title}
                                                                        </div>
                                                                        <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                                                            <span>Đăng bởi: <span className="text-slate-600 dark:text-slate-300 font-medium">{doc.user?.fullName || 'Thành viên'}</span></span>
                                                                            <span>Cập nhật: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Các nút hành động thao tác file nhanh */}
                                                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                                    <button
                                                                        onClick={() => handleDownload(doc)}
                                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-200/70 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-foreground transition-colors"
                                                                    >
                                                                        <Download className="w-3 h-3" /> Tải về
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openDocumentPreview(doc)}
                                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_12px_-2px_rgba(99,102,241,0.7)] hover:shadow-[0_0_16px_-1px_rgba(99,102,241,0.9)] transition-shadow"
                                                                    >
                                                                        <Eye className="w-3 h-3" /> Xem trước
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {totalPages > 1 && (
                                                        <div className="flex justify-end gap-3 pt-3 px-1">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    disabled={currentPage === 1}
                                                                    onClick={() => changeSubjectPage(selectedSubjectCode!, currentPage - 1, totalPages)}
                                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500/10 transition-colors"
                                                                >
                                                                    Trước
                                                                </button>
                                                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                                                    <button
                                                                        key={pageNumber}
                                                                        type="button"
                                                                        onClick={() => changeSubjectPage(selectedSubjectCode!, pageNumber, totalPages)}
                                                                        className={`min-w-8 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors ${pageNumber === currentPage
                                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_12px_-4px_rgba(99,102,241,0.8)]'
                                                                            : 'border-slate-200 dark:border-white/10 hover:bg-indigo-500/10'
                                                                            }`}
                                                                    >
                                                                        {pageNumber}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    disabled={currentPage === totalPages}
                                                                    onClick={() => changeSubjectPage(selectedSubjectCode!, currentPage + 1, totalPages)}
                                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500/10 transition-colors"
                                                                >
                                                                    Sau
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}