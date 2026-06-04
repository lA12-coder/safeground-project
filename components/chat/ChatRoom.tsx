'use client';

import { useCallback, useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { ChatTopNav } from './ChatTopNav';
import { ChatRoomSidebar } from './ChatRoomSidebar';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar } from './ChatInputBar';
import { MilestoneDialog } from './MilestoneDialog';
import { useChatRoom } from '@/hooks/useChatRoom';
import { CHAT_ROOMS, REACTION_EMOJIS } from '@/lib/chat/constants';
import { getChatAliasForSend, initChatSession } from '@/lib/chat/session';
import type { ChatRoomId } from '@/lib/chat/types';

export function ChatRoom() {
  const [currentRoom, setCurrentRoom] = useState<ChatRoomId>('global');
  const [sessionId, setSessionId] = useState('');
  const [alias, setAlias] = useState('');
  const [ghostMode, setGhostMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [streakDays, setStreakDays] = useState(30);

  const { messages, onlineCount, loading, error, setupHint, insertMessage, addReaction } =
    useChatRoom(currentRoom, sessionId);

  useEffect(() => {
    const { sessionId: sid, alias: a } = initChatSession();
    setSessionId(sid);
    setAlias(a);
  }, []);

  useEffect(() => {
    fetch('/api/habits/streak')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.currentStreak === 'number' && data.currentStreak > 0) {
          setStreakDays(data.currentStreak);
        }
      })
      .catch(() => {});
  }, []);

  const roomMeta = CHAT_ROOMS.find((r) => r.id === currentRoom)!;

  const sendPayload = useCallback(
    async (payload: Parameters<typeof insertMessage>[0]) => {
      if (!sessionId) return false;
      setSending(true);
      const ok = await insertMessage(payload);
      setSending(false);
      return ok;
    },
    [sessionId, insertMessage]
  );

  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendPayload({
      room_id: currentRoom,
      message_type: 'text',
      content: text,
      alias: getChatAliasForSend(alias, ghostMode),
      session_id: sessionId,
    });
  };

  const handleSupportBurst = async () => {
    await sendPayload({
      room_id: currentRoom,
      message_type: 'support_reaction',
      content: REACTION_EMOJIS.join(' '),
      alias: getChatAliasForSend(alias, ghostMode),
      session_id: sessionId,
    });
  };

  const handleShareMilestone = async (content: string) => {
    const ok = await sendPayload({
      room_id: currentRoom,
      message_type: 'milestone_share',
      content,
      alias: getChatAliasForSend(alias, ghostMode),
      session_id: sessionId,
    });
    if (ok) setMilestoneOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1e1e1e] text-white overflow-hidden">
      <ChatTopNav />

      <div className="flex flex-1 min-h-0">
        <ChatRoomSidebar
          currentRoom={currentRoom}
          onlineCount={onlineCount}
          onRoomChange={setCurrentRoom}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          <div className="h-[72px] shrink-0 border-b border-[#2a2a2a] flex items-center justify-between px-6 md:px-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" aria-hidden />
              <div>
                <h1 className="font-bold text-base text-white">{roomMeta.label}</h1>
                <p className="text-xs text-[#4ade80] font-medium">
                  {onlineCount} people here now
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMilestoneOpen(true)}
              className="bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <PartyPopper size={16} aria-hidden />
              Share Milestone
            </button>
          </div>

          {setupHint && (
            <div className="mx-6 mt-4 px-4 py-2 bg-amber-900/30 border border-amber-700/50 rounded-lg text-sm text-amber-100">
              {setupHint}
            </div>
          )}
          {error && !setupHint && (
            <div className="mx-6 mt-4 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <ChatMessageList
            messages={messages}
            sessionId={sessionId}
            ownAlias={alias}
            ghostMode={ghostMode}
            loading={loading}
            onReact={addReaction}
          />

          <ChatInputBar
            value={inputText}
            onChange={setInputText}
            onSend={handleSendText}
            ghostMode={ghostMode}
            onGhostModeChange={setGhostMode}
            onSupportBurst={handleSupportBurst}
            sending={sending}
          />
        </div>
      </div>

      <MilestoneDialog
        isOpen={milestoneOpen}
        onClose={() => setMilestoneOpen(false)}
        onSubmit={handleShareMilestone}
        daysActive={streakDays}
        submitting={sending}
      />
    </div>
  );
}
