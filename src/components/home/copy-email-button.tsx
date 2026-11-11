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
        className="cursor-pointer rounded-full border border-rule-strong px-3.5 py-2 font-mono text-small text-ink transition-colors hover:border-ink"
      >
        Copy email
      </button>
      <p
        role="status"
        className={`min-h-[1.5em] basis-full font-mono text-small ${
          status?.kind === 'done' ? 'text-ok' : status?.kind === 'fail' ? 'text-error' : 'text-text-2'
        }`}
      >
        {status && <span key={status.count}>{status.text}</span>}
      </p>
    </>
  );
}
