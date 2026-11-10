'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FigureFrame } from './figure-frame';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/** The share of the video that has to be on screen for it to play. */
const VISIBLE = 0.4;

const subscribeNever = () => () => {};
/** False on the server and while hydrating, true after: for what only makes sense with script. */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/**
 * A short screen recording that plays only while it is on screen, and always has a Play/Pause
 * button. It starts paused for a visitor who prefers reduced motion, and once the visitor has
 * paused it, it stays paused however often it scrolls out and back. Until the page's script runs
 * (or without it) it is its poster, with no button that would do nothing.
 *
 * Files: `/media/{name}.webm` and `/media/{name}-poster.webp`, both 1280x800. `alt` describes
 * what happens in the recording, for assistive tech.
 */
export function Clip({
  name,
  alt,
  caption,
  note,
}: {
  name: 'conosur-releases' | 'bakery-scroll';
  alt: string;
  caption: string;
  note?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  // Set by the visitor's Pause, and from the start under reduced motion: scrolling must not undo it.
  const stayPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const hydrated = useHydrated();

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
    // The 18px above matches the other blocks of a section (cards, gallery, diagram).
    <FigureFrame caption={caption} note={note} className="mt-4.5">
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        poster={`/media/${name}-poster.webp`}
        width={1280}
        height={800}
        aria-label={alt}
        data-clip=""
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full bg-ink"
      >
        <source src={`/media/${name}.webm`} type="video/webm" />
      </video>
      {hydrated && (
        // The label is the state's counterpart (Play while paused, Pause while playing), so there is no
        // aria-pressed. Text size only: like the caption, the line height is the surrounding text's.
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 bottom-3 cursor-pointer rounded-full border border-paper/28 bg-ink/72 px-3 py-1.5 font-mono text-(length:--text-label) text-bg hover:bg-ink/90 focus-visible:outline-bg focus-visible:outline-offset-2"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      )}
    </FigureFrame>
  );
}
