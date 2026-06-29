import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AppShell } from './app-shell';

afterEach(function () {
  cleanup();
});

describe('AppShell', function () {
  it('renders children', function () {
    render(<AppShell><span>child content</span></AppShell>);
    expect(screen.getByText('child content')).toBeTruthy();
  });

  it('renders a nav element', function () {
    render(<AppShell><span>x</span></AppShell>);
    expect(document.querySelector('nav')).toBeTruthy();
  });

  it('nav contains a link to /dashboard', function () {
    render(<AppShell><span>x</span></AppShell>);
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link.getAttribute('href')).toBe('/dashboard');
  });

  it('nav contains a link to /generations', function () {
    render(<AppShell><span>x</span></AppShell>);
    const link = screen.getByRole('link', { name: /generations/i });
    expect(link.getAttribute('href')).toBe('/generations');
  });

  it('nav contains a link to /mutations', function () {
    render(<AppShell><span>x</span></AppShell>);
    const link = screen.getByRole('link', { name: /mutations/i });
    expect(link.getAttribute('href')).toBe('/mutations');
  });
});
