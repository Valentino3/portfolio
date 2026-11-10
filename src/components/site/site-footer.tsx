import { EMAIL, GITHUB, LINKEDIN } from '@/lib/site';
import { ExternalLink } from './external-link';
import { SiteLink } from './site-link';

const LINK = 'link-u py-1 pointer-coarse:py-2.75';

export function SiteFooter() {
  return (
    <footer className="mt-footer-top flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule pt-4.5 pb-8 font-mono text-label text-text-3">
      <span>© 2026 Valentino Rota</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
        <ExternalLink href={GITHUB} className={LINK}>
          GitHub
        </ExternalLink>
        <ExternalLink href={LINKEDIN} className={LINK}>
          LinkedIn
        </ExternalLink>
        <a href={`mailto:${EMAIL}`} className={LINK}>
          Email
        </a>
      </nav>
      <SiteLink href="#top" className={LINK}>
        Back to top <span aria-hidden="true">↑</span>
      </SiteLink>
    </footer>
  );
}
