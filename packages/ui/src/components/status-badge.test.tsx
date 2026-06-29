import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { StatusBadge } from './status-badge';

afterEach(function () {
  cleanup();
});

describe('StatusBadge', function () {
  it('renders a span element', function () {
    render(<StatusBadge status="DRAFT" />);
    expect(document.querySelector('span')).toBeTruthy();
  });

  it('renders the status string as text content', function () {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText('DRAFT')).toBeTruthy();
  });

  it('applies a gray class for DRAFT', function () {
    render(<StatusBadge status="DRAFT" />);
    const span = document.querySelector('span');
    expect(span?.className).toMatch(/gray/);
  });

  it('applies a blue class for ACTIVE', function () {
    render(<StatusBadge status="ACTIVE" />);
    const span = document.querySelector('span');
    expect(span?.className).toMatch(/blue/);
  });

  it('applies a green class for PUBLISHED', function () {
    render(<StatusBadge status="PUBLISHED" />);
    const span = document.querySelector('span');
    expect(span?.className).toMatch(/green/);
  });

  it('applies a purple class for REVIEWED', function () {
    render(<StatusBadge status="REVIEWED" />);
    const span = document.querySelector('span');
    expect(span?.className).toMatch(/purple/);
  });

  it('applies a gray class for an unknown status string', function () {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    const span = document.querySelector('span');
    expect(span?.className).toMatch(/gray/);
  });
});
