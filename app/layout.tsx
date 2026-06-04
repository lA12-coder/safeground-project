import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafeGround - Your Digital Well-being',
  description: 'Privacy-first digital well-being platform for Ethiopian university students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-surface text-on-surface">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
