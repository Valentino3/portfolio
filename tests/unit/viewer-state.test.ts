import { expect, test } from 'vitest';
import {
  activeIndex,
  CAPTION_SWAP_MS,
  HOVER_INTENT_MS,
  INITIAL_VIEWER_STATE,
  viewerReducer,
  type ViewerState,
} from '@/lib/viewer-state';

test('hover beats focus beats last selected', () => {
  expect(activeIndex({ hovered: 2, focused: 1, selected: 0 })).toBe(2);
  expect(activeIndex({ hovered: null, focused: 1, selected: 0 })).toBe(1);
  expect(activeIndex({ hovered: null, focused: null, selected: 3 })).toBe(3);
});

test('index 0 is a valid hovered or focused row, not "nothing"', () => {
  expect(activeIndex({ hovered: 0, focused: 4, selected: 2 })).toBe(0);
  expect(activeIndex({ hovered: null, focused: 0, selected: 2 })).toBe(0);
});

test('timings come from the prototype: 110 ms hover intent, 150 ms caption swap', () => {
  expect(HOVER_INTENT_MS).toBe(110);
  expect(CAPTION_SWAP_MS).toBe(150);
});

test('the viewer starts on the first project with nothing hovered or focused', () => {
  expect(INITIAL_VIEWER_STATE).toEqual({ hovered: null, focused: null, selected: 0 });
});

const run = (...actions: Parameters<typeof viewerReducer>[1][]): ViewerState =>
  actions.reduce(viewerReducer, INITIAL_VIEWER_STATE);

test('hovering a row shows it and remembers it after the pointer leaves the list', () => {
  const hovered = run({ type: 'hover', index: 3 });
  expect(activeIndex(hovered)).toBe(3);
  const left = viewerReducer(hovered, { type: 'leave' });
  expect(left.hovered).toBeNull();
  expect(activeIndex(left)).toBe(3);
});

test('focusing a row shows it and remembers it after blur', () => {
  const blurred = run({ type: 'focus', index: 4 }, { type: 'blur' });
  expect(blurred.focused).toBeNull();
  expect(activeIndex(blurred)).toBe(4);
});

test('a hovered row wins over a focus that arrives later, and the focus applies once the pointer leaves', () => {
  const both = run({ type: 'hover', index: 0 }, { type: 'focus', index: 4 });
  expect(activeIndex(both)).toBe(0);
  expect(activeIndex(viewerReducer(both, { type: 'leave' }))).toBe(4);
});

test('blur while the pointer still hovers another row keeps the hovered row', () => {
  const state = run({ type: 'focus', index: 2 }, { type: 'hover', index: 1 }, { type: 'blur' });
  expect(activeIndex(state)).toBe(1);
});

test('events that change nothing return the same state, so React skips the render', () => {
  const state = run({ type: 'hover', index: 2 });
  expect(viewerReducer(state, { type: 'hover', index: 2 })).toBe(state);
  expect(viewerReducer(INITIAL_VIEWER_STATE, { type: 'leave' })).toBe(INITIAL_VIEWER_STATE);
  expect(viewerReducer(INITIAL_VIEWER_STATE, { type: 'blur' })).toBe(INITIAL_VIEWER_STATE);
});
