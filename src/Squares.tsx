import { useRef } from "react";
import { Rect } from "react-konva";
import Konva from "konva";
import { COLORS, GAP, SQUARE_SIZE } from "./const";
import clamp from "lodash.clamp";

export default function Squares({ x, y, stageWidth }: { x: number; y: number; stageWidth: number }) {
  const refs = COLORS.map((_) => useRef<Konva.Rect>(null));
  const animatingTo = useRef<Record<string, number | null>>({});

  const xs = COLORS.map((_, i) => x + GAP * (i + 1) + SQUARE_SIZE * i);

  const animate = (node: Konva.Rect, to: number) => {
    const id = node.id();
    const curr = animatingTo.current;
    if (curr[id] != to) {
      curr[id] = to;
      const duration = Math.abs(node.x() - to) / 600;
      const onFinish = () => (curr[id] = null);
      new Konva.Tween({ node, x: to, duration, onFinish }).play();
    }
  };

  const sortedSquares = (ignoredId?: string) =>
    refs
      .map((ref) => ref.current)
      .filter((square) => square != null)
      .filter((square) => square.id() != ignoredId)
      .sort((s1, s2) => s1.x() - s2.x());

  const dragBoundFunc = (pos: { x: number; y: number }) => ({
    x: clamp(pos.x, 0, stageWidth - SQUARE_SIZE),
    y: y + GAP,
  });

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const targetPlace = closestNumber(target.x(), xs);
    const otherPlaces = xs.filter((x) => x != targetPlace);
    const otherSquares = sortedSquares(target.id());
    otherSquares.forEach((square, i) => {
      animate(square, otherPlaces[i]);
    });
  };

  const handleDragEnd = () => {
    sortedSquares().forEach((square, i) => {
      animate(square, xs[i]);
    });
  };

  return (
    <>
      {COLORS.map((color, i) => (
        <Rect
          key={color}
          id={color}
          ref={refs[i]}
          x={xs[i]}
          y={y + GAP}
          fill={color}
          width={SQUARE_SIZE}
          height={SQUARE_SIZE}
          draggable={true}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          dragBoundFunc={dragBoundFunc}
        />
      ))}
    </>
  );
}

function closestNumber(n: number, values: number[]) {
  const d = (x: number) => Math.abs(x - n);
  return values.reduce((a, b) => (d(b) < d(a) ? b : a), values[0]);
}
