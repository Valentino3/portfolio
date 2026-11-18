'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { springAt } from '@/lib/spring';
import s from './cash-closing.module.css';

/** Where a damped spring released at rest from 0 towards 1 is, `t` seconds later (0 before). */
const spring = (t: number, response: number) =>
  t <= 0 ? 0 : springAt(0, 0, 1, t, { response, damping: 1 })[0];
/** Opacity is not a position: a short ease-out ramp of `d` seconds. */
const fade = (t: number, d: number) => (t <= 0 ? 0 : t >= d ? 1 : 1 - (1 - t / d) ** 3);
const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** Spring responses, seconds: figures align fast, a sum rule draws slow, a digit swaps fast. */
const ALIGN = 0.32;
const RULE = 0.8;
const SWAP = 0.34;
/** The beat sheet, seconds. Typed figures: when each one appears, then when it moves into the column. */
const ARRIVE = [0.1, 0.22, 0.34, 2.35];
const SNAP = [0.8, 0.84, 0.88, 2.85];
const B = { r1: 1.35, r2: 3.25, swap: 4.55, zeroOut: 4.7, zeroIn: 4.84, d1: 5.15, d2: 5.22, close: 5.55 };
/** Every spring above is within 0.001 of rest by here: the last frame equals the closed state. */
const END = 6.6;

/** A computed figure: one span per character, so each can arrive on its own. */
const chars = (text: string) => [...text].map((c, i) => <span key={i}>{c}</span>);

function Row({ label, gap, children }: { label: string; gap?: boolean; children: ReactNode }) {
  return (
    <div className={gap ? `${s.row} ${s.gap}` : s.row}>
      <span className={s.label}>{label}</span>
      <span className={s.amount}>{children}</span>
    </div>
  );
}

/**
 * A cash closing, as a ledger: the day's figures, the expected total, the count, and the
 * difference that has to be zero before the register closes. The server renders the closed
 * state, and that is what a visitor without script or with reduced motion sees. With motion, the
 * closing plays once when the sheet is at least 40% on screen: the typed figures fall into their
 * column, the sum rules draw and the totals follow them, the count is corrected by one digit, the
 * difference goes to zero and is ruled off. It pauses off screen or in a hidden tab, resumes where
 * it stopped and then rests, closed. Only transform and opacity change, through closed-form
 * springs (`springAt`), so a dropped frame lands on the same curve.
 *
 * The ledger is decorative for assistive tech (demo figures); the caption carries the point.
 * A case renders it twice: beside its header from 1024px up (the page hides that slot below), and
 * `inBody`, in the text for narrower screens, hidden from 1024px up. A hidden copy is
 * `display: none`, so it is out of the accessibility tree and never on screen: it never plays.
 */
export function CashClosing({ inBody }: { inBody?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const $ = (k: string) => root.querySelector(`[data-k="${k}"]`) as HTMLElement;
    const all = (q: string) => [...root.querySelectorAll<HTMLElement>(q)];
    const inputs = all('[data-in]');
    const sums = all('[data-sum]');
    const [oldDigit, newDigit] = $('sw').children as HTMLCollectionOf<HTMLElement>;
    const zero = $('zero');
    const [open, closed] = [$('open'), $('closed')];

    // Paint only what changed, and only transform and opacity: nothing that moves layout.
    const painted = new Map<HTMLElement, string>();
    const put = (el: HTMLElement, o: number, tr = '') => {
      const op = o.toFixed(3);
      if (painted.get(el) === op + tr) return;
      painted.set(el, op + tr);
      el.style.opacity = op;
      el.style.transform = tr;
    };

    // Where each typed figure starts: right after its label, the way text would set it. Read
    // after the fonts load and on resize, never inside a frame.
    let start: number[] = [];
    const measure = () => {
      start = inputs.map((fig) => {
        fig.style.transform = '';
        painted.delete(fig);
        const label = (fig.parentNode as HTMLElement).previousElementSibling!.getBoundingClientRect();
        return label.right + parseFloat(getComputedStyle(fig).fontSize) / 2 - fig.getBoundingClientRect().left;
      });
    };

    // A computed figure appears digit by digit from the right as its rule passes over it, the
    // order you add in by hand: when the rule's spring crosses each digit's centre.
    const cross = sums.map((fig, i) => {
      const n = fig.children.length;
      return [...fig.children].map((_, k) => {
        const at = ((i ? 0 : 1) + n - k - 0.5) / 12;
        let t = 0;
        while (spring(t, RULE) < at && t < 3) t += 0.004;
        return (i ? B.r2 : B.r1) + t;
      });
    });

    const paint = (t: number) => {
      // 1. Typed figures arrive after their label, then move into the column.
      inputs.forEach((fig, i) =>
        put(fig, fade(t - ARRIVE[i], 0.18), `translateX(${(start[i] * (1 - spring(t - SNAP[i], ALIGN))).toFixed(2)}px)`),
      );
      // 2. Rules draw right to left; the sums follow them.
      put($('r1'), 1, `scaleX(${spring(t - B.r1, RULE).toFixed(4)})`);
      put($('r2'), 1, `scaleX(${spring(t - B.r2, RULE).toFixed(4)})`);
      cross.forEach((times, i) =>
        [...sums[i].children].forEach((c, k) =>
          put(
            c as HTMLElement,
            fade(t - times[k], 0.12),
            `translateY(${(0.35 * (1 - spring(t - times[k], ALIGN))).toFixed(3)}em)`,
          ),
        ),
      );
      // 3. The recount: one digit changes, the difference goes to zero.
      const sp = spring(t - B.swap, SWAP);
      put(oldDigit, 1 - fade(t - B.swap, 0.12), `translateY(${(-0.5 * sp).toFixed(3)}em)`);
      put(newDigit, fade(t - B.swap - 0.06, 0.16), `translateY(${(0.5 * (1 - sp)).toFixed(3)}em)`);
      const zo = fade(t - B.zeroOut, 0.14);
      put(sums[1], t < B.r2 ? 0 : 1 - zo, `translateY(${(-0.35 * zo).toFixed(3)}em)`);
      put(zero, fade(t - B.zeroIn, 0.16), `translateY(${(0.45 * (1 - spring(t - B.zeroIn, SWAP))).toFixed(3)}em)`);
      // 4. Closed: a double rule under the zero, and the status says so.
      put($('d1'), 1, `scaleX(${spring(t - B.d1, RULE).toFixed(4)})`);
      put($('d2'), 1, `scaleX(${spring(t - B.d2, RULE).toFixed(4)})`);
      const cs = spring(t - B.close, SWAP);
      put(open, clamp(1 - cs / 0.3), `translateY(${(-0.5 * cs).toFixed(3)}em)`);
      put(closed, clamp((cs - 0.35) / 0.45), `translateY(${(0.5 * (1 - cs)).toFixed(3)}em)`);
    };

    // The closed state: what the server rendered. Dropping the inline styles returns to it.
    const settle = () => {
      painted.clear();
      all('[style]').forEach((el) => el.removeAttribute('style'));
    };

    let clock = 0;
    let prev = 0;
    let frame = 0;
    let visible = false;
    let done = false;
    const loop = (now: number) => {
      clock += Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (clock >= END) return stop(true);
      paint(clock);
      frame = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(frame);
      if (done) return;
      if (reduce.matches) return settle();
      if (!start.length) measure();
      paint(clock);
      if (visible && !document.hidden) {
        prev = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };
    // Label widths change when a webfont arrives; the box does not, so ResizeObserver misses it.
    const refresh = () => {
      if (done || reduce.matches) return;
      measure();
      paint(clock);
    };
    // It starts once 40% is on screen, and pauses only when none of it is.
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        visible = e.intersectionRatio >= 0.4 || (clock > 0 && e.isIntersecting);
        run();
      },
      { threshold: [0, 0.4] },
    );
    const ro = new ResizeObserver(refresh);
    const fonts = document.fonts;
    const stop = (finished: boolean) => {
      cancelAnimationFrame(frame);
      done = true;
      io.disconnect();
      ro.disconnect();
      fonts.removeEventListener('loadingdone', refresh);
      document.removeEventListener('visibilitychange', run);
      reduce.removeEventListener('change', run);
      if (finished) settle();
    };
    io.observe(root);
    ro.observe(root);
    fonts.ready.then(refresh);
    fonts.addEventListener('loadingdone', refresh);
    document.addEventListener('visibilitychange', run);
    reduce.addEventListener('change', run);
    run();
    return () => stop(false);
  }, []);

  return (
    <figure className={inBody ? `${s.figure} mt-6 mb-8 lg:hidden` : s.figure}>
      <div ref={ref} className={s.sheet} aria-hidden="true" data-ledger="">
        <div className={s.head}>
          <span className={s.title}>Cash closing</span>
          <span className={s.status}>
            <span data-k="open">Open</span>
            <span data-k="closed">Closed</span>
          </span>
        </div>
        <Row label="Opening cash">
          <span className={s.fig} data-in="">
            20.000,00
          </span>
        </Row>
        <Row label="Cash sales">
          <span className={s.fig} data-in="">
            148.350,00
          </span>
        </Row>
        <Row label="Withdrawals">
          <span className={`${s.fig} ${s.neg}`} data-in="">
            (15.000,00)
          </span>
        </Row>
        <Row label="Expected" gap>
          <span className={`${s.rule} ${s.top}`} data-k="r1" />
          <span className={s.fig} data-sum="">
            {chars('153.350,00')}
          </span>
        </Row>
        <Row label="Counted">
          <span className={s.fig} data-in="">
            153.
            <span className={s.swap} data-k="sw">
              <span className={s.before}>2</span>
              <span>3</span>
            </span>
            50,00
          </span>
        </Row>
        <Row label="Difference" gap>
          <span className={`${s.rule} ${s.top}`} data-k="r2" />
          <span className={`${s.fig} ${s.neg} ${s.error} ${s.before}`} data-sum="">
            {chars('(100,00)')}
          </span>
          <span className={s.fig} data-k="zero">
            0,00
          </span>
          <span className={`${s.rule} ${s.under}`} data-k="d1" />
          <span className={`${s.rule} ${s.under2}`} data-k="d2" />
        </Row>
      </div>
      <figcaption className={s.caption}>
        <span>Closes only at zero difference</span>
        <span>demo figures</span>
      </figcaption>
    </figure>
  );
}
