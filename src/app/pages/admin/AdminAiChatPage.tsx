import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getChatSessions, type ChatSession } from '../../services/api';

const glowCard =
  'border-sky-500/10 dark:border-sky-400/10 bg-white dark:bg-slate-900 ' +
  'shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_8px_30px_-8px_rgba(56,189,248,0.35)] ' +
  'dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_8px_35px_-6px_rgba(56,189,248,0.25)] ' +
  'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_12px_45px_-8px_rgba(56,189,248,0.55)] ' +
  'dark:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_12px_45px_-8px_rgba(56,189,248,0.45)] ' +
  'transition-shadow duration-300';

function formatDate(value?: string) {
  if (!value) return 'Không rõ';
  return new Date(value).toLocaleString('vi-VN');
}

export function AdminAiChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getChatSessions();
      setSessions(data || []);
      setPage(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không tải được dữ liệu AI Chat.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const paginatedSessions = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Chat Admin</h1>
            <p className="text-muted-foreground mt-1">Theo dõi các phiên chat AI.</p>
          </div>
        </div>
        <Button onClick={loadSessions} disabled={loading} variant="outline" className="gap-2 hover:border-sky-400/50 hover:text-sky-500">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      <Card className={glowCard}>
        <CardHeader>
          <CardTitle>Danh sách phiên chat</CardTitle>
          <CardDescription>Tổng cộng {sessions.length} phiên chat.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="py-4 px-6">Tiêu đề</TableHead>
                <TableHead className="py-4 px-4">Số tin nhắn</TableHead>
                <TableHead className="py-4 px-4">Ngày tạo</TableHead>
                <TableHead className="py-4 px-4">Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Đang tải dữ liệu AI Chat...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Chưa có phiên chat nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                    <TableCell className="py-4 px-6 font-semibold text-sm">{session.title || 'Cuộc trò chuyện mới'}</TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge variant="secondary">{session.messages?.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-muted-foreground text-xs">{formatDate(session.createdAt)}</TableCell>
                    <TableCell className="py-4 px-4 text-muted-foreground text-xs">{formatDate(session.updatedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {sessions.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-4 pb-4">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sessions.length)}/{sessions.length} phiên chat
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminAiChatPage;
