import type { ChatMessage, ChatRoomId } from './types';

export const CHAT_TABLE_SETUP_HINT =
  'Community chat needs the anonymous_chat table in Supabase. Run supabase/migrations/20240604120000_anonymous_chat.sql in the SQL Editor, then enable Realtime.';

export function isAnonymousChatTableMissing(message: string): boolean {
  return (
    message.includes('anonymous_chat') ||
    message.includes('schema cache') ||
    message.includes('PGRST205') ||
    message.includes('Could not find the table')
  );
}

export function seedMessagesForRoom(roomId: ChatRoomId): ChatMessage[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'local-1',
      room_id: roomId,
      message_type: 'text',
      content: 'Welcome to SafeGround — you are among friends here.',
      alias: 'SafeGround',
      session_id: 'system',
      reactions: { '💚': 2 },
      created_at: now,
    },
    {
      id: 'local-2',
      room_id: roomId,
      message_type: 'milestone_share',
      content: '30 days — one day at a time. Grateful for this space.',
      alias: 'HopefulFalcon',
      session_id: 'system',
      reactions: { '🎉': 3 },
      created_at: now,
    },
  ];
}
