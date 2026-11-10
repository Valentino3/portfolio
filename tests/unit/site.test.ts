import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function siteUrl(): Promise<string> {
  vi.resetModules();
  return (await import('@/lib/site')).SITE_URL;
}

test('SITE_URL uses NEXT_PUBLIC_SITE_URL when it is set', async () => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test');
  expect(await siteUrl()).toBe('https://example.test');
});

test('SITE_URL falls back when the variable is missing or empty, so new URL() never throws', async () => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
  const url = await siteUrl();
  expect(url).toBe('https://valentinorota.vercel.app');
  expect(() => new URL(url)).not.toThrow();
});
