import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askAi } from '../../services/api';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  modelUsed?: string;
};

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'qa' | 'summary' | 'quiz'>('qa');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await askAi(userMessage.content, mode);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        modelUsed: result.modelUsed,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi hỏi AI');
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp sự cố khi kết nối. Vui lòng thử lại sau.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    // Simple bold markdown parsing
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        <br />
      </span>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors z-50 group"
          >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-100" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Trợ lý học tập AI</h3>
                  <p className="text-xs text-indigo-200">Được hỗ trợ bởi Ollama</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-3">
                  <Bot className="w-12 h-12 text-stone-300" />
                  <p className="text-sm font-medium text-center">
                    Xin chào! Tôi có thể giúp bạn tóm tắt, <br/> giải đáp tài liệu học tập.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'}`}>
                      {renderMessageContent(msg.content)}
                    </div>
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <AlertCircle className="w-3 h-3" /> Nguồn:
                        {msg.sources.map((src, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-600">{src}</span>
                        ))}
                        {msg.modelUsed && <span className="ml-1 text-indigo-400">({msg.modelUsed})</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form onSubmit={handleSend} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border-none rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="qa">Hỏi đáp</option>
                    <option value="summary">Tóm tắt</option>
                    <option value="quiz">Trắc nghiệm</option>
                  </select>
                  <span className="text-[9px] text-stone-400 font-mono tracking-wider uppercase">LanceDB Vector</span>
                </div>
                <div className="flex items-end gap-2 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Gửi yêu cầu (${mode === 'qa' ? 'hỏi đáp' : mode === 'summary' ? 'tóm tắt' : 'ôn tập'})...`}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
