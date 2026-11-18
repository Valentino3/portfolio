/**
 * Canonical origin, used for metadataBase, OG images, sitemap and robots.
 * Read on the server only (never imported by a client component), so the variable needs no public prefix.
 * `||`, not `??`: an env var set to an empty string must fall back too, or `new URL('')` throws.
 */
export const SITE_URL = process.env.NEXT_SITE_URL || 'https://valentinorota.vercel.app';

export const NAME = 'Valentino Rota';
/** Open Graph fields every page repeats: a page's own `openGraph` replaces the layout's, it is not merged. */
export const OPEN_GRAPH_SITE = { siteName: NAME, locale: 'en_US' } as const;
export const HEADLINE = 'Design engineer who builds the whole product.';

export const EMAIL = 'valentino.rota3@gmail.com';
export const GITHUB = 'https://github.com/Valentino3';
export const LINKEDIN = 'https://www.linkedin.com/in/valentino-rota-005011209';
/**
 * The CV is a page of the site, /cv: every CV link (header, footer, hero, a case's end) goes there,
 * in the same tab, and the page offers the PDF. A page reads on a phone and can be linked to; a
 * PDF in a new tab is a dead end on both.
 */
export const CV_PAGE = '/cv';
/**
 * The PDF, offered by /cv only: the page printed to public/ by `npm run resume`. Null would leave
 * the download link out. A unit test checks the file is there, so the link can't go stale.
 */
export const CV_URL: string | null = '/valentino-rota-resume.pdf';
