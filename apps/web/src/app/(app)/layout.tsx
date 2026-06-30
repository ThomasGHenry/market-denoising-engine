import type { ReactNode } from 'react';
import { AppShell } from '@template/ui';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
