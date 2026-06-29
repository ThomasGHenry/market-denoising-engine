import { describe, it, expect } from 'vitest';
import { parseEnv } from './index';

const validEnv = {
  DATABASE_URL: 'postgresql://localhost/test',
  AUTH_SECRET: 'supersecret',
  AUTH_RESEND_KEY: 're_test_key',
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

  it('throws on missing AUTH_RESEND_KEY', () => {
    const { AUTH_RESEND_KEY: _, ...rest } = validEnv;
    expect(() => parseEnv(rest)).toThrow('Invalid environment variables');
  });

  it('succeeds without AUTH_GITHUB_ID and AUTH_GITHUB_SECRET', () => {
    const result = parseEnv(validEnv);
    expect(result.AUTH_GITHUB_ID).toBeUndefined();
    expect(result.AUTH_GITHUB_SECRET).toBeUndefined();
  });

  it('accepts AUTH_GITHUB_ID and AUTH_GITHUB_SECRET when present', () => {
    const result = parseEnv({
      ...validEnv,
      AUTH_GITHUB_ID: 'gh-client-id',
      AUTH_GITHUB_SECRET: 'gh-client-secret',
    });
    expect(result.AUTH_GITHUB_ID).toBe('gh-client-id');
    expect(result.AUTH_GITHUB_SECRET).toBe('gh-client-secret');
  });

  it('accepts DATABASE_URL_UNPOOLED when present', () => {
    const result = parseEnv({
      ...validEnv,
      DATABASE_URL_UNPOOLED: 'postgresql://localhost/test_direct',
    });
    expect(result.DATABASE_URL_UNPOOLED).toBe('postgresql://localhost/test_direct');
  });

  it('returns parsed env when all required vars present', () => {
    const result = parseEnv(validEnv);
    expect(result.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(result.AUTH_SECRET).toBe('supersecret');
    expect(result.AUTH_RESEND_KEY).toBe('re_test_key');
    expect(result.NODE_ENV).toBe('development');
  });
});
