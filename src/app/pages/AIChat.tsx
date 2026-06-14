import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Send, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiRequest } from '../services/api';
import { toast } from 'sonner';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là AI Assistant của AI Study Hub. Tôi có thể giúp bạn giải đáp thắc mắc về tài liệu học tập, giải thích kiến thức, và hỗ trợ làm bài tập. Bạn cần tôi giúp gì?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { sender: 'user', text, time: timeString };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const data = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });

      const aiMsg: Message = {
        sender: 'ai',
        text: data.reply || 'Không nhận được câu trả lời từ AI.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi kết nối với máy chủ AI');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue);
    }
  };

  const clearChat = () => {
    if (confirm('Bạn có chắc muốn xóa lịch sử chat này?')) {
      setMessages([
        {
          sender: 'ai',
          text: 'Lịch sử chat đã được làm sạch. Bạn cần tôi trợ giúp gì tiếp theo?',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Bắt đầu cuộc trò chuyện mới. Tôi có thể giúp gì cho việc học của bạn hôm nay?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)] p-1 text-slate-900 dark:text-slate-100">
      {/* Khung Lịch sử Chat bên trái */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border">
          <Button onClick={startNewChat} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Chat mới
          </Button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">Lịch sử chat</p>
          <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Chat hiện tại ({messages.length} tin nhắn)</span>
          </button>
        </div>
      </div>

      {/* Khung nội dung hội thoại bên phải */}
      <div className="lg:col-span-3 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm sm:text-base">AI Study Assistant</h2>
              <p className="text-xs text-muted-foreground">Trợ lý học tập thông minh</p>
            </div>
          </div>
          <Button onClick={clearChat} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-xl w-9 h-9">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Khối tin nhắn */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  msg.sender === 'user' ? 'bg-indigo-500' : 'bg-indigo-600'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none text-left'
                      : 'bg-muted text-foreground border-border/50 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground block px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl self-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-muted text-foreground p-3.5 rounded-2xl rounded-tl-none text-sm leading-relaxed border border-border/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          {/* Gợi ý câu hỏi khi không có hội thoại dài */}
          {messages.length <= 1 && (
            <div className="pt-8 max-w-2xl mx-auto space-y-3 w-full mt-auto">
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
                    onClick={() => sendMessage(text)}
                    className="flex items-center justify-between text-left p-3 rounded-xl border border-border bg-background hover:bg-accent text-sm text-foreground transition-all group w-full"
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

        {/* Khung ô nhập tin nhắn ở đáy */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full bg-background border border-border rounded-xl pl-4 pr-24 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-75"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-semibold text-muted-foreground border border-border bg-muted px-1.5 py-0.5 rounded-md">Enter ↵</span>
              <Button
                onClick={() => sendMessage(inputValue)}
                disabled={loading || !inputValue.trim()}
                size="icon"
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}