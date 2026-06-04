'use client';

import { EyeOff, Plus, Send, Smile } from 'lucide-react';
import { REACTION_EMOJIS } from '@/lib/chat/constants';

type ChatInputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  ghostMode: boolean;
  onGhostModeChange: (enabled: boolean) => void;
  onSupportBurst: () => void;
  sending?: boolean;
};

export function ChatInputBar({
  value,
  onChange,
  onSend,
  ghostMode,
  onGhostModeChange,
  onSupportBurst,
  sending,
}: ChatInputBarProps) {
  return (
    <div className="shrink-0 px-6 md:px-8 py-6 border-t border-[#2a2a2a] bg-[#1e1e1e]">
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={onSupportBurst}
          className="absolute left-4 z-10 w-8 h-8 rounded-full border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 flex items-center justify-center transition-colors"
          aria-label="Send support reaction"
          title={`Quick support: ${REACTION_EMOJIS.join(' ')}`}
        >
          <Plus size={18} />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Share your journey anonymously..."
          disabled={sending}
          className="w-full bg-[#2a2a2a] text-white rounded-full py-4 pl-14 pr-14 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sending || !value.trim()}
          className="absolute right-2 w-10 h-10 bg-[#90ee90] hover:bg-[#7ee07e] disabled:opacity-50 rounded-full flex items-center justify-center text-black transition-colors"
          aria-label="Send message"
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
        <div className="flex gap-6 text-sm text-zinc-400">
          <button
            type="button"
            className="flex items-center gap-2 hover:text-white transition-colors"
            aria-label="Share how you're feeling"
          >
            <Smile size={16} aria-hidden />
            Feeling
          </button>
          <button
            type="button"
            onClick={() => onGhostModeChange(!ghostMode)}
            className={`flex items-center gap-2 transition-colors ${
              ghostMode ? 'text-[#4ade80]' : 'hover:text-white'
            }`}
            aria-pressed={ghostMode}
          >
            <EyeOff size={16} aria-hidden />
            Fully Ghost Mode
          </button>
        </div>
        <p className="text-xs text-zinc-500 italic sm:text-right">
          Messages are encrypted and ephemeral.
        </p>
      </div>
    </div>
  );
}
