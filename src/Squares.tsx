import { useRef } from "react";
import { Rect } from "react-konva";
import Konva from "konva";
import { COLORS, GAP, SQUARE_SIZE } from "./const";
import clamp from "lodash.clamp";

export default function Squares({ x, y, maxX }: { x: number; y: number; maxX: number }) {
  const nodes = COLORS.map(() => useRef<Konva.Rect>(null)); // eslint-disable-line
  const destinations = useRef<Record<string, number | null>>({});
  const positions = COLORS.map((_, i) => x + (GAP + SQUARE_SIZE) * i);

  const animate = (square: Konva.Rect, destination: number) => {
    const id = square.id();
    const curr = destinations.current;
    if (curr[id] != destination) {
      curr[id] = destination;
      new Konva.Tween({
        node: square,
        x: destination,
        duration: Math.abs(square.x() - destination) / 600,
      }).play();
    }
  };

  const squares = (targetId?: string) =>
    nodes
      .map((ref) => ref.current)
      .filter((square) => square != null)
      .filter((square) => square.id() != targetId)
      .sort((s1, s2) => s1.x() - s2.x());

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const id = target.id();
    destinations.current[id] = null;
    squares(target.id()).forEach((square, i) => square.zIndex(i + 1));
    target.zIndex(COLORS.length);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const targetDestination = closestNumber(target.x(), positions);
    const otherDestinations = positions.filter((x) => x != targetDestination);
    squares(target.id()).forEach((square, i) => {
      animate(square, otherDestinations[i]);
    });
  };

  const handleDragEnd = () => {
    squares().forEach((square, i) => {
      animate(square, positions[i]);
    });
  };

  return (
    <>
      {COLORS.map((color, i) => (
        <Rect
          key={color}
          id={color}
          ref={nodes[i]}
          x={positions[i]}
          y={y}
          fill={color}
          width={SQUARE_SIZE}
          height={SQUARE_SIZE}
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          dragBoundFunc={({ x }) => ({ x: clamp(x, 0, maxX), y })}
        />
      ))}
    </>
  );
}

function closestNumber(n: number, values: number[]) {
  const dist = (x: number) => Math.abs(x - n);
  return values.reduce((a, b) => (dist(b) < dist(a) ? b : a), values[0]);
}
