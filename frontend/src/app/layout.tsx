import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/about.css';
import '@/styles/contact.css';
import '@/styles/overlays.css';
import '@/styles/profile.css';
import '@/styles/works.css';
import '@/styles/approvals.css';
import '@/styles/heroes.css';

import { fontVariables } from '@/app/fonts';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { Curtain } from '@/components/layout/Curtain';
import { CursorGlow } from '@/components/layout/CursorGlow';
import { Footer } from '@/components/layout/Footer';
import { Dock, Rail, TopBar } from '@/components/layout/Navigation';
import { Preloader } from '@/components/layout/Preloader';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { GlobalMotion } from '@/components/motion';
import { AppShell } from '@/components/providers/AppShell';
import { ModalProvider } from '@/components/providers/ModalProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { TransitionProvider } from '@/components/providers/TransitionProvider';
import { IconSprite } from '@/components/ui/IconSprite';
import { Toast } from '@/components/ui/Toast';
import { siteMeta } from '@/content/site';
import { THEME_BOOT_SCRIPT } from '@/lib/themeBoot';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteMeta.baseUrl.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteMeta.defaultTitle, template: `%s${siteMeta.docTitleSuffix}` },
  description: siteMeta.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: siteMeta.themeColor.light,
};

/**
 * The document of the reference (L2-L4926) in its DOM order: the icon sprite, preloader, curtain,
 * scroll progress, ambient background, cursor glow, rail, top bar, dock, then main.site with the
 * current page and the footer, the modals and the toast. The head script sets data-theme and the
 * `js` class before first paint.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteMeta.lang} data-theme="light" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <TransitionProvider>
                <AppShell>
                  <IconSprite />
                  <Preloader />
                  <Curtain />
                  <ScrollProgress />
                  <AmbientBackground />
                  <CursorGlow />
                  <Rail />
                  <TopBar />
                  <Dock />
                  <main className="site" id="site">
                    {children}
                    <Footer />
                  </main>
                  <Toast />
                  <GlobalMotion />
                </AppShell>
              </TransitionProvider>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
