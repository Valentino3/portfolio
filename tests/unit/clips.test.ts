import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { expect, test } from 'vitest';
import { CLIPS, isNarrowClip, type ClipName } from '@/content/clips';

const names = Object.keys(CLIPS) as ClipName[];
const media = (file: string) => `public/media/${file}`;

/**
 * The frame size a WebM declares: PixelWidth (0xB0) and PixelHeight (0xBA), the first two
 * elements of its Video element (0xE0), each with a one-byte size (0x81-0x84) and that many bytes.
 */
function webmSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  const read = (id: number, from: number) => {
    for (let i = from; i < bytes.length - 2; i++) {
      const length = bytes[i + 1] - 0x80;
      if (bytes[i] === id && length >= 1 && length <= 4) {
        return { value: bytes.subarray(i + 2, i + 2 + length).reduce((n, b) => n * 256 + b, 0), end: i + 2 + length };
      }
    }
    throw new Error(`${file}: no element 0x${id.toString(16)}`);
  };
  const video = bytes.indexOf(0xe0);
  const width = read(0xb0, video);
  const height = read(0xba, width.end);
  return { width: width.value, height: height.value };
}

test('every clip in the registry has its video and poster, and the registry has the video’s real size', async () => {
  for (const name of names) {
    expect(webmSize(media(`${name}.webm`)), name).toEqual(CLIPS[name]);
    const poster = await sharp(media(`${name}-poster.webp`)).metadata();
    // The poster is a smaller copy at the same proportions: nothing letterboxed under the video box.
    const { width, height } = CLIPS[name];
    expect(Math.abs(poster.width! / poster.height! / (width / height) - 1), name).toBeLessThan(0.005);
  }
  expect(CLIPS['conosur-releases']).toEqual({ width: 2304, height: 1720 });
  expect(CLIPS['dsp2-weights']).toEqual({ width: 1764, height: 2013 });
});

test('posters are light: they compete with the hero for the first paint', async () => {
  for (const name of names) {
    const file = media(`${name}-poster.webp`);
    expect((await sharp(file).metadata()).width, name).toBeLessThanOrEqual(1320);
    expect(statSync(file).size, name).toBeLessThanOrEqual(40 * 1024);
  }
});

test('only a near-square or portrait clip is shown narrower than the column', () => {
  expect(names.filter(isNarrowClip)).toEqual(['dsp2-weights']);
});
