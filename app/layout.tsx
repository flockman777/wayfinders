import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from '@/components/session-provider';
import { Toaster } from '@/components/ui/toaster';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Wayfinders - Platform Komunitas & E-Learning',
  description: 'Temukan jalan belajarmu bersama komunitas dan kursus terbaik di Wayfinders',
  keywords: ['e-learning', 'komunitas', 'kursus online', 'belajar', 'pendidikan'],
  authors: [{ name: 'Wayfinders' }],
  openGraph: {
    title: 'Wayfinders - Platform Komunitas & E-Learning',
    description: 'Temukan jalan belajarmu bersama komunitas dan kursus terbaik',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sora.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
