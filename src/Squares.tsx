import { useRef } from "react";
import { Rect } from "react-konva";
import Konva from "konva";
import { COLORS, GAP, SQUARE_SIZE } from "./const";
import clamp from "lodash.clamp";

export default function Squares({ x, y, maxX }: { x: number; y: number; maxX: number }) {
  const refs: React.RefObject<Konva.Rect>[] = COLORS.map(() => useRef(null)); // eslint-disable-line
  const destinations = useRef<Record<string, number | null>>({});

  const xs = COLORS.map((_, i) => x + GAP * (i + 1) + SQUARE_SIZE * i);

  const animate = (square: Konva.Rect, destination: number) => {
    const id = square.id();
    const curr = destinations.current;
    if (curr[id] != destination) {
      curr[id] = destination;
      new Konva.Tween({
        node: square,
        x: destination,
        duration: Math.abs(square.x() - destination) / 600,
        onFinish: () => (curr[id] = null),
      }).play();
    }
  };

  const squares = (ignoredId?: string) =>
    refs
      .map((ref) => ref.current)
      .filter((square) => square != null)
      .filter((square) => square.id() != ignoredId)
      .sort((s1, s2) => s1.x() - s2.x());

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const targetDestination = closestNumber(target.x(), xs);
    const otherDestinations = xs.filter((x) => x != targetDestination);
    squares(target.id()).forEach((square, i) => {
      animate(square, otherDestinations[i]);
    });
  };

  const handleDragEnd = () => {
    squares().forEach((square, i) => {
      animate(square, xs[i]);
    });
  };

  const dragBoundFunc = (pos: { x: number; y: number }) => ({
    x: clamp(pos.x, 0, maxX),
    y: y + GAP,
  });

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
