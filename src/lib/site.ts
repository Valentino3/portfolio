/**
 * Canonical origin, used for metadataBase and later for OG, sitemap and robots.
 * `||`, not `??`: an env var set to an empty string must fall back too, or `new URL('')` throws.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://valentinorota.vercel.app';

export const NAME = 'Valentino Rota';
export const HEADLINE = 'Design engineer who builds the whole product.';

export const EMAIL = 'valentino.rota3@gmail.com';
export const GITHUB = 'https://github.com/Valentino3';
export const LINKEDIN = 'https://www.linkedin.com/in/valentino-rota-005011209';
