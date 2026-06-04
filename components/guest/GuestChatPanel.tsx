'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { GUEST_WELCOME_MESSAGE } from '@/lib/guest/constants';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: number;
};

function formatTimeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

export function GuestChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: GUEST_WELCOME_MESSAGE,
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch('/api/guest/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply ?? 'I am here with you. Take a breath.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[480px] bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-on-surface">Recovery Support</h2>
          <span className="w-2 h-2 rounded-full bg-secondary shrink-0" aria-hidden />
        </div>
        <p className="text-xs text-on-surface-variant mt-0.5">Anonymous &amp; Secure</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className="max-w-[85%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-secondary text-on-secondary rounded-br-md'
                    : 'bg-primary/15 text-on-surface rounded-bl-md border border-primary/20'
                }`}
              >
                {m.content}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 px-1">
                {m.role === 'user' ? 'You' : 'SafeGround AI'} • {formatTimeAgo(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-2">
        <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
          This session is encrypted and will not be saved unless you upgrade.
        </p>
      </div>

      <div className="p-4 pt-2 flex gap-2 border-t border-outline-variant">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type your thoughts..."
          className="input-field flex-1"
          disabled={sending}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:opacity-90 disabled:opacity-50 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
