'use client';

import { Asterisk, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { CHAT_ROOMS } from '@/lib/chat/constants';
import type { ChatRoomId } from '@/lib/chat/types';

type ChatRoomSidebarProps = {
  currentRoom: ChatRoomId;
  onlineCount: number;
  onRoomChange: (room: ChatRoomId) => void;
};

function RoomIcon({ icon }: { icon: 'users' | 'asterisk' | 'faith' }) {
  if (icon === 'users') return <Users size={20} aria-hidden />;
  if (icon === 'asterisk') return <Asterisk size={20} aria-hidden />;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 22V9l-6-6-6 6v13" />
      <path d="M12 15V8" />
      <path d="M9 11h6" />
    </svg>
  );
}

export function ChatRoomSidebar({ currentRoom, onlineCount, onRoomChange }: ChatRoomSidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-lg font-bold text-white mb-0.5">Healing Spaces</h2>
        <p className="text-xs text-zinc-500 mb-6">Select a community room</p>

        <div className="space-y-2">
          {CHAT_ROOMS.map((room) => {
            const isActive = currentRoom === room.id;
            const subtitle =
              room.id === 'global' && isActive
                ? `${onlineCount} active members`
                : room.subtitle;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onRoomChange(room.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left ${
                  isActive ? 'bg-[#90ee90] text-black' : 'text-white hover:bg-[#2a2a2a]'
                }`}
              >
                <RoomIcon icon={room.icon} />
                <div>
                  <div className="font-semibold text-sm">{room.label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>
                    {subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-[#2a2a2a] space-y-3">
        <Link
          href="/#faq"
          className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Shield size={16} aria-hidden />
          Privacy Policy
        </Link>
        <button
          type="button"
          className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-full"
        >
          <Settings size={16} aria-hidden />
          Chat Settings
        </button>
      </div>
    </aside>
  );
}
