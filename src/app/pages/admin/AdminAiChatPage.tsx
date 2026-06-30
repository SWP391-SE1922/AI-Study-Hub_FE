import { useEffect, useState } from 'react';
import { AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getChatSessions, type ChatSession } from '../../services/api';

function formatDate(value?: string) {
  if (!value) return 'Không rõ';
  return new Date(value).toLocaleString('vi-VN');
}

export function AdminAiChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChatSessions();
      setSessions(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không tải được dữ liệu AI Chat.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            AI Chat Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi các phiên chat AI đang lấy từ backend.</p>
        </div>
        <Button onClick={loadSessions} disabled={loading} variant="outline" className="gap-2 rounded-xl">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
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
                sessions.map((session) => (
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
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminAiChatPage;
