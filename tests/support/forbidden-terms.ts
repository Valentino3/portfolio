import { createHash } from 'node:crypto';

// SHA-256 of terms that must never be published. Stored as hashes so this public file doesn't publish them.
const FORBIDDEN: ReadonlySet<string> = new Set([
  'e3dde84b8bf31a360a29545a3de3799f226214bb2309037da4b960655fb23187',
  'd99468a54179e3d803864639c5c22609029ed87dfa11ed0b68b31c446b222844',
  '8120539507cd2011e757b6ab2df157635127d9232f90fcbff804a56d675764f6',
  'd2e8c0d278fc9bf3f6512cdd1043a4d163da9b0322f09bdf9251f8be23dd6cd7',
  '643779ad6e818eda34a8f4a6e4f6d40d36c3201ad54680df9d307b506c6b396a',
  'ad3420dee78dae23a35e99a3df0f86b51668a6a63e43b378acef87d609f3ea34',
  'f42f019e08147433ede3420540858f411cd8186e23cb563187177fa1ec26191b',
]);

/** Longest phrase checked, in words. */
const MAX_WORDS = 4;

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Lowercase words without accents. Dots stay inside a word ("file.pdf"), not at its ends. */
function words(text: string): string[] {
  const plain = text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  return (plain.match(/[\p{L}\p{N}.]+/gu) ?? []).map((w) => w.replace(/^\.+|\.+$/g, '')).filter(Boolean);
}

/**
 * The hashes of the forbidden terms that appear in `text`, each once, in order of appearance.
 * Every run of 1 to 4 consecutive words is hashed and looked up, so a term is found across
 * case, accents, punctuation and hyphens. Only hashes are returned, never the matched text.
 */
export function findForbiddenTerms(text: string, forbidden: ReadonlySet<string> = FORBIDDEN): string[] {
  const all = words(text);
  const found = new Set<string>();
  for (let start = 0; start < all.length; start++) {
    for (let n = 1; n <= MAX_WORDS && start + n <= all.length; n++) {
      const hash = sha256(all.slice(start, start + n).join(' '));
      if (forbidden.has(hash)) found.add(hash);
    }
  }
  return [...found];
}
