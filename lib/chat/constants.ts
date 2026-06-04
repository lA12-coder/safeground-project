import type { ChatRoomId } from './types';

export const CHAT_ROOMS: {
  id: ChatRoomId;
  label: string;
  subtitle: string;
  icon: 'users' | 'asterisk' | 'faith';
}[] = [
  { id: 'global', label: 'Global Support', subtitle: 'active members', icon: 'users' },
  { id: 'crisis', label: 'Crisis Room', subtitle: 'Immediate attention', icon: 'asterisk' },
  { id: 'faith', label: 'Faith Support', subtitle: 'Grounded in faith', icon: 'faith' },
];

export const REACTION_EMOJIS = ['👊', '💚', '🙏'] as const;

export const DEFAULT_MILESTONE_QUOTE = (days: number) =>
  `Today marks ${days} days of growth and resilience.\nThank you SafeGround community for being my anchor.`;

export function formatDisplayAlias(
  alias: string,
  options: { ghostMode: boolean; isOwnMessage: boolean; ownAlias: string }
): string {
  if (options.ghostMode && options.isOwnMessage) return 'Anonymous';
  if (!alias || alias === 'Anonymous') return 'Anonymous';
  if (alias.includes('-')) {
    const animal = alias.split('-')[1];
    return animal ? `Anonymous ${animal}` : 'Anonymous';
  }
  return alias.startsWith('Anonymous') ? alias : `Anonymous ${alias}`;
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
