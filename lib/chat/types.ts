export type ChatRoomId = 'global' | 'crisis' | 'faith';

export type ChatMessageType = 'text' | 'milestone_share' | 'support_reaction';

export type ChatMessage = {
  id: string;
  room_id: ChatRoomId;
  message_type: ChatMessageType;
  content: string;
  alias: string;
  session_id: string;
  reactions: Record<string, number>;
  created_at: string;
};

export type ChatInsert = {
  room_id: ChatRoomId;
  message_type: ChatMessageType;
  content: string;
  alias: string;
  session_id: string;
  reactions?: Record<string, number>;
};
