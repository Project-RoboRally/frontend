import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { BackgroundMusicProvider } from '@/components/BackgroundMusicProvider';
import { SettingsButton } from '@/components/SettingsButton';
import { SettingsProvider } from '@/components/SettingsProvider';
import SessionGuard from '@/components/SessionGuard';
import { SETTINGS_BOOT_SCRIPT } from '@/lib/settings';
import './globals.css';

// Root document layout with global fonts, session guard, and application providers.

/**
 * @author Elias, Sebastian, Anton
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Robo Rally',
  description: 'Robo Rally project for a DTU course',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: the boot script adds display preferences to <html>.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SETTINGS_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <BackgroundMusicProvider>
          <SettingsProvider>
            <SessionGuard>{children}</SessionGuard>
            <SettingsButton
              iconOnly
              className="fixed right-2 top-2 z-[100] flex h-9 w-9 items-center justify-center rounded-full border-2 border-cobber-dark bg-charcoal text-bone opacity-90 shadow-md transition hover:border-cobber-light hover:opacity-100"
            />
          </SettingsProvider>
        </BackgroundMusicProvider>
      </body>
    </html>
  );
}
