interface LineSeriesDotProps {
  cx?: number;
  cy?: number;
  r?: number;
  stroke?: string;
}

export function LineSeriesDot({ cx, cy, r = 3, stroke = "#FFFFFF" }: LineSeriesDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return <circle cx={cx} cy={cy} r={r} stroke={stroke} fill="#000000" />;
}
