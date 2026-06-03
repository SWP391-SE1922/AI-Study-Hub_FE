import { useState, useRef, useEffect } from 'react';
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
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: mockResponses[responseIndex],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat History Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="h-full border-border/50">
          <CardContent className="p-4">
            <Button className="w-full mb-4 bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Chat mới
            </Button>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Lịch sử chat</h3>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-primary">
                <div className="flex items-start gap-2">
                  <History className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Chat hiện tại</p>
                    <p className="text-xs text-muted-foreground">Hôm nay</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start gap-2">
                  <History className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">Giải thích cấu trúc dữ...</p>
                    <p className="text-xs text-muted-foreground">Hôm qua</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start gap-2">
                  <History className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">Bài tập Toán cao cấp</p>
                    <p className="text-xs text-muted-foreground">2 ngày trước</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 border-border/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">AI Study Assistant</h2>
                <p className="text-xs text-muted-foreground">Trợ lý học tập thông minh</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleClearChat}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-secondary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        SV
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Prompts (show when no user messages) */}
              {messages.length === 1 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-sm font-semibold text-center text-muted-foreground">
                    Gợi ý câu hỏi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(prompt)}
                        className="p-4 bg-muted hover:bg-muted/80 rounded-xl text-left transition-colors border border-border hover:border-primary"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Nhập câu hỏi của bạn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12 bg-input-background"
                    disabled={isTyping}
                  />
                  <Badge
                    variant="secondary"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  >
                    Enter ↵
                  </Badge>
                </div>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-primary to-secondary"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
