import { generateAlias } from '@/lib/utils/aliasGenerator';

const SESSION_KEY = 'chat_session_id';
const ALIAS_KEY = 'chat_alias';

/** Fresh alias each page load; stable session id for the tab visit */
export function initChatSession(): { sessionId: string; alias: string } {
  if (typeof window === 'undefined') {
    return { sessionId: '', alias: '' };
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const alias = generateAlias();
  sessionStorage.setItem(ALIAS_KEY, alias);

  return { sessionId, alias };
}

export function getChatAliasForSend(alias: string, ghostMode: boolean): string {
  return ghostMode ? 'Anonymous' : alias;
}
