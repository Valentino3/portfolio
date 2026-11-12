/**
 * A damped spring, solved in closed form. Position and velocity at any moment come from the
 * formula, not from stepping a simulation, so a long or dropped frame lands on the same curve.
 *
 * What a CSS transition cannot do is the reason this exists: `to()` can be called while the
 * spring is moving, and it restarts the formula from the position and velocity it has at that
 * instant. A change of direction mid-flight is then continuous in both, instead of a new curve
 * that starts from rest.
 */

export type SpringOptions = {
  /** Seconds of one undamped oscillation: lower is stiffer. About 0.3 for UI. */
  response: number;
  /** Damping ratio. 1 is critically damped (no overshoot); below 1 overshoots. */
  damping: number;
};

/** Distance and speed under which a spring counts as arrived, in its own units (px, or 0..1). */
const REST_DISTANCE = 0.001;
const REST_SPEED = 0.01;

/**
 * Where a spring released at `from` with velocity `velocity` is `t` seconds later, on its way
 * to `to`. Returns the position and the velocity (units per second).
 */
export function springAt(
  from: number,
  velocity: number,
  to: number,
  t: number,
  { response, damping }: SpringOptions,
): [position: number, velocity: number] {
  const omega = (2 * Math.PI) / response;
  const d0 = from - to;
  if (damping >= 1) {
    // Critically damped: d(t) = e^(-wt) (d0 + (v0 + w d0) t)
    const b = velocity + omega * d0;
    const decay = Math.exp(-omega * t);
    return [to + decay * (d0 + b * t), decay * (velocity - omega * b * t)];
  }
  // Underdamped: d(t) = e^(-at) (A cos(wd t) + B sin(wd t)), a = zeta w
  const a = damping * omega;
  const wd = omega * Math.sqrt(1 - damping * damping);
  const B = (velocity + a * d0) / wd;
  const decay = Math.exp(-a * t);
  const cos = Math.cos(wd * t);
  const sin = Math.sin(wd * t);
  return [to + decay * (d0 * cos + B * sin), decay * ((B * wd - a * d0) * cos - (a * B + d0 * wd) * sin)];
}

export type Spring = {
  /** Head for new targets from wherever the values are now, keeping their velocity. */
  to(targets: number[]): void;
  /** Place the values here at once, at rest. */
  jump(values: number[]): void;
  /** Move the values without touching target or velocity (a layer that restarts from 0, say). */
  place(values: number[]): void;
  /** The values right now. */
  read(): number[];
  stop(): void;
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A set of values that move together on one animation frame loop (the y and height of a bar,
 * say). `onFrame` gets the values on every frame, and once more with `atRest` when they arrive. With
 * reduced motion `to()` is `jump()`: straight to the end state.
 */
export function createSpring(
  initial: number[],
  options: SpringOptions,
  onFrame: (values: number[], atRest: boolean) => void,
): Spring {
  let from = [...initial];
  let velocity = initial.map(() => 0);
  let target = [...initial];
  let startedAt = 0;
  let frame = 0;

  const sample = (now: number) => {
    const t = Math.max(0, (now - startedAt) / 1000);
    return from.map((x, i) => springAt(x, velocity[i], target[i], t, options));
  };
  /** Makes "now" the new release point, so the formula continues from here. */
  const rebase = (now: number) => {
    const state = frame ? sample(now) : from.map((x, i) => [x, velocity[i]]);
    from = state.map(([x]) => x);
    velocity = state.map(([, v]) => v);
    startedAt = now;
  };
  const tick = (now: number) => {
    const state = sample(now);
    const resting = state.every(
      ([x, v], i) => Math.abs(x - target[i]) < REST_DISTANCE && Math.abs(v) < REST_SPEED,
    );
    if (resting) {
      frame = 0;
      from = [...target];
      velocity = target.map(() => 0);
      onFrame(from, true);
      return;
    }
    onFrame(state.map(([x]) => x), false);
    frame = requestAnimationFrame(tick);
  };

  const spring: Spring = {
    to(targets) {
      if (reducedMotion()) return spring.jump(targets);
      rebase(performance.now());
      target = [...targets];
      if (!frame) frame = requestAnimationFrame(tick);
    },
    jump(values) {
      cancelAnimationFrame(frame);
      frame = 0;
      from = [...values];
      target = [...values];
      velocity = values.map(() => 0);
      onFrame(from, true);
    },
    place(values) {
      rebase(performance.now());
      from = [...values];
    },
    read() {
      return frame ? sample(performance.now()).map(([x]) => x) : [...from];
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
  return spring;
}
