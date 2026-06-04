'use client';

import { Award } from 'lucide-react';
import { REACTION_EMOJIS, formatDisplayAlias, formatMessageTime } from '@/lib/chat/constants';
import type { ChatMessage } from '@/lib/chat/types';

type ChatMessageItemProps = {
  message: ChatMessage;
  isOwn: boolean;
  ownAlias: string;
  ghostMode: boolean;
  onReact: (messageId: string, emoji: string) => void;
};

export function ChatMessageItem({
  message,
  isOwn,
  ownAlias,
  ghostMode,
  onReact,
}: ChatMessageItemProps) {
  const displayName = isOwn
    ? 'You'
    : formatDisplayAlias(message.alias, {
        ghostMode: false,
        isOwnMessage: false,
        ownAlias,
      });

  if (message.message_type === 'milestone_share') {
    const attribution = formatDisplayAlias(message.alias, {
      ghostMode: ghostMode && isOwn,
      isOwnMessage: isOwn,
      ownAlias,
    });

    return (
      <div className="flex justify-center my-6">
        <div className="bg-[#152317]/60 border border-green-800/50 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center text-green-400 mx-auto mb-4">
            <Award size={24} aria-hidden />
          </div>
          <h3 className="text-[#4ade80] font-bold text-xl mb-4">Milestone Celebration!</h3>
          <p className="text-zinc-300 italic leading-relaxed whitespace-pre-wrap">
            &ldquo;{message.content}&rdquo;
          </p>
          <p className="text-zinc-500 text-sm mt-4 italic">— {attribution}</p>
          <ReactionRow
            reactions={message.reactions}
            messageId={message.id}
            onReact={onReact}
            fallbackEmojis={[...REACTION_EMOJIS]}
          />
        </div>
      </div>
    );
  }

  if (message.message_type === 'support_reaction') {
    return (
      <div className="flex justify-center my-4">
        <div className="flex gap-3 text-2xl px-4 py-2 bg-[#2a2a2a]/80 rounded-full">
          {message.content.split(/\s+/).filter(Boolean).map((emoji) => (
            <span key={emoji}>{emoji}</span>
          ))}
        </div>
        {!isOwn && (
          <span className="sr-only">{displayName} sent support reactions</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end ml-auto' : 'items-start'}`}>
      <span className={`text-xs font-semibold mb-2 ${isOwn ? 'text-[#d97706]' : 'text-zinc-300'}`}>
        {displayName}
      </span>
      <div
        className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
          isOwn
            ? 'bg-[#d97706] text-white rounded-tr-sm'
            : 'bg-[#2a2a2a] text-zinc-200 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
      <ReactionRow
        reactions={message.reactions}
        messageId={message.id}
        onReact={onReact}
        className="mt-2"
      />
      {isOwn && (
        <span className="text-[10px] text-zinc-500 mt-1.5">
          Read {formatMessageTime(message.created_at)}
        </span>
      )}
    </div>
  );
}

function ReactionRow({
  reactions,
  messageId,
  onReact,
  fallbackEmojis,
  className = '',
}: {
  reactions: Record<string, number>;
  messageId: string;
  onReact: (id: string, emoji: string) => void;
  fallbackEmojis?: string[];
  className?: string;
}) {
  const entries = Object.entries(reactions).filter(([, count]) => count > 0);

  if (entries.length === 0 && fallbackEmojis) {
    return (
      <div className={`flex gap-3 justify-center mt-4 text-xl ${className}`}>
        {fallbackEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(messageId, emoji)}
            className="hover:scale-110 transition-transform"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {entries.map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact(messageId, emoji)}
          className="flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#333] px-2.5 py-1 rounded-full text-xs transition-colors"
        >
          <span>{emoji}</span>
          <span className="text-zinc-400">{count}</span>
        </button>
      ))}
    </div>
  );
}
