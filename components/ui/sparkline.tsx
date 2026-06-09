"use client";

import { useMemo } from "react";

// ─── Deterministic seeded PRNG (mulberry32) ───────────────────────────────
// Produces identical output on server AND client for the same seed.
// This eliminates the SSR/client Math.random() hydration mismatch.
function createRng(seed: number) {
  let s = seed;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// ─────────────────────────────────────────────────────────────────────────

interface SparklineProps {
  points?: number;
  trend?: "up" | "down" | "flat";
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  points = 12,
  trend = "up",
  color = "#34d399",
  width = 80,
  height = 32
}: SparklineProps) {
  // Seed derived purely from props — identical on server and client
  const data = useMemo(() => {
    const rng = createRng(strToSeed(trend + color + String(points)));
    const arr: number[] = [];
    let val = trend === "up" ? 20 : trend === "down" ? 80 : 50;
    for (let i = 0; i < points; i++) {
      const noise = (rng() - 0.5) * 20;
      const drift = trend === "up" ? 5 : trend === "down" ? -5 : 0;
      val = Math.max(5, Math.min(95, val + noise + drift * (i / points)));
      arr.push(val);
    }
    return arr;
  }, [points, trend, color]);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const coords = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = coords.join(" ");
  const fill = [`${pad},${pad + h}`, ...coords, `${pad + w},${pad + h}`].join(" ");
  const gradId = `spark-${color.replace("#", "")}-${trend}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
