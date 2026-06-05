'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME_MSG: ChatMessage = {
  role: 'assistant',
  content: 'Welcome. I am SafeGround AI, your recovery companion. How are you feeling right now?',
};

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'I am here for you. Please tell me more.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I am here for you. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#92400E] to-[#7a360a] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-[#e5e0db] overflow-hidden"
            style={{ maxHeight: '560px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#92400E] to-[#7a360a] px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">SafeGround AI</p>
                  <p className="text-[10px] text-white/65">Recovery Companion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 overflow-y-auto" style={{ height: '360px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#92400E] text-white rounded-br-md'
                        : 'bg-[#f6f5f1] text-[#2c241f] rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#f6f5f1] rounded-xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#92400E]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#e5e0db] p-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-[#e5e0db] text-sm outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-all placeholder:text-[#B09880]/60"
                disabled={loading}
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-[#92400E] text-white flex items-center justify-center hover:bg-[#7a360a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
