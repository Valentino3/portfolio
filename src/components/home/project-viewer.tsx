import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ProjectSummary } from '@/content/types';
import { createSpring, type Spring } from '@/lib/spring';
import { useMediaQuery } from '@/lib/use-media-query';
import { VIEWER_QUERY } from '@/lib/viewer-state';

/*
 * The viewer takes columns 7-12 beside the list and is as tall as the list: the grid stretches
 * it, the picture takes what the caption leaves. Where the list grows much taller than a
 * screenshot can be cropped (a narrow desktop window) the picture stops at 5:4 and the block
 * sticks while the list scrolls. `cqw` is 1% of this column's width.
 */
const PLACEMENT = 'hidden viewer:block viewer:col-span-6 viewer:col-start-7 viewer:mt-list-top @container';
const BLOCK = 'sticky top-6 flex h-[min(100%,calc(80cqw+1.875rem))] flex-col';
const FRAME =
  'relative block min-h-0 flex-1 overflow-hidden rounded-image bg-tint ring-1 ring-rule forced-colors:border forced-colors:border-[CanvasText]';
// Top left, not top center: a taller box crops a screenshot's right edge and keeps its navigation.
const IMAGE = 'absolute inset-0 size-full object-cover object-left-top will-change-[opacity,scale]';
// 6 of the 12 columns of the page grid: about 580px once the 1312px container stops growing, 44-45vw below that.
// The box is taller than 16:10, so the picture is laid out wider than its column: about 5:4 at most.
const SIZES = '(min-width: 1312px) 740px, 56vw';

/** Critically damped: a picture this size settles, it does not bounce. */
const SWAP_SPRING = { response: 0.28, damping: 1 };
/** The incoming picture starts this visible, so the frame is never empty... */
const OPACITY_FROM = 0.4;
/** ...is fully opaque by this much of the way, and spends the rest settling its scale. */
const OPAQUE_AT = 0.6;
const SCALE_FROM = 1.02;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The picture swap. One picture is painted at a time: asking for another drops the one that
 * was showing at once (no fade-out, so two screenshots are never blended), and the new one
 * settles in on opacity and scale, both riding one spring.
 *
 * A change mid-flight restarts the position but keeps the spring's velocity, so pictures
 * asked for in quick succession arrive faster instead of each starting from rest.
 */
function createSwap(images: HTMLImageElement[], initial: number) {
  let shown = initial;

  const paint = (progress: number) => {
    images.forEach((image, i) => {
      const style = image.style;
      if (i === shown) {
        style.visibility = 'visible';
        style.opacity = String(OPACITY_FROM + (1 - OPACITY_FROM) * clamp(progress / OPAQUE_AT));
        style.scale = String(SCALE_FROM - (SCALE_FROM - 1) * clamp(progress));
      } else {
        style.visibility = 'hidden';
        style.opacity = '0';
      }
    });
  };

  const spring: Spring = createSpring([1], SWAP_SPRING, ([progress]) => paint(progress));
  paint(1);

  return {
    show(index: number) {
      if (index === shown) return;
      shown = index;
      spring.place([0]);
      spring.to([1]);
    },
    stop: () => spring.stop(),
  };
}

/**
 * The preview next to the project list (only where hover is real, see `VIEWER_QUERY`). Its
 * images are mounted once that query matches: before it, and on touch, on a narrow screen or
 * without script, it is an empty container that stays hidden, so those visitors never download
 * a viewer image.
 *
 * It repeats what the list already says, so it is `aria-hidden` and its link is out of the tab
 * order (the rows are the real links). The caption is the role and changes with the picture,
 * unanimated: it is text. With reduced motion the picture changes at once too.
 */
export function ProjectViewer({ projects, activeIndex }: { projects: ProjectSummary[]; activeIndex: number }) {
  const enabled = useMediaQuery(VIEWER_QUERY);
  const frame = useRef<HTMLAnchorElement>(null);
  const swap = useRef<ReturnType<typeof createSwap>>(null);
  // Only for the first paint: after it the swap owns the pictures' opacity, not React.
  const [first] = useState(activeIndex);
  const current = useRef(activeIndex);

  useEffect(() => {
    if (!enabled || !frame.current) return;
    const created = createSwap([...frame.current.querySelectorAll('img')], current.current);
    swap.current = created;
    return () => {
      created.stop();
      swap.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    current.current = activeIndex;
    swap.current?.show(activeIndex);
  }, [activeIndex]);

  return (
    <div data-viewer="" aria-hidden="true" className={PLACEMENT}>
      {enabled && (
        <div className={BLOCK}>
          <Link ref={frame} href={`/work/${projects[activeIndex].slug}`} tabIndex={-1} className={FRAME}>
            {projects.map((p, i) => (
              <Image
                key={p.slug}
                src={p.image.src}
                width={p.image.width}
                height={p.image.height}
                sizes={SIZES}
                // The first image is the one a desktop visitor sees at once: it skips the lazy loader.
                loading={i === 0 ? 'eager' : undefined}
                fetchPriority={i === 0 ? 'high' : undefined}
                alt=""
                style={{ opacity: i === first ? 1 : 0 }}
                className={IMAGE}
              />
            ))}
          </Link>
          <p data-cap="" className="mt-2.5 text-small text-text-3">
            {projects[activeIndex].role}
          </p>
        </div>
      )}
    </div>
  );
}
