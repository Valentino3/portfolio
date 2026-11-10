import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { NumberedProject } from '@/content/types';
import { useMediaQuery } from '@/lib/use-media-query';
import { CAPTION_SWAP_MS, VIEWER_QUERY } from '@/lib/viewer-state';

// The viewer fills columns 7-12 of the hero grid next to the intro and the list, and sticks while the list scrolls.
const PLACEMENT =
  'hidden viewer:block viewer:col-span-6 viewer:col-start-7 viewer:row-start-1 viewer:row-span-2 sticky top-6 self-start';
const FRAME =
  'relative block aspect-16/10 overflow-hidden rounded-image bg-tint ring-1 ring-rule forced-colors:border forced-colors:border-[CanvasText]';
const IMAGE = 'crossfade absolute inset-0 size-full object-cover object-top';
// `on` marks the image being shown: a plain class the e2e tests (and the prototype) use to find it.
const IMAGE_ON = 'on scale-100 opacity-100';
const IMAGE_OFF = 'scale-103 opacity-0';
// 6 of the 12 columns of the page grid: about 580px once the 1312px container stops growing, 44-45vw below that.
const SIZES = '(min-width: 1312px) 580px, 45vw';

/**
 * The sticky preview next to the project list (only where hover is real, see
 * `VIEWER_QUERY`). Its images are mounted once that query matches: before it,
 * and on touch, on a narrow screen or without script, it is an empty container
 * that stays hidden, so those visitors never download a viewer image.
 *
 * It repeats what the list already says, so it is `aria-hidden` and its link is
 * out of the tab order (the rows are the real links). The image swap is a
 * crossfade; the caption fades out, changes text after CAPTION_SWAP_MS and fades
 * back in. With reduced motion nothing animates and the caption changes at once.
 */
export function ProjectViewer({ projects, activeIndex }: { projects: NumberedProject[]; activeIndex: number }) {
  const enabled = useMediaQuery(VIEWER_QUERY);
  const [captionIndex, setCaptionIndex] = useState(activeIndex);

  useEffect(() => {
    if (captionIndex === activeIndex) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setCaptionIndex(activeIndex), reduce ? 0 : CAPTION_SWAP_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, captionIndex]);

  const caption = projects[captionIndex];
  return (
    <div data-viewer="" aria-hidden="true" className={PLACEMENT}>
      {enabled && (
        <>
          <Link href={`/work/${projects[activeIndex].slug}`} tabIndex={-1} className={FRAME}>
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
                className={`${IMAGE} ${i === activeIndex ? IMAGE_ON : IMAGE_OFF}`}
              />
            ))}
          </Link>
          <div
            data-cap=""
            className={`mt-3.5 flex justify-between gap-6 font-mono text-meta text-text-3 transition-opacity duration-fast ${
              captionIndex === activeIndex ? '' : 'opacity-0'
            }`}
          >
            <span>
              <b className="font-medium text-ink">{caption.role}</b> · {caption.kind}
            </span>
            <span>{caption.stack.join(' · ')}</span>
          </div>
        </>
      )}
    </div>
  );
}
