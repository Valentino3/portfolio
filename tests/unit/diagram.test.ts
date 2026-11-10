import { expect, test } from 'vitest';
import { BOX_H, CHAR, MIN_GAP, PADX, ROW_GAP, layoutDiagram, type DiagramNode } from '@/lib/diagram';

const rows: DiagramNode[][] = [
  [
    { l1: 'Counter app', l2: 'local catalogue' },
    { l1: 'Offline queue', l2: 'sales + keys', edge: 'replay' },
    { l1: 'Server', l2: 'permissions, one tx', dark: true },
  ],
];

test('every label fits its box with padding', () => {
  for (const b of layoutDiagram(rows).boxes)
    expect(Math.max(b.node.l1.length, b.node.l2?.length ?? 0) * CHAR + 2 * PADX).toBeLessThanOrEqual(b.w);
});

test('edge labels get a wide enough gap and never sit under a box', () => {
  const l = layoutDiagram(rows);
  const a = l.arrows.find((x) => x.label === 'replay')!;
  expect(a.x2 - a.x1).toBeGreaterThanOrEqual('replay'.length * CHAR + 18);
});

test('boxes run left to right, each arrow spanning the gap between two of them', () => {
  const { boxes, arrows } = layoutDiagram(rows);
  expect(arrows).toHaveLength(2);
  arrows.forEach((a, i) => {
    expect(a.x1).toBe(boxes[i].x + boxes[i].w);
    expect(a.x2).toBe(boxes[i + 1].x);
    expect(a.y).toBe(boxes[i].y + BOX_H / 2);
  });
  // An unlabelled edge keeps the minimum gap; the label and dash belong to the edge leaving a node.
  expect(arrows[0].x2 - arrows[0].x1).toBe(MIN_GAP);
  expect(arrows[0].label).toBeUndefined();
  expect(arrows[1].label).toBe('replay');
});

test('a dashed node draws a dashed edge to the next one', () => {
  const { arrows } = layoutDiagram([[{ l1: 'Spotify embed', edge: 'still failing', dashed: true }, { l1: 'YouTube' }]]);
  expect(arrows[0]).toMatchObject({ label: 'still failing', dashed: true });
});

test('rows stack with a fixed gap, the note sits under them, and the canvas fits everything', () => {
  // The Stock Tienda diagram of the prototype: two rows and a note.
  const st = layoutDiagram(
    [
      [
        { l1: 'Counter app', l2: 'local catalogue' },
        { l1: 'Offline queue', l2: 'sales + keys', edge: 'replay' },
        { l1: 'Server', l2: 'permissions, one tx', dark: true },
        { l1: 'PostgreSQL', l2: 'Neon' },
      ],
      [{ l1: 'Server' }, { l1: 'ARCA', l2: 'invoice authorized' }],
    ],
    'A replayed sale with the same key is never counted twice.',
  );
  const [first, , , last] = st.boxes;
  const secondRow = st.boxes[4];
  expect(secondRow.y - first.y).toBe(BOX_H + ROW_GAP);
  expect(secondRow.x).toBe(first.x);
  // The prototype's geometry: 208 high with the note at y 194 (its widths differ by rounding only).
  expect(st.height).toBe(208);
  expect(st.note).toEqual({ y: 194, text: 'A replayed sale with the same key is never counted twice.' });
  expect(st.width).toBeGreaterThanOrEqual(last.x + last.w + 1);
  expect(st.width).toBeLessThanOrEqual(last.x + last.w + 2);
});

test('without a note the canvas ends under the last row', () => {
  const l = layoutDiagram(rows);
  expect(l.note).toBeUndefined();
  expect(l.height).toBe(l.boxes[0].y * 2 + BOX_H);
});
