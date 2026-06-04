'use client';

import { useEffect, useRef } from 'react';
import { ChatMessageItem } from './ChatMessageItem';
import type { ChatMessage } from '@/lib/chat/types';

type ChatMessageListProps = {
  messages: ChatMessage[];
  sessionId: string;
  ownAlias: string;
  ghostMode: boolean;
  loading: boolean;
  onReact: (messageId: string, emoji: string) => void;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ChatMessageList({
  messages,
  sessionId,
  ownAlias,
  ghostMode,
  loading,
  onReact,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const today = new Date();

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-5">
      {loading && (
        <p className="text-center text-zinc-500 text-sm py-8">Loading messages…</p>
      )}

      {!loading && messages.length === 0 && (
        <p className="text-center text-zinc-500 text-sm py-12 max-w-md mx-auto">
          No messages yet. Share your journey anonymously — someone in this room may need to hear you today.
        </p>
      )}

      {messages.map((msg, index) => {
        const msgDate = new Date(msg.created_at);
        const prevDate = index > 0 ? new Date(messages[index - 1].created_at) : null;
        const showDateSeparator = !prevDate || !isSameDay(msgDate, prevDate);
        const dateLabel = isSameDay(msgDate, today) ? 'TODAY' : msgDate.toLocaleDateString();

        return (
          <div key={msg.id}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span className="bg-[#2a2a2a] text-xs px-4 py-1 rounded-full text-zinc-400 font-medium tracking-wider">
                  {dateLabel}
                </span>
              </div>
            )}
            <ChatMessageItem
              message={msg}
              isOwn={msg.session_id === sessionId}
              ownAlias={ownAlias}
              ghostMode={ghostMode}
              onReact={onReact}
            />
          </div>
        );
      })}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
