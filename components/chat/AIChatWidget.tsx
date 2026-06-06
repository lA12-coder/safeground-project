'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { FREE_AI_REQUEST_LIMIT } from '@/lib/billing/constants';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type UsageInfo = {
  ai_requests_used: number;
  ai_requests_limit: number;
  remaining: number | null;
  is_subscribed: boolean;
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
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    fetch('/api/billing/subscription')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUsage({
            ai_requests_used: data.ai_requests_used,
            ai_requests_limit: data.ai_requests_limit,
            remaining: data.remaining,
            is_subscribed: data.is_subscribed,
          });
          setLimitReached(!data.is_subscribed && data.remaining === 0);
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || limitReached) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      let res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (res.status === 401) {
        const guestSession =
          typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('sg_guest_session')
            : null;
        res = await fetch('/api/guest/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history,
            session_id: guestSession ?? undefined,
          }),
        });
      }

      const data = await res.json();
      if (res.status === 402) {
        setLimitReached(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `You've used all ${FREE_AI_REQUEST_LIMIT} free AI requests. Upgrade to AI Plus for unlimited access.`,
          },
        ]);
      } else if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠ ${data.error ?? 'AI service unavailable'}` },
        ]);
      } else {
        if (data.usage) {
          setUsage({
            ai_requests_used: data.usage.ai_requests_used,
            ai_requests_limit: data.usage.ai_requests_limit,
            remaining: data.usage.remaining,
            is_subscribed: data.usage.plan === 'ai_plus',
          });
          if (data.usage.remaining === 0 && data.usage.plan !== 'ai_plus') {
            setLimitReached(true);
          }
        }
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply ?? '' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection issue. Please try again.' },
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

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #92400E, #7a360a)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 200ms, box-shadow 200ms',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        aria-label="Open AI Chat"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '96px',
              right: '24px',
              zIndex: 9999,
              width: '360px',
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '1px solid #e5e0db',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(90deg, #92400E, #7a360a)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={16} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                    SafeGround AI
                  </p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    Recovery Companion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <X size={14} color="white" />
              </button>
            </div>

            {usage && !usage.is_subscribed && (
              <div style={{ padding: '8px 16px', fontSize: '11px', color: '#6f5b4e', borderBottom: '1px solid #e5e0db' }}>
                {usage.remaining ?? 0} of {usage.ai_requests_limit} free AI requests left
              </div>
            )}

            {limitReached && (
              <div style={{ padding: '10px 16px', backgroundColor: '#fff8f0', borderBottom: '1px solid #e5e0db', fontSize: '12px' }}>
                <Link href="/settings/subscription" style={{ color: '#92400E', fontWeight: 600 }}>
                  Upgrade to AI Plus →
                </Link>
              </div>
            )}

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '300px',
                maxHeight: '360px',
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      ...(msg.role === 'user'
                        ? {
                            backgroundColor: '#92400E',
                            color: '#ffffff',
                            borderBottomRightRadius: '6px',
                          }
                        : {
                            backgroundColor: '#3a302a',
                            color: '#ffffff',
                            borderBottomLeftRadius: '6px',
                          }),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: '#f6f5f1',
                      borderRadius: '12px',
                      borderBottomLeftRadius: '6px',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #92400E',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                borderTop: '1px solid #e5e0db',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? 'Upgrade to continue…' : 'Type your message...'}
                disabled={loading || limitReached}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '1px solid #e5e0db',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#1c1917',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#92400E';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(146,64,14,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e0db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || loading || limitReached}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: input.trim() && !loading ? '#92400E' : '#d6d3d1',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 200ms',
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes aichat-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        div[style*="animation: spin"] {
          animation-name: aichat-spin !important;
        }
      `}</style>
    </>
  );
}
