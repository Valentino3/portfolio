'use client';

import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { ProjectSummary } from '@/content/types';
import { createSpring, type Spring } from '@/lib/spring';
import { activeIndex, HOVER_INTENT_MS, INITIAL_VIEWER_STATE, viewerReducer } from '@/lib/viewer-state';
import { ProjectList } from './project-list';
import { ProjectViewer } from './project-viewer';

/** The bar is 2px wide, so it may overshoot a little: about 5% of the distance it travels. */
const BAR_SPRING = { response: 0.3, damping: 0.7 };

/** Where the bar goes for a row: the row's box without its padding, relative to the list wrapper. */
function barFor(list: HTMLOListElement, index: number): [y: number, height: number] {
  const row = list.children[index] as HTMLElement;
  const style = getComputedStyle(row);
  const top = parseFloat(style.paddingTop);
  return [row.offsetTop + top, row.offsetHeight - top - parseFloat(style.paddingBottom)];
}

/**
 * The project list and the viewer that follows it. It returns a fragment so both stay direct
 * grid items of the hero's 12-column grid.
 *
 * Two things follow the pointer at different speeds. The active row (its arrow, and the one bar
 * shared by all rows) follows at once: the bar is on a spring that is retargeted mid-flight, so
 * a sweep down the list reads as one movement. The viewer waits HOVER_INTENT_MS for the pointer
 * to rest, so a sweep does not flash through every image. Keyboard focus moves both at once.
 */
export function WorkIndex({ projects }: { projects: ProjectSummary[] }) {
  const [state, dispatch] = useReducer(viewerReducer, INITIAL_VIEWER_STATE);
  const active = activeIndex(state);
  // What the viewer shows: the active row, once the pointer has rested on it.
  const [shown, setShown] = useState(active);
  const fromKeyboard = useRef(false);
  useEffect(() => {
    if (shown === active) return;
    const timer = setTimeout(() => setShown(active), fromKeyboard.current ? 0 : HOVER_INTENT_MS);
    return () => clearTimeout(timer);
  }, [active, shown]);

  const list = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const spring = useRef<Spring>(null);
  const activeNow = useRef(active);
  const [barReady, setBarReady] = useState(false);

  // Place the shared bar before the first paint with script, then keep it on the active row
  // when the list reflows (a resize, a font that arrives). Neither of those is animated.
  useLayoutEffect(() => {
    const rows = list.current;
    const element = bar.current;
    if (!rows || !element) return;
    const bound = createSpring(barFor(rows, activeNow.current), BAR_SPRING, ([y, height]) => {
      element.style.transform = `translateY(${y}px) scaleY(${Math.max(0, height)})`;
    });
    bound.jump(barFor(rows, activeNow.current));
    spring.current = bound;
    setBarReady(true);
    const observer = new ResizeObserver(() => bound.jump(barFor(rows, activeNow.current)));
    observer.observe(rows);
    return () => {
      observer.disconnect();
      bound.stop();
    };
  }, []);

  useEffect(() => {
    activeNow.current = active;
    if (list.current) spring.current?.to(barFor(list.current, active));
  }, [active]);

  return (
    <>
      <ProjectList
        projects={projects}
        activeIndex={active}
        listRef={list}
        indicatorRef={bar}
        indicatorReady={barReady}
        onActivate={(index, via) => {
          fromKeyboard.current = via === 'focus';
          dispatch({ type: via, index });
        }}
        onListLeave={() => {
          fromKeyboard.current = false;
          dispatch({ type: 'leave' });
        }}
        onBlur={() => {
          fromKeyboard.current = true;
          dispatch({ type: 'blur' });
        }}
      />
      <ProjectViewer projects={projects} activeIndex={shown} />
    </>
  );
}
