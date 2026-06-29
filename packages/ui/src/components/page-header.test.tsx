import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PageHeader } from './page-header';

afterEach(function () {
  cleanup();
});

describe('PageHeader', function () {
  it('renders the title string', function () {
    render(<PageHeader title="My Title" />);
    expect(screen.getByText('My Title')).toBeTruthy();
  });

  it('renders without an action slot when action prop is omitted', function () {
    render(<PageHeader title="No Action" />);
    expect(document.querySelector('[data-testid="page-header-action"]')).toBeNull();
  });

  it('renders the action slot content when action prop is provided', function () {
    render(<PageHeader title="With Action" action={<button>Do It</button>} />);
    expect(screen.getByText('Do It')).toBeTruthy();
  });
});
