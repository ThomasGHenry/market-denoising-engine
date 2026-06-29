import React from 'react';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <nav className="flex items-center gap-6 px-6 py-3 border-b bg-white">
        <span className="font-semibold text-sm text-gray-900">MDE</span>
        <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
        <a href="/generations" className="text-sm text-gray-600 hover:text-gray-900">Generations</a>
        <a href="/mutations" className="text-sm text-gray-600 hover:text-gray-900">Mutations</a>
      </nav>
      <main className="px-6 py-8">{children}</main>
    </>
  );
}
