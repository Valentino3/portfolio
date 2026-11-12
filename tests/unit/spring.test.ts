import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createSpring, springAt } from '@/lib/spring';

const CRITICAL = { response: 0.3, damping: 1 };
const BOUNCY = { response: 0.3, damping: 0.7 };

test('a spring reaches its target and comes to rest there', () => {
  const [x, v] = springAt(0, 0, 100, 2, BOUNCY);
  expect(x).toBeCloseTo(100, 3);
  expect(v).toBeCloseTo(0, 3);
});

test('critically damped, it never passes the target, from rest or already moving toward it', () => {
  for (const velocity of [0, 300, 900]) {
    for (let t = 0; t <= 1.5; t += 0.005) {
      const [x] = springAt(0, velocity, 100, t, CRITICAL);
      expect(x, `v0=${velocity}, t=${t.toFixed(3)}`).toBeLessThanOrEqual(100 + 1e-9);
    }
  }
});

test('below critical damping it overshoots, a little', () => {
  let peak = 0;
  for (let t = 0; t <= 1.5; t += 0.005) peak = Math.max(peak, springAt(0, 0, 100, t, BOUNCY)[0]);
  expect(peak).toBeGreaterThan(100);
  expect(peak).toBeLessThan(110);
});

test('at t = 0 a spring is exactly where and as fast as it was released', () => {
  for (const options of [CRITICAL, BOUNCY]) {
    const [x, v] = springAt(40, -250, 100, 0, options);
    expect(x).toBeCloseTo(40, 9);
    expect(v).toBeCloseTo(-250, 9);
  }
});

/* createSpring, on a clock the test drives: rAF callbacks run only when `frame()` is called. */
let now = 0;
let queued: FrameRequestCallback[] = [];
let reduced = false;
const frame = (ms: number) => {
  now += ms;
  const run = queued;
  queued = [];
  for (const callback of run) callback(now);
};

beforeEach(() => {
  now = 0;
  queued = [];
  reduced = false;
  vi.stubGlobal('performance', { now: () => now });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => queued.push(callback));
  vi.stubGlobal('cancelAnimationFrame', () => {
    queued = [];
  });
  vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced }) });
});
afterEach(() => vi.unstubAllGlobals());

test('a retarget mid-flight keeps the position and the velocity it had', () => {
  const frames: number[] = [];
  const spring = createSpring([0], CRITICAL, ([x]) => frames.push(x));
  spring.to([100]);
  frame(16);
  frame(16);
  frame(16);
  // Where the formula says the spring is 48 ms in, and how fast it is moving there.
  const [x48, v48] = springAt(0, 0, 100, 0.048, CRITICAL);
  expect(spring.read()[0]).toBeCloseTo(x48, 6);

  // Turn around. The next frame continues from (x48, v48), not from rest: still moving forward.
  spring.to([0]);
  frame(16);
  const [expected] = springAt(x48, v48, 0, 0.016, CRITICAL);
  expect(frames.at(-1)).toBeCloseTo(expected, 6);
  expect(frames.at(-1)!).toBeGreaterThan(x48);
});

test('it reports rest once it arrives, and stops asking for frames', () => {
  const calls: [number, boolean][] = [];
  const spring = createSpring([0], CRITICAL, ([x], atRest) => calls.push([x, atRest]));
  spring.to([10]);
  for (let i = 0; i < 200 && queued.length; i++) frame(16);
  expect(queued).toHaveLength(0);
  expect(calls.at(-1)).toEqual([10, true]);
});

test('with reduced motion it jumps straight to the end state', () => {
  reduced = true;
  const calls: [number, boolean][] = [];
  const spring = createSpring([0], CRITICAL, ([x], atRest) => calls.push([x, atRest]));
  spring.to([100]);
  expect(calls).toEqual([[100, true]]);
  expect(queued).toHaveLength(0);
});
