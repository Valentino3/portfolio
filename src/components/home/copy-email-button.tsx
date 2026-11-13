'use client';

import { useEffect, useRef, useState } from 'react';

const CLEAR_AFTER_MS = 6000;
const COPIED = 'Copied to the clipboard.';
const FAILED_TOUCH = 'Couldn’t copy. Press and hold the address above to copy it.';
const FAILED_KEYBOARD = 'Couldn’t copy. The address is selected: press Ctrl+C or ⌘C.';

type Status = { kind: 'done' | 'fail'; text: string };

/** Selects the address text in the contact block, so the visitor can copy it by hand. */
function selectAddress() {
  const target = document.querySelector('[data-mail-text]');
  if (!target) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * "Copy email" button and its status line. The label never changes: the
 * outcome goes to a visible `role="status"` line that clears after 6 seconds.
 * The button gives under the press and springs back; the confirmation rises
 * into place and its check mark pops (both once, neither with reduced motion).
 * If the Clipboard API is missing or refuses, the address is selected instead
 * and the message depends on the pointer: touch has no Ctrl+C.
 *
 * It renders a fragment: the button is an item of the contact row (a wrapping
 * flex box) and the status line takes the full width under it.
 *
 * Each outcome is a new text node, keyed by a count: a live region speaks what is
 * added to it, and the same text set again would add nothing, so a second click
 * with the same outcome would go unannounced.
 */
export function CopyEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<(Status & { count: number }) | null>(null);
  const shown = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (next: Status) => {
    clearTimeout(timer.current);
    shown.current += 1;
    setStatus({ ...next, count: shown.current });
    timer.current = setTimeout(() => setStatus(null), CLEAR_AFTER_MS);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard API');
      await navigator.clipboard.writeText(email);
      show({ kind: 'done', text: COPIED });
    } catch {
      selectAddress();
      show({ kind: 'fail', text: window.matchMedia('(pointer: coarse)').matches ? FAILED_TOUCH : FAILED_KEYBOARD });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="cursor-pointer rounded-full border border-rule-strong px-3.5 py-2 text-ui-sm text-ink transition-[border-color,scale] duration-pop ease-spring-pop hover:border-ink active:scale-95"
      >
        Copy email
      </button>
      <p
        role="status"
        className={`min-h-[1.55em] basis-full text-small ${status?.kind === 'fail' ? 'text-error' : 'text-ok'}`}
      >
        {status && (
          // Keyed by the count: a new text node is announced again and replays the entrance.
          <span key={status.count} className="inline-flex animate-confirm items-baseline gap-1.5">
            {status.kind === 'done' && (
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 shrink-0 translate-y-px animate-check"
              >
                <path d="M2 6.5 4.75 9.25 10 3.25" />
              </svg>
            )}
            {status.text}
          </span>
        )}
      </p>
    </>
  );
}
