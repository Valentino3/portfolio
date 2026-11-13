'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CLIPS, isNarrowClip, type ClipName } from '@/content/clips';
import { FigureFrame } from './figure-frame';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/** The share of the video that has to be on screen for it to play. */
const VISIBLE = 0.4;
/**
 * How far past the screen's top and bottom a clip's poster starts to load: about a fling of the
 * page, so it is there before the clip is. Native `loading="lazy"` cannot be told this: Chromium
 * loads anything within roughly 2500px, which takes in clips that are several screens away.
 */
const POSTER_MARGIN = '500px 0px';

const subscribeNever = () => () => {};
/** False on the server and while hydrating, true after: for what only makes sense with script. */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/**
 * A short screen recording that plays only while it is on screen, and always has a Play/Pause
 * button. It starts paused for a visitor who prefers reduced motion, and once the visitor has
 * paused it, it stays paused however often it scrolls out and back. Until the page's script runs
 * (or without it) it is its poster, with no button that would do nothing. The button sits in the
 * caption row, so it never covers the recording.
 *
 * The poster is an `<img>` under the video, not the video's `poster` attribute: that one is
 * fetched while the page is parsed, even far below the fold, and competes with the hero for the
 * first paint. The `<img>` gets its `src` only when the clip is within `POSTER_MARGIN` of the
 * screen, and a `<noscript>` copy gives a visitor without script the poster at once. The video
 * lies over it, in the same box, invisible until its first `playing` event and then faded in;
 * after that it stays shown, so a clip the visitor pauses keeps its paused frame. The markup is
 * the same on the server and on the first client render (no `src`, video hidden): only the
 * observers change it. The frame's own tint is what shows if the poster has not arrived yet.
 *
 * Files and size come from the `CLIPS` registry, so the box is reserved at the clip's own
 * proportions. A near-square or portrait clip is capped at 32rem (`max-w-lg`), aligned with the
 * text: at the column's full width it would be taller than the screen. `alt` describes what
 * happens in the recording, for assistive tech (the poster is decorative: it is that same frame).
 */
export function Clip({
  name,
  alt,
  caption,
}: {
  name: ClipName;
  alt: string;
  caption: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  // Set by the visitor's Pause, and from the start under reduced motion: scrolling must not undo it.
  const stayPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  // True from the first frame on and never back: a paused clip keeps showing the frame it stopped at.
  const [shown, setShown] = useState(false);
  // True once the clip has come within POSTER_MARGIN of the screen, and never back.
  const [near, setNear] = useState(false);
  const hydrated = useHydrated();
  const { width, height } = CLIPS[name];
  const poster = `/media/${name}-poster.webp`;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = window.matchMedia(REDUCED_MOTION);
    stayPaused.current = reduced.matches;
    const onPreference = () => {
      if (!reduced.matches) return;
      stayPaused.current = true;
      element.pause();
    };
    reduced.addEventListener('change', onPreference);
    const approach = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNear(true);
        approach.disconnect();
      },
      { rootMargin: POSTER_MARGIN },
    );
    approach.observe(element);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        // A play() cut short by a pause() rejects with an AbortError: the button already shows the outcome.
        if (visible && !stayPaused.current) element.play().catch(() => {});
        else if (!visible) element.pause();
      },
      { threshold: VISIBLE },
    );
    observer.observe(element);
    return () => {
      approach.disconnect();
      observer.disconnect();
      reduced.removeEventListener('change', onPreference);
    };
  }, []);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    stayPaused.current = !element.paused;
    if (element.paused) element.play().catch(() => {});
    else element.pause();
  };

  return (
    <FigureFrame
      caption={caption}
      className={isNarrowClip(name) ? 'mt-6 max-w-lg' : 'mt-6'}
      action={
        hydrated && (
          // The label is the state's counterpart (Play while paused, Pause while playing), so there is
          // no aria-pressed. It gives under the press and springs back.
          <button
            type="button"
            onClick={toggle}
            className="-mt-1 min-w-16 shrink-0 cursor-pointer rounded-full border border-rule-strong px-3 py-1 text-small text-ink transition-[border-color,scale] duration-pop ease-spring-pop hover:border-ink active:scale-95"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        )
      }
    >
      {/* The box has the clip's proportions whatever has loaded; the poster and the video fill it. */}
      <div className="relative" style={{ aspectRatio: `${width} / ${height}` }}>
        {/* Plain imgs: the file is already a small WebP, and next/image would not add anything here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={near ? poster : undefined}
          width={width}
          height={height}
          alt=""
          loading="lazy"
          decoding="async"
          data-clip-poster=""
          className="absolute inset-0 block h-full w-full"
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} width={width} height={height} alt="" className="absolute inset-0 block h-full w-full" />
        </noscript>
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          width={width}
          height={height}
          aria-label={alt}
          data-clip=""
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onPlaying={() => setShown(true)}
          className={`absolute inset-0 block h-full w-full transition-opacity duration-medium ${shown ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={`/media/${name}.webm`} type="video/webm" />
        </video>
      </div>
    </FigureFrame>
  );
}
