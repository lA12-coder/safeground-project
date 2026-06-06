import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RootClientWrapper } from '@/components/layout/RootClientWrapper';
import { PRODUCTION_SITE_URL, resolvePublicSiteUrl } from '@/lib/site/config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = resolvePublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || PRODUCTION_SITE_URL),
  title: {
    default: 'SafeGround - Your Digital Well-being',
    template: '%s | SafeGround',
  },
  description:
    'Privacy-first digital well-being and recovery platform for Ethiopian university students — anonymous support, AI tools, and professional care.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: PRODUCTION_SITE_URL,
    siteName: 'SafeGround',
    title: 'SafeGround - Your Digital Well-being',
    description:
      'A private, judgment-free recovery platform helping Ethiopian youth break free with daily tools, anonymous support, and healing rooted in dignity.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'SafeGround' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeGround - Your Digital Well-being',
    description: 'Privacy-first recovery platform for Ethiopian university students.',
    images: ['/og-image.svg'],
  },
  alternates: {
    canonical: PRODUCTION_SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-surface text-on-surface`}
      >
        <ThemeProvider>
          <RootClientWrapper>
            {children}
          </RootClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
