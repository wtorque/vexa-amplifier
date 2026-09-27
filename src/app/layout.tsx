import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Self-hosted via next/font — removes the runtime request to
// fonts.googleapis.com (previously duplicated by an @import in globals.css)
// and avoids the render-blocking <link> stylesheet entirely.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Vexa Amplifier — Premium Music Player',
  description: 'Stream, enhance, and master your music with Vexa Amplifier. Professional audio processing, 10-band EQ, bass enhancement, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
