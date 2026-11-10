'use client';

import Image from 'next/image';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Media } from '@/content/types';

/** Opens the dialog on an image. False when the browser has no modal dialog, so the link just follows. */
type Zoom = (image: Media, opener: HTMLElement) => boolean;

const ZoomContext = createContext<Zoom | null>(null);

/**
 * One native `<dialog>` for the whole page: the figures with a zoom link open it on their image.
 * Close is its button, Escape (both native) or a click on the backdrop; focus goes back to the
 * link that opened it, and the dialog lets go of the big image.
 *
 * Without script nothing here runs: a zoom link is an ordinary link to the large file.
 */
export function ZoomProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [image, setImage] = useState<Media | null>(null);

  const zoom = useMemo<Zoom>(
    () => (next, from) => {
      if (typeof dialog.current?.showModal !== 'function') return false;
      opener.current = from;
      setImage(next);
      return true;
    },
    [],
  );

  // Show the dialog once the image is in it, so it never opens empty.
  useEffect(() => {
    if (image && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [image]);

  return (
    <ZoomContext value={zoom}>
      {children}
      <dialog
        ref={dialog}
        aria-label="Enlarged image"
        onClose={() => {
          setImage(null);
          opener.current?.focus();
        }}
        onClick={(event) => {
          // The backdrop belongs to the dialog itself; its contents fill the box.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[92vh] max-w-[min(1400px,94vw)] overflow-auto rounded-image border-0 bg-bg p-0 text-ink shadow-dialog backdrop:bg-ink/72"
      >
        <form method="dialog" className="flex justify-end p-2">
          <button
            type="submit"
            className="cursor-pointer rounded-full border border-rule-strong px-3 py-1.5 font-mono text-small text-ink"
          >
            Close
          </button>
        </form>
        {image && (
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            // The original file, the one the link points to: no resized copy, and one download.
            unoptimized
            loading="eager"
            className="block h-auto max-h-[calc(92vh-3.25rem)] w-auto max-w-full"
          />
        )}
      </dialog>
    </ZoomContext>
  );
}

/**
 * The link around a figure's picture. It points at the large image; with the page's dialog
 * available it opens that instead, except for a modified click (new tab, new window), which
 * keeps its normal meaning.
 */
export function ZoomLink({ image, caption, children }: { image: Media; caption: string; children: ReactNode }) {
  const zoom = useContext(ZoomContext);
  return (
    <a
      href={image.src}
      aria-label={`Enlarge: ${caption}`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (zoom?.(image, event.currentTarget)) event.preventDefault();
      }}
      className="block cursor-zoom-in focus-visible:-outline-offset-3"
    >
      {children}
    </a>
  );
}
