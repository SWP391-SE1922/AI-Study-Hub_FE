import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  createChatSession,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  sendChatMessage,
  type ChatMessage,
  type ChatSession,
} from '../services/api';

function formatTime(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(value));
}

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadSessions = async () => {
    try {
      const result = await getChatSessions();
      setSessions(result);
      if (!activeSessionId && result[0]) {
        setActiveSessionId(result[0].id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách chat');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSessions();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const result = await getChatMessages(activeSessionId);
        setMessages(result);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải tin nhắn');
      }
    };

    loadMessages();
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const session = await createChatSession('Cuộc trò chuyện mới');
      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
      setMessages([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo chat mới');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?');
    if (!confirmed) return;

    try {
      await deleteChatSession(sessionId);
      setSessions((current) => current.filter((session) => session.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa chat');
    }
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setSending(true);
    setInput('');

    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: activeSessionId || 'new',
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, tempUserMessage]);

    try {
      const result = await sendChatMessage(message, activeSessionId);
      setActiveSessionId(result.session.id);
      setMessages((current) => [
        ...current.filter((item) => item.id !== tempUserMessage.id),
        ...result.messages,
      ]);
      await loadSessions();
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== tempUserMessage.id));
      toast.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="font-bold text-foreground flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              Chat AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Không dùng OpenAI API key</p>
          </div>
          <Button size="icon" className="rounded-xl" onClick={handleNewChat} title="Tạo chat mới">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground p-3">Đang tải lịch sử chat...</p>
          ) : sessions.length > 0 ? sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors ${activeSessionId === session.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-border hover:bg-accent/50'}`}
              onClick={() => setActiveSessionId(session.id)}
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-foreground">{session.title || 'Cuộc trò chuyện mới'}</p>
                <p className="text-xs text-muted-foreground truncate">{formatTime(session.updatedAt)}</p>
              </div>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteSession(session.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )) : (
            <div className="p-4 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              Chưa có cuộc trò chuyện. Bấm dấu + hoặc nhập tin nhắn để tạo mới.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Nội dung trò chuyện</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Chat này chạy bằng backend nội bộ để giữ giao diện và lịch sử, không gọi OpenAI nên không cần key.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {messages.length > 0 ? messages.map((message) => {
            const isUser = message.role === 'user' || message.role === 'USER';
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-background border border-border text-foreground'}`}>
                  <p className="whitespace-pre-line leading-6">{message.content}</p>
                  <p className={`text-[10px] mt-2 ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(message.createdAt)}</p>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-foreground">Bắt đầu hỏi AI Study Hub</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ví dụ: “JWT là gì?”, “Cách upload tài liệu?”, “FE gọi API backend như thế nào?”
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="submit" disabled={sending || !input.trim()} className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <Send className="w-4 h-4" />
            Gửi
          </Button>
        </form>
      </div>
    </div>
  );
}
