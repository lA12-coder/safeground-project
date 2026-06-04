'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CHAT_TABLE_SETUP_HINT,
  isAnonymousChatTableMissing,
  seedMessagesForRoom,
} from '@/lib/chat/localFallback';
import type { ChatInsert, ChatMessage, ChatRoomId } from '@/lib/chat/types';

function parseMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: String(row.id),
    room_id: row.room_id as ChatRoomId,
    message_type: row.message_type as ChatMessage['message_type'],
    content: String(row.content),
    alias: String(row.alias),
    session_id: String(row.session_id),
    reactions: (row.reactions as Record<string, number>) ?? {},
    created_at: String(row.created_at),
  };
}

export function useChatRoom(roomId: ChatRoomId, sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localOnly, setLocalOnly] = useState(false);
  const [setupHint, setSetupHint] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const localIdRef = useRef(0);

  const getSupabase = () => {
    if (typeof window === 'undefined') return null;
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  };

  const enableLocalMode = useCallback(() => {
    setLocalOnly(true);
    setSetupHint(CHAT_TABLE_SETUP_HINT);
    setError(null);
    setMessages(seedMessagesForRoom(roomId));
    setLoading(false);
  }, [roomId]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error: fetchError } = await supabase
      .from('anonymous_chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      if (isAnonymousChatTableMissing(fetchError.message)) {
        enableLocalMode();
        return;
      }
      setError(fetchError.message);
      setMessages([]);
    } else {
      setLocalOnly(false);
      setSetupHint(null);
      setMessages((data ?? []).map((row) => parseMessage(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [roomId, enableLocalMode]);

  useEffect(() => {
    if (!sessionId) return;

    fetchMessages();
    if (localOnly) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase.channel(`chat:${roomId}`, {
      config: { presence: { key: sessionId } },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anonymous_chat',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const incoming = parseMessage(payload.new as Record<string, unknown>);
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'anonymous_chat',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = parseMessage(payload.new as Record<string, unknown>);
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let count = 0;
        for (const presences of Object.values(state)) {
          count += presences.length;
        }
        setOnlineCount(Math.max(count, 1));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ room_id: roomId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, sessionId, fetchMessages, localOnly]);

  const insertMessage = useCallback(
    async (payload: ChatInsert) => {
      if (localOnly) {
        localIdRef.current += 1;
        const msg: ChatMessage = {
          id: `local-${localIdRef.current}`,
          room_id: payload.room_id,
          message_type: payload.message_type,
          content: payload.content,
          alias: payload.alias,
          session_id: payload.session_id,
          reactions: payload.reactions ?? {},
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msg]);
        return true;
      }

      const supabase = getSupabase();
      if (!supabase) return false;
      const { error: insertError } = await supabase.from('anonymous_chat').insert({
        ...payload,
        reactions: payload.reactions ?? {},
      });
      if (insertError) {
        if (isAnonymousChatTableMissing(insertError.message)) {
          enableLocalMode();
          localIdRef.current += 1;
          setMessages((prev) => [
            ...prev,
            {
              id: `local-${localIdRef.current}`,
              room_id: payload.room_id,
              message_type: payload.message_type,
              content: payload.content,
              alias: payload.alias,
              session_id: payload.session_id,
              reactions: payload.reactions ?? {},
              created_at: new Date().toISOString(),
            },
          ]);
          return true;
        }
        setError(insertError.message);
        return false;
      }
      return true;
    },
    [localOnly, enableLocalMode]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      const reactions = { ...message.reactions };
      reactions[emoji] = (reactions[emoji] ?? 0) + 1;

      if (localOnly) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
        );
        return;
      }

      const supabase = getSupabase();
      if (!supabase) return;
      const { error: updateError } = await supabase
        .from('anonymous_chat')
        .update({ reactions })
        .eq('id', messageId);

      if (updateError) {
        if (isAnonymousChatTableMissing(updateError.message)) {
          enableLocalMode();
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
          );
        } else {
          setError(updateError.message);
        }
      }
    },
    [messages, localOnly, enableLocalMode]
  );

  return {
    messages,
    onlineCount,
    loading,
    error,
    setupHint,
    localOnly,
    insertMessage,
    addReaction,
    refetch: fetchMessages,
  };
}
