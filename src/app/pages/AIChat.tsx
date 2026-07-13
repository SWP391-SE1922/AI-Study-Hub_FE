import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Send, Sparkles, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

// Định nghĩa kiểu dữ liệu cấu trúc tin nhắn
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export function AIChat() {
  // 1. Quản lý danh sách tin nhắn (mặc định hiển thị câu chào từ Trợ lý AI)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! Tôi là AI Assistant của AI Study Hub. Tôi có thể giúp bạn giải đáp thắc mắc về tài liệu học tập, giải thích kiến thức, và hỗ trợ làm bài tập. Bạn cần tôi giúp gì?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // 2. Các trạng thái quản lý ô nhập liệu, session và hiệu ứng loading
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(""); // Lưu sessionId nếu Backend phản hồi

  // Ref bổ trợ tự động cuộn xuống tin nhắn mới nhất
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 3. Hàm xử lý gửi tin nhắn lên cổng API Backend Express
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Hiển thị tin nhắn của Người dùng lên màn hình ngay lập tức
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gọi chính xác đến endpoint POST /api/ai/chat trong hệ thống của bạn
      const response = await fetch('http://localhost:3636/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Đính kèm token đăng nhập nếu dự án của bạn lưu trữ trong localStorage
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          message: textToSend,
          sessionId: currentSessionId // Truyền sessionId hiện tại lên (nếu có)
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối với hệ thống máy chủ Backend.');
      }

      const data = await response.json();

      // Kiểm tra dữ liệu trả về từ aiController và cập nhật tin nhắn AI
      if (data) {
        // Tự động phân tách dữ liệu chuỗi phản hồi tùy theo cấu trúc controller của bạn
        const aiReply = data.reply || data.content || data.message || (data.data && data.data.reply) || "AI đã xử lý nhưng không trả về định dạng chuỗi phù hợp.";

        // Cập nhật sessionId nếu backend tạo phiên mới
        if (data.sessionId) {
          setCurrentSessionId(data.sessionId);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi chat:', error);
      // Hiển thị trực quan thông báo lỗi vào khung hội thoại cho người dùng dễ nhận biết
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '❌ Lỗi hệ thống: Không thể kết nối tới lõi AI Local hoặc phiên đăng nhập hết hạn. Bạn hãy chắc chắn đã bật Ollama và chạy lệnh `npm run dev` ở Backend.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi người dùng ấn nút tạo chat mới hoặc làm sạch lịch sử hội thoại hiện tại
  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới cuộc hội thoại này?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Cuộc hội thoại đã được làm mới thành công. Hãy nhập câu hỏi học tập tiếp theo của bạn nào!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCurrentSessionId(""); // Xóa trắng session để tạo phiên chat mới ở lượt gửi tiếp theo
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)] p-1">

      {/* Khung Lịch sử Chat bên trái - Responsive ẩn hiện mượt mà */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border">
          <Button
            onClick={handleClearChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-all"
          >
            <Plus className="w-4 h-4" />
            Chat mới
          </Button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">Lịch sử chat</p>
          <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Chat hiện tại</span>
          </button>
        </div>
      </div>

      {/* Khung nội dung hội thoại chính bên phải */}
      <div className="lg:col-span-3 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">

        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm sm:text-base">AI Study Assistant</h2>
              <p className="text-xs text-muted-foreground">Trợ lý học tập thông minh (Qwen 2.5 Local)</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-destructive rounded-xl w-9 h-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Khối hiển thị nội dung các tin nhắn hội thoại */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md ${msg.role === 'user' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-indigo-600 shadow-blue-500/30'
                }`}>
                {msg.role === 'user' ? <MessageSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {/* Thuộc tính whitespace-pre-wrap giúp hiển thị danh sách, code xuống hàng từ AI chuẩn chỉnh */}
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed border whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700 text-left'
                    : 'bg-muted text-foreground rounded-tl-none border-border/50 text-left'
                  }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground block px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Hiển thị dòng trạng thái xoay vòng khi AI đang xử lý câu trả lời */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-blue-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-tl-none border border-border/50 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                Trợ lý AI đang suy nghĩ câu trả lời...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Khối gợi ý câu hỏi thông minh (Chỉ hiện thị ở lượt đầu để tránh chiếm diện tích) */}
          {messages.length <= 2 && (
            <div className="pt-4 max-w-2xl mx-auto space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Gợi ý câu hỏi trợ giúp học tập</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Giải thích về cấu trúc dữ liệu Stack',
                  'Tóm tắt nội dung bài giảng Toán cao cấp',
                  'Hướng dẫn cách làm bài tập Java',
                  'So sánh Array và Linked List'
                ].map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(text)}
                    className="flex items-center justify-between text-left p-3 rounded-xl border border-border bg-background hover:bg-accent text-sm text-foreground transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium">{text}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Khung ô biểu mẫu nhập tin nhắn ở đáy */}
        <div className="p-4 border-t border-border bg-muted/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Vui lòng đợi trợ lý phản hồi xong..." : "Nhập câu hỏi học tập của bạn..."}
              className="w-full bg-background border border-border rounded-xl pl-4 pr-24 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-semibold text-muted-foreground border border-border bg-muted px-1.5 py-0.5 rounded-md">Enter ↵</span>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/40 hover:shadow-blue-500/60 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}