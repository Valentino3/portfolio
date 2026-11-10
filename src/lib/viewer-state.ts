/**
 * Which project the home viewer shows. One source of truth with a fixed
 * priority: the row under the pointer, else the focused row, else the last one
 * that was shown. The state is pure so the priority is tested without a DOM.
 */
export type ViewerState = {
  hovered: number | null;
  focused: number | null;
  /** The row shown last. It is what the viewer keeps showing when nothing is hovered or focused. */
  selected: number;
};

export type ViewerAction =
  | { type: 'hover'; index: number }
  | { type: 'leave' }
  | { type: 'focus'; index: number }
  | { type: 'blur' };

export const INITIAL_VIEWER_STATE: ViewerState = { hovered: null, focused: null, selected: 0 };

/** The pointer has to rest on a row this long before the viewer follows it, so crossing rows on the way to the viewer does not flicker. */
export const HOVER_INTENT_MS = 110;
/** The caption fades out, this long later its text changes and it fades back in. 0 with reduced motion. */
export const CAPTION_SWAP_MS = 150;

/** Mirror of the `viewer` variant in globals.css: a wide screen with a fine pointer that can hover. */
export const VIEWER_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

/** Hovered beats focused beats selected. Row 0 is a row, not "nothing", hence `??` and not `||`. */
export function activeIndex(s: ViewerState): number {
  return s.hovered ?? s.focused ?? s.selected;
}

export function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
  const next: ViewerState = { ...state };
  if (action.type === 'hover') next.hovered = action.index;
  else if (action.type === 'leave') next.hovered = null;
  else if (action.type === 'focus') next.focused = action.index;
  else next.focused = null;
  next.selected = activeIndex(next);
  // Same state back means no re-render (a blur with nothing focused, a repeated hover).
  return next.hovered === state.hovered && next.focused === state.focused && next.selected === state.selected
    ? state
    : next;
}
