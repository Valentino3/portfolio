import { languagesLine } from '@/content/profile';

/**
 * The sentence above the address in the home's contact block (a case ends on a shorter one): what roles,
 * where (remote, or on-site after the move) and in which time zone, then the languages, quieter.
 */
export function ContactLine() {
  return (
    <p className="max-w-[64ch] text-base text-text-2">
      Open to design engineering and full-stack roles: remote (UTC−3), or on-site in Buenos Aires, relocating from
      Mar del Plata.{' '}
      <span className="text-text-3">{`${languagesLine()}.`}</span>
    </p>
  );
}
