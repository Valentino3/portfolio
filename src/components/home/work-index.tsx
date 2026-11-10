'use client';

import { useEffect, useReducer, useRef } from 'react';
import type { NumberedProject } from '@/content/types';
import { activeIndex, HOVER_INTENT_MS, INITIAL_VIEWER_STATE, viewerReducer } from '@/lib/viewer-state';
import { ProjectList } from './project-list';
import { ProjectViewer } from './project-viewer';

/**
 * The project list and the viewer that follows it. It returns a fragment so
 * both stay direct grid items of the hero's 12-column grid.
 *
 * Focus is applied at once, hover only after HOVER_INTENT_MS: a pointer that
 * crosses rows on its way to the viewer does not switch it. Leaving the list
 * cancels a pending hover and keeps the row that was shown.
 */
export function WorkIndex({ projects }: { projects: NumberedProject[] }) {
  const [state, dispatch] = useReducer(viewerReducer, INITIAL_VIEWER_STATE);
  const intent = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(intent.current), []);

  const active = activeIndex(state);
  return (
    <>
      <ProjectList
        projects={projects}
        activeIndex={active}
        onActivate={(index, via) => {
          if (via === 'focus') return dispatch({ type: 'focus', index });
          clearTimeout(intent.current);
          intent.current = setTimeout(() => dispatch({ type: 'hover', index }), HOVER_INTENT_MS);
        }}
        onListLeave={() => {
          clearTimeout(intent.current);
          dispatch({ type: 'leave' });
        }}
        onBlur={() => dispatch({ type: 'blur' })}
      />
      <ProjectViewer projects={projects} activeIndex={active} />
    </>
  );
}
