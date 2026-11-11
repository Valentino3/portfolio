import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_URL } from './site';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Satori has no CSS variables, so the palette is repeated here. These are the values of
 * `--color-bg`, `--color-ink`, `--color-text-3`, `--color-rule-strong` and `--color-available`
 * in `globals.css`; this is the only other place they appear.
 */
const COLOR = {
  bg: '#f7f7f5',
  ink: '#141414',
  muted: '#63635f',
  rule: '#cfcfca',
  dot: '#2f9e44',
};

// Satori reads TTF/OTF, not the woff2 the site serves. Same Geist, static weights.
const fontDir = join(process.cwd(), 'src/app/og-fonts');
const fonts = Promise.all([
  readFile(join(fontDir, 'Geist-SemiBold.ttf')),
  readFile(join(fontDir, 'GeistMono-Regular.ttf')),
]);

/** The 1200x630 share card: a mono line on top, the title, and the site address with the availability dot. */
export async function ogImage({ top, title }: { top: string; title: string }) {
  const [semiBold, mono] = await fonts;
  const host = new URL(SITE_URL).host;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: COLOR.bg,
          color: COLOR.ink,
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', fontFamily: 'Geist Mono', fontSize: 32, color: COLOR.muted }}>{top}</div>
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 24 ? 84 : 120,
            lineHeight: 1.05,
            letterSpacing: -2,
            fontWeight: 600,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: `2px solid ${COLOR.rule}`,
            paddingTop: 32,
            fontFamily: 'Geist Mono',
            fontSize: 28,
            color: COLOR.muted,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.dot }} />
          {host}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist', data: semiBold, weight: 600, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
