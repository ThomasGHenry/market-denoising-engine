import type { ReactNode } from 'react';
import { AppShell } from '@template/ui';
import './globals.css';

export const metadata = { title: 'tgh-template', description: 'Template application' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
