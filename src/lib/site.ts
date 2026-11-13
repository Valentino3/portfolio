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
