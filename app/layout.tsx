import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import SessionGuard from '@/components/SessionGuard';
import { ACCESSIBILITY_BOOT_SCRIPT } from '@/lib/accessibility';
import './globals.css';

/**
 * @author Elias, Sebastian
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
    // suppressHydrationWarning: the boot script adds the accessibility classes to <html>.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionGuard>{children}</SessionGuard>
        <AccessibilityMenu />
      </body>
    </html>
  );
}
