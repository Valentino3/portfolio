/**
 * Box-and-arrow diagram layout, the same algorithm as `flow()` and `diagram()` in the
 * prototype's generator. Every number is in SVG user units: the SVG scales as a whole, so the
 * labels are 12 units of Geist Mono whatever size the diagram is shown at.
 */

/** A box. `edge` and `dashed` describe the arrow that leaves it towards the next box in the row. */
export type DiagramNode = { l1: string; l2?: string; dark?: boolean; edge?: string; dashed?: boolean };
export type Box = { x: number; y: number; w: number; h: number; node: DiagramNode };
/** An arrow spans the gap between two boxes, from the right edge of one to the left edge of the next. */
export type Arrow = { x1: number; x2: number; y: number; label?: string; dashed?: boolean };
export type DiagramLayout = {
  width: number;
  height: number;
  boxes: Box[];
  arrows: Arrow[];
  note?: { y: number; text: string };
};

/**
 * Advance of one character at FONT_SIZE, with margin: Geist Mono is 7.2, Consolas 6.6 and
 * DejaVu Sans Mono 7.22, so a label also fits its box when the web font has not loaded.
 */
export const CHAR = 7.4,
  PADX = 16,
  BOX_H = 64,
  ROW_GAP = 34,
  MIN_GAP = 34;

export const FONT_SIZE = 12;
/** Corner radius of a box: the radius-base token (8), in user units. */
export const BOX_RADIUS = 8;

/** Margin around the drawing, so the outer strokes are not clipped. Rows and the note start here. */
export const EDGE = 1;
const TOP = 12;
/** Room around an edge label: it sits centered over its arrow, clear of both boxes. */
const LABEL_PAD = 20;
const NOTE_OFFSET = 8;
const NOTE_H = 22;

const chars = (text = '') => text.length;

/** Wide enough for the longer label plus the side padding. Rounded up, so it never shrinks. */
function boxWidth(node: DiagramNode): number {
  return Math.ceil(Math.max(chars(node.l1), chars(node.l2)) * CHAR + 2 * PADX);
}

function gapAfter(node: DiagramNode): number {
  return node.edge ? Math.max(MIN_GAP, Math.ceil(chars(node.edge) * CHAR + LABEL_PAD)) : MIN_GAP;
}

/** Lays each row out left to right and stacks the rows; the optional note goes under them. */
export function layoutDiagram(rows: DiagramNode[][], note?: string): DiagramLayout {
  const boxes: Box[] = [];
  const arrows: Arrow[] = [];
  let right = 0;
  let y = TOP;

  for (const row of rows) {
    let x = EDGE;
    row.forEach((node, i) => {
      const w = boxWidth(node);
      boxes.push({ x, y, w, h: BOX_H, node });
      x += w;
      if (i === row.length - 1) return;
      const gap = gapAfter(node);
      arrows.push({ x1: x, x2: x + gap, y: y + BOX_H / 2, label: node.edge, dashed: node.dashed });
      x += gap;
    });
    right = Math.max(right, x);
    y += BOX_H + ROW_GAP;
  }

  const height = y - ROW_GAP + TOP;
  const width = right + 2 * EDGE;
  if (!note) return { width, height, boxes, arrows };
  return { width, height: height + NOTE_H, boxes, arrows, note: { y: height + NOTE_OFFSET, text: note } };
}
