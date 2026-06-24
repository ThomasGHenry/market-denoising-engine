import { describe, it, expect } from 'vitest';
import { parseEnv } from './index';

describe('parseEnv', () => {
  it('throws on missing DATABASE_URL', () => {
    expect(() => parseEnv({ NODE_ENV: 'development' })).toThrow(
      'Invalid environment variables'
    );
  });

  it('returns parsed env when valid', () => {
    const result = parseEnv({ DATABASE_URL: 'postgresql://localhost/test' });
    expect(result.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(result.NODE_ENV).toBe('development');
  });
});
