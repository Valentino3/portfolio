import { expect, test } from 'vitest';
import { formatLocalTime } from '@/lib/clock';

test('formats Buenos Aires local time', () => {
  expect(formatLocalTime(new Date('2026-11-10T15:04:00Z'))).toBe('12:04');
});

test('uses a 24 hour clock that rolls over at 00:00, not 24:00', () => {
  expect(formatLocalTime(new Date('2026-11-10T03:00:00Z'))).toBe('00:00');
  expect(formatLocalTime(new Date('2026-11-11T02:59:00Z'))).toBe('23:59');
});
