import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og';
import { HEADLINE, NAME } from '@/lib/site';

export const alt = `${NAME}: ${HEADLINE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ top: NAME, title: HEADLINE });
}
