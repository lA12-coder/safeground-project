export const GUEST_WELCOME_MESSAGE =
  'Welcome. You are safe and anonymous here. How are you feeling in this moment?';

export const FALLBACK_ECHO_QUOTES = [
  {
    id: '1',
    content: 'Day 30 clean. Grateful for this community — you are not alone.',
    alias: 'HopefulFalcon',
  },
  {
    id: '2',
    content: 'Prayed through the urge tonight. Still standing.',
    alias: 'QuietRiver',
  },
];

export function generateGuestSessionId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SG-ANON-${n}`;
}
