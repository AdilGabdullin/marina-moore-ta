import { Layer, Rect, Stage } from "react-konva";
import { COLORS, GAP, SQUARE_SIZE } from "./const";
import Squares from "./Squares";
import { useLayoutEffect, useState } from "react";

export default function App() {
  const size = useFullScreen();
  const width = SQUARE_SIZE * COLORS.length + GAP * (COLORS.length + 1);
  const height = SQUARE_SIZE + GAP * (COLORS.length - 2);
  const x = Math.round((size.width - width) / 2);
  const y = Math.round((size.height - height) / 2);

  return (
    <Stage {...size}>
      <Layer>
        <Rect x={x} y={y} width={width} height={height} stroke="#030303" strokeWidth={4} />
        <Squares x={x} y={y} maxX={size.width - SQUARE_SIZE} />
      </Layer>
    </Stage>
  );
}

const useFullScreen = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};
