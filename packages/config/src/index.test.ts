import { describe, it, expect } from 'vitest';
import { parseEnv } from './index';

const validEnv = {
  DATABASE_URL: 'postgresql://localhost/test',
  AUTH_SECRET: 'supersecret',
  AUTH_GITHUB_ID: 'gh-client-id',
  AUTH_GITHUB_SECRET: 'gh-client-secret',
};

describe('parseEnv', () => {
  it('throws on missing DATABASE_URL', () => {
    expect(() => parseEnv({ NODE_ENV: 'development' })).toThrow(
      'Invalid environment variables'
    );
  });

  it('throws on missing AUTH_SECRET', () => {
    const { AUTH_SECRET: _, ...rest } = validEnv;
    expect(() => parseEnv(rest)).toThrow('Invalid environment variables');
  });

  it('throws on missing AUTH_GITHUB_ID', () => {
    const { AUTH_GITHUB_ID: _, ...rest } = validEnv;
    expect(() => parseEnv(rest)).toThrow('Invalid environment variables');
  });

  it('throws on missing AUTH_GITHUB_SECRET', () => {
    const { AUTH_GITHUB_SECRET: _, ...rest } = validEnv;
    expect(() => parseEnv(rest)).toThrow('Invalid environment variables');
  });

  it('returns parsed env when all required vars present', () => {
    const result = parseEnv(validEnv);
    expect(result.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(result.AUTH_SECRET).toBe('supersecret');
    expect(result.AUTH_GITHUB_ID).toBe('gh-client-id');
    expect(result.AUTH_GITHUB_SECRET).toBe('gh-client-secret');
    expect(result.NODE_ENV).toBe('development');
  });
});
