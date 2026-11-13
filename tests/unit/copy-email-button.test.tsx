import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CopyEmailButton } from '@/components/home/copy-email-button';

test('renders a fixed "Copy email" button and an empty polite status line', () => {
  const html = renderToStaticMarkup(<CopyEmailButton email="a@b.co" />);
  expect(html).toMatch(/<button[^>]*type="button"[^>]*>Copy email<\/button>/);
  expect(html).toMatch(/<p role="status"[^>]*><\/p>/);
});
