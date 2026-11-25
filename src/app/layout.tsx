import type { Viewport } from 'next';
import { DM_Mono, Fraunces, Inter } from 'next/font/google';
import { getVenue } from '@/venues';
import './globals.css';

const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], axes: ['opsz'], style: ['normal', 'italic'], display: 'swap' });
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const dmMono = DM_Mono({ variable: '--font-dm-mono', subsets: ['latin'], weight: ['400', '500'], display: 'swap' });

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// Applies a saved light/dark choice before first paint, so there is no flash of the wrong theme.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getVenue()?.lang ?? 'en-GB';
  return (
    <html lang={lang} className={`${fraunces.variable} ${inter.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
