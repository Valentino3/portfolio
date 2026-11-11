import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { COLOR } from '@/lib/og';

// Satori has no CSS variables, so og.tsx repeats five tokens. This keeps them from drifting.
const css = readFileSync('src/app/globals.css', 'utf8');
const token = (name: string) => css.match(new RegExp(`--color-${name}: *(#[0-9a-f]{6})`, 'i'))?.[1];

test('the share image palette matches the design tokens', () => {
  expect(COLOR).toEqual({
    bg: token('bg'),
    ink: token('ink'),
    muted: token('text-3'),
    rule: token('rule-strong'),
    dot: token('available'),
  });
});
