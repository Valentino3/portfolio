'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CLIPS, type ClipName } from '@/content/clips';
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
 * (or without it) it is its poster, with no button that would do nothing. The button sits in the
 * caption row, so it never covers the recording.
 *
 * Files and size come from the `CLIPS` registry, so the box is reserved at the clip's own
 * proportions. `alt` describes what happens in the recording, for assistive tech.
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
    <FigureFrame
      caption={caption}
      className="mt-6"
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
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        poster={`/media/${name}-poster.webp`}
        width={CLIPS[name].width}
        height={CLIPS[name].height}
        aria-label={alt}
        data-clip=""
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full bg-ink"
      >
        <source src={`/media/${name}.webm`} type="video/webm" />
      </video>
    </FigureFrame>
  );
}
