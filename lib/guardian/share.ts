export function guardianShareUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/guardian/view?token=${token}`;
}

export function guardianShareText(url: string): string {
  return `I'm working on something important for my wellbeing. I've given you a private link: ${url}. Thank you.`;
}
