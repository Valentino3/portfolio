import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CopyEmailButton } from '@/components/home/copy-email-button';

test('renders a fixed "Copy email" button and an empty polite status line', () => {
  const html = renderToStaticMarkup(<CopyEmailButton email="a@b.co" />);
  expect(html).toMatch(/<button[^>]*type="button"[^>]*>Copy email<\/button>/);
  expect(html).toMatch(/<p role="status"[^>]*><\/p>/);
});

test('the button grows to 44px tall on a coarse pointer, and keeps its size for a mouse', () => {
  const button = renderToStaticMarkup(<CopyEmailButton email="a@b.co" />).match(/<button [^>]*>/)?.[0] ?? '';
  expect(button).toContain('pointer-coarse:min-h-11');
  expect(button).toContain('py-2');
});
