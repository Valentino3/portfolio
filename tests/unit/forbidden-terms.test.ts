import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { findForbiddenTerms, sha256 } from '../support/forbidden-terms';

// Made-up terms, hashed here: the real list is never spelled out anywhere.
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const PHRASE = hash('zebra quartz');
const WORD = hash('quartz');
const DOTTED = hash('zebra.pdf');
const FOUR = hash('one two three four');
const terms = new Set([PHRASE, WORD, DOTTED, FOUR]);

test('hashing is deterministic, hex SHA-256', () => {
  expect(sha256('zebra quartz')).toBe(PHRASE);
  expect(sha256('zebra quartz')).toBe(sha256('zebra quartz'));
  expect(sha256('zebra quartz')).toMatch(/^[0-9a-f]{64}$/);
});

test('finds a term in running text, and returns its hash, not the text', () => {
  expect(findForbiddenTerms('A zebra quartz appeared.', new Set([PHRASE]))).toEqual([PHRASE]);
  expect(findForbiddenTerms('A zebra quartz appeared.', new Set([PHRASE]))).toEqual(
    findForbiddenTerms('A zebra quartz appeared.', new Set([PHRASE])),
  );
});

test('ignores case and accents', () => {
  expect(findForbiddenTerms('ZÉBRA Quártz', new Set([PHRASE]))).toEqual([PHRASE]);
});

test('phrases cross punctuation, hyphens and line breaks', () => {
  for (const text of ['zebra-quartz', 'zebra, quartz', 'zebra—quartz', '"zebra"/quartz', 'zebra\n\tquartz'])
    expect(findForbiddenTerms(text, new Set([PHRASE])), text).toEqual([PHRASE]);
});

test('a dot inside a word stays in it; dots at its ends are dropped', () => {
  expect(findForbiddenTerms('see zebra.pdf', new Set([DOTTED]))).toEqual([DOTTED]);
  expect(findForbiddenTerms('...quartz.', new Set([WORD]))).toEqual([WORD]);
  expect(findForbiddenTerms('zebra.pdfs', new Set([DOTTED]))).toEqual([]);
});

test('checks phrases of up to four words, each hash once, in order of appearance', () => {
  expect(findForbiddenTerms('one two three four', new Set([FOUR]))).toEqual([FOUR]);
  expect(findForbiddenTerms('one two three five four', new Set([FOUR]))).toEqual([]);
  expect(findForbiddenTerms('quartz, then zebra quartz, then quartz again', terms)).toEqual([WORD, PHRASE]);
});

test('returns nothing for clean text', () => {
  expect(findForbiddenTerms('Design engineer who builds the whole product.')).toEqual([]);
  expect(findForbiddenTerms('zebras and quartzite', terms)).toEqual([]);
  expect(findForbiddenTerms('', terms)).toEqual([]);
});
