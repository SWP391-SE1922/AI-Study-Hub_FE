import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, MessageSquare, Plus, Send, Trash2, Shield, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Magnetic } from '../components/Magnetic';
import {
  createChatSession,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  streamChatMessage,
  getDocuments,
  getResources,
  type ChatMessage,
  type ChatSession,
} from '../services/api';

function formatTime(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(value));
}

// Simple Helper to parse code blocks in chat messages
function FormattedMessage({ content }: { content: string }) {
  if (!content.includes('```')) {
    return <p className="whitespace-pre-line leading-relaxed font-sans">{content}</p>;
  }

  const parts = content.split('```');
  return (
    <div className="space-y-3 font-sans">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          // Regular text
          return <p key={index} className="whitespace-pre-line leading-relaxed">{part}</p>;
        } else {
          // Code block
          const lines = part.split('\n');
          const lang = lines[0]?.trim() || 'code';
          const codeText = lines.slice(1).join('\n');
          return (
            <div key={index} className="border border-white/5 rounded-lg overflow-hidden bg-black/40 font-mono text-xs my-2">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">{lang}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeText.trim());
                    toast.success('Đã sao chép code!');
                  }}
                  className="text-stone-500 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-stone-300 leading-relaxed">
                <code>{codeText.trim()}</code>
              </pre>
            </div>
          );
        }
      })}
    </div>
  );
}

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const lastMessage = chatContainerRef.current.lastElementChild;
      if (lastMessage) {
        gsap.fromTo(
          lastMessage,
          { opacity: 0, y: 15, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
    }
  }, [messages.length]);

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

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.id || null;
    } catch {
      return null;
    }
  };

  const buildFolderContext = async () => {
    try {
      // 1. Lấy danh sách folders ở root
      const rootRes = await getResources(null);
      const foldersList = rootRes.folders || [];
      if (foldersList.length === 0) return '';

      let context = `Dưới đây là cấu trúc thư mục lưu trữ tài liệu học tập của tôi:\n`;
      for (const folder of foldersList) {
        // Tải danh sách tệp tin nằm trong thư mục này
        const folderRes = await getResources(folder.id);
        const folderDocs = folderRes.files || [];
        if (folderDocs.length > 0) {
          context += `- Thư mục "${folder.name}" đang có ${folderDocs.length} tài liệu (files) tên là: ${folderDocs.map((d: any) => `"${d.title}"`).join(', ')}\n`;
        } else {
          context += `- Thư mục "${folder.name}" hiện đang trống (0 tài liệu)\n`;
        }
      }
      
      const rootDocs = rootRes.files || [];
      if (rootDocs.length > 0) {
        context += `- Các tài liệu ngoài thư mục gốc: ${rootDocs.map((d: any) => `"${d.title}"`).join(', ')}\n`;
      }
      context += `\nHướng dẫn trả lời: Hãy sử dụng cấu trúc thư mục ở trên để trả lời chính xác số lượng tài liệu (files) trong thư mục mà tôi hỏi. Lưu ý phân biệt rõ giữa số lượng tài liệu (files) trong thư mục và số trang (pages) của từng tài liệu. Ví dụ thư mục "swd" chỉ có duy nhất 1 tài liệu.\n`;
      return context;
    } catch (err) {
      console.error(err);
      return '';
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

    const tempAiMessage: ChatMessage = {
      id: `temp-ai-${Date.now()}`,
      sessionId: activeSessionId || 'new',
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, tempUserMessage, tempAiMessage]);

    try {
      const folderContext = await buildFolderContext();
      const promptToSend = folderContext ? `${folderContext}Câu hỏi của người dùng: ${message}` : message;

      const result = await streamChatMessage(promptToSend, activeSessionId, (chunk) => {
        setMessages((current) => {
          const newMessages = [...current];
          const aiMsgIndex = newMessages.findIndex((m) => m.id === tempAiMessage.id);
          if (aiMsgIndex !== -1) {
            newMessages[aiMsgIndex] = {
              ...newMessages[aiMsgIndex],
              content: newMessages[aiMsgIndex].content + chunk
            };
          }
          return newMessages;
        });
      });

      if (result) {
        setActiveSessionId(result.session.id);
        setMessages((current) => [
          ...current.filter((item) => item.id !== tempUserMessage.id && item.id !== tempAiMessage.id),
          ...result.messages,
        ]);
        await loadSessions();
      }
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== tempUserMessage.id && item.id !== tempAiMessage.id));
      toast.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Sessions Sidebar */}
      <div className="rounded-xl border border-white/5 bg-zinc-900 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Chat Console
            </h2>
          </div>
          <button
            onClick={handleNewChat}
            className="p-1 text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
            title="Mở chat mới"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <p className="text-[10px] font-mono text-stone-500 p-2">Loading sessions...</p>
          ) : sessions.length > 0 ? sessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <div
                key={session.id}
                className={`group flex items-center gap-2 rounded-lg p-2.5 cursor-pointer transition-all relative
                ${isActive ? 'bg-white/5 text-white font-bold' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveSessionId(session.id)}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r" />}
                <MessageSquare className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate uppercase tracking-wide">{session.title || 'Mục trò chuyện'}</p>
                </div>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-500 hover:text-rose-400 hover:bg-white/5"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          }) : (
            <div className="p-3 text-[10px] font-mono text-stone-500 border border-dashed border-white/5 rounded-lg">
              No chat logs found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="rounded-xl border border-white/5 bg-zinc-900 overflow-hidden flex flex-col relative">
        {/* Chat panel top header */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold">Workspace Agent</p>
            </div>
          </div>
        </div>

        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length > 0 ? (
            <div ref={chatContainerRef} className="space-y-4">
              {messages.map((message) => {
                const isUser = message.role === 'user' || message.role === 'USER';
                let displayContent = message.content;
                if (isUser && displayContent.includes('Câu hỏi của người dùng:')) {
                  displayContent = displayContent.split('Câu hỏi của người dùng:').pop() || displayContent;
                }
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 text-xs tracking-wide leading-relaxed font-mono
                      ${isUser
                        ? 'bg-zinc-800 text-white border border-white/5 shadow-sm'
                        : 'bg-zinc-950/60 border border-white/5 text-stone-300'}`}
                    >
                      {displayContent.trim() ? (
                        <FormattedMessage content={displayContent.trim()} />
                      ) : (
                        <div className="flex items-center gap-1.5 h-5 py-1">
                          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px] text-stone-500">
                        <span>{isUser ? 'USER' : 'ASSISTANT'}</span>
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-stone-400 flex items-center justify-center mx-auto">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest font-mono">Developer AI Console</h3>
                  <p className="text-[10px] text-stone-500 font-mono mt-1">
                    Ask questions about your codebase, APIs, databases or deployment steps.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Dock */}
        <div className="p-4 bg-zinc-900 border-t border-white/5">
          <form onSubmit={handleSend} className="relative flex items-center bg-zinc-950 border border-white/5 rounded-xl p-1.5 focus-within:ring-1 focus-within:ring-white/20 transition-all">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-stone-600 font-mono"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-white text-black p-2 rounded-lg hover:bg-stone-200 disabled:bg-zinc-800 disabled:text-stone-600 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

