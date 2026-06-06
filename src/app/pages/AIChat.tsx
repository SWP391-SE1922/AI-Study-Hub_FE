import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, FileText, History, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  'Giải thích về cấu trúc dữ liệu Stack',
  'Tóm tắt nội dung bài giảng Toán cao cấp',
  'Hướng dẫn cách làm bài tập Java',
  'So sánh Array và Linked List'
];

const mockResponses = [
  'Stack là một cấu trúc dữ liệu hoạt động theo nguyên tắc LIFO (Last In First Out). Phần tử cuối cùng được thêm vào sẽ là phần tử đầu tiên được lấy ra. Stack có các thao tác cơ bản như push (thêm phần tử), pop (lấy phần tử), và peek (xem phần tử trên cùng).',
  'Tôi sẽ giúp bạn tóm tắt nội dung bài giảng Toán cao cấp. Vui lòng cho tôi biết chương nào bạn muốn tìm hiểu.',
  'Để làm bài tập Java hiệu quả, bạn nên: 1) Đọc kỹ đề bài, 2) Phân tích yêu cầu, 3) Thiết kế thuật toán, 4) Viết code và test từng phần nhỏ, 5) Debug và tối ưu hóa.',
  'Array và Linked List có những điểm khác biệt chính: Array lưu trữ liên tiếp trong bộ nhớ, truy cập nhanh O(1), nhưng kích thước cố định. Linked List lưu trữ rời rạc, truy cập O(n), nhưng linh hoạt về kích thước.'
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Xin chào! Tôi là AI Assistant của AI Study Hub. Tôi có thể giúp bạn giải đáp thắc mắc về tài liệu học tập, giải thích kiến thức, và hỗ trợ làm bài tập. Bạn cần tôi giúp gì?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage: Message = {
        id: Date.now(),
        role: 'assistant',
        content: mockResponses[responseIndex],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Xin chào! Tôi là AI Assistant của AI Study Hub. Tôi có thể giúp bạn giải đáp thắc mắc về tài liệu học tập, giải thích kiến thức, và hỗ trợ làm bài tập. Bạn cần tôi giúp gì?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 text-slate-300">
      {/* Sidebar Lịch sử */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="h-full border-slate-800 bg-slate-900 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <Button className="w-full mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Chat mới
            </Button>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-3">Lịch sử chat</h3>
              <button type="button" className="w-full text-left p-3 rounded-xl border border-indigo-950/40 bg-indigo-950/20 transition-colors">
                <div className="flex items-start gap-2.5">
                  <History className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">Chat hiện tại</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hôm nay</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vùng chat chính */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 border-slate-800 bg-slate-900 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-200 leading-tight">AI Study Assistant</h2>
                <p className="text-xs text-slate-500 mt-0.5">Trợ lý học tập thông minh</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClearChat} className="w-9 h-9 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-950/20">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4 bg-slate-950/10" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 flex-shrink-0 border border-slate-800 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium' : 'bg-slate-800 border border-slate-700 text-slate-200'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-[10px] mt-1.5 font-medium ${message.role === 'user' ? 'text-indigo-100/80' : 'text-slate-500'}`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3.5">
                  <Avatar className="w-8 h-8 flex-shrink-0 border border-slate-800 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5">
                    <div className="flex gap-1.5 items-center h-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && (
                <div className="space-y-4 mt-12 max-w-2xl mx-auto">
                  <h3 className="text-xs font-bold text-center text-slate-500 tracking-wider uppercase">Gợi ý câu hỏi trợ giúp học tập</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button key={index} type="button" onClick={() => handleSend(prompt)} className="p-4 bg-slate-800/40 hover:bg-indigo-950/20 rounded-xl text-left transition-all border border-slate-800 hover:border-indigo-500 group">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0 group-hover:text-indigo-400" />
                          <p className="text-sm font-medium text-slate-300 group-hover:text-white">{prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Nhập câu hỏi của bạn..."
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-16 h-11 bg-slate-950 border-slate-800 focus:bg-slate-900 rounded-xl text-sm text-slate-100 placeholder-slate-500"
                    disabled={isTyping}
                  />
                  <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md">Enter ↵</Badge>
                </div>
                <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-11 w-11 rounded-xl text-white shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}