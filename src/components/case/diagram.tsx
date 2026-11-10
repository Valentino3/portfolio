import type { CSSProperties } from 'react';
import {
  BOX_RADIUS,
  EDGE,
  FONT_SIZE,
  PADX,
  layoutDiagram,
  type Arrow,
  type Box,
  type DiagramNode,
} from '@/lib/diagram';
import { DiagramFrame } from './diagram-frame';

/** Below 640px the drawing keeps this minimum width (or its own, if narrower) and scrolls. */
const MIN_WIDTH = 640;
/** Label baselines, from a box's vertical middle: two lines, or one centered. */
const BASELINE = { first: -4, second: 14, single: 4 };
/** Arrowhead length and width; its tip stops 1 unit short of the next box. */
const HEAD = 10;
const LABEL_RISE = 8;

function DiagramBox({ box: { x, y, w, h, node } }: { box: Box }) {
  const middle = y + h / 2;
  const tx = x + PADX;
  const first = node.dark ? 'fill-paper' : 'fill-ink';
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={BOX_RADIUS}
        className={node.dark ? 'fill-ink stroke-ink' : 'fill-paper stroke-rule-strong'}
      />
      {node.l2 ? (
        <>
          <text x={tx} y={middle + BASELINE.first} className={first}>
            {node.l1}
          </text>
          <text x={tx} y={middle + BASELINE.second} className={node.dark ? 'fill-paper-dim' : 'fill-text-2'}>
            {node.l2}
          </text>
        </>
      ) : (
        <text x={tx} y={middle + BASELINE.single} className={first}>
          {node.l1}
        </text>
      )}
    </>
  );
}

function DiagramArrow({ arrow: { x1, x2, y, label, dashed } }: { arrow: Arrow }) {
  const tip = x2 - 1;
  return (
    <>
      <path
        d={`M${x1} ${y}H${tip - HEAD / 2}`}
        fill="none"
        strokeWidth={1.25}
        strokeDasharray={dashed ? '4 4' : undefined}
        className="stroke-ink"
      />
      <path d={`M${tip - HEAD} ${y - HEAD / 2}L${tip} ${y}L${tip - HEAD} ${y + HEAD / 2}z`} className="fill-ink" />
      {label && (
        <text x={(x1 + x2) / 2} y={y - LABEL_RISE} textAnchor="middle" className="fill-text-2">
          {label}
        </text>
      )}
    </>
  );
}

/**
 * A box-and-arrow diagram drawn from data: each box is as wide as its longest label, so no
 * label spills out. The SVG is hidden from assistive tech; `label` describes the whole diagram.
 */
export function Diagram({ label, rows, note }: { label: string; rows: DiagramNode[][]; note?: string }) {
  const layout = layoutDiagram(rows, note);
  const style = { maxWidth: layout.width, '--min': `${Math.min(layout.width, MIN_WIDTH)}px` } as CSSProperties;
  return (
    <DiagramFrame label={label}>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        aria-hidden="true"
        fontSize={FONT_SIZE}
        style={style}
        className="block h-auto w-full font-mono max-sm:min-w-(--min)"
      >
        {layout.boxes.map((box, i) => (
          <DiagramBox key={`box-${i}`} box={box} />
        ))}
        {layout.arrows.map((arrow, i) => (
          <DiagramArrow key={`arrow-${i}`} arrow={arrow} />
        ))}
        {layout.note && (
          <text x={EDGE} y={layout.note.y} className="fill-text-2">
            {layout.note.text}
          </text>
        )}
      </svg>
    </DiagramFrame>
  );
}
