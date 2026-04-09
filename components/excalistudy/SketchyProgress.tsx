"use client";

import { useMemo } from "react";

// Generate a wobbly line path with subtle hand-drawn feel
function wobbleLine(
  x1: number, y1: number, x2: number, y2: number, 
  amplitude: number = 1.5, seed: number = 0
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const segments = Math.max(8, Math.floor(len / 6));
  const points: string[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const nx = -dy / len; // normal x
    const ny = dx / len;  // normal y
    const wobble = Math.sin(t * Math.PI * 3 + seed) * amplitude * (1 - Math.abs(t - 0.5) * 0.5);
    const x = x1 + dx * t + nx * wobble;
    const y = y1 + dy * t + ny * wobble;
    points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
  }
  
  return points.join(" ");
}

// Generate a rough rounded rect path
function roughRect(
  x: number, y: number, w: number, h: number, 
  r: number = 4, seed: number = 0
): string {
  const amp = 0.8;
  // Simplified rough rect — just 4 wobbly lines
  const top = wobbleLine(x + r, y, x + w - r, y, amp, seed);
  const right = wobbleLine(x + w, y + r, x + w, y + h - r, amp, seed + 1);
  const bottom = wobbleLine(x + w - r, y + h, x + r, y + h, amp, seed + 2);
  const left = wobbleLine(x, y + h - r, x, y + r, amp, seed + 3);
  
  return `${top} ${right} ${bottom} ${left}`;
}

interface SketchyProgressBarProps {
  value: number;       // 0-100
  color?: string;      // fill color
  bgColor?: string;    // track color
  height?: number;
  width?: number;
  className?: string;
}

export function SketchyProgressBar({
  value,
  color = "#6965db",
  bgColor,
  height = 6,
  width = 100,
  className = "",
}: SketchyProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const fillWidth = (clampedValue / 100) * (width - 4);
  
  const seed = useMemo(() => Math.random() * 100, []);

  return (
    <svg
      width={width}
      height={height + 4}
      viewBox={`0 0 ${width} ${height + 4}`}
      className={`block ${className}`}
    >
      {/* Track */}
      <path
        d={wobbleLine(2, height / 2 + 2, width - 2, height / 2 + 2, 0.6, seed)}
        stroke={bgColor || "currentColor"}
        strokeWidth={height}
        strokeLinecap="round"
        fill="none"
        className={bgColor ? "" : "text-muted/40"}
        opacity={0.3}
      />
      {/* Fill */}
      {clampedValue > 0 && (
        <path
          d={wobbleLine(2, height / 2 + 2, 2 + fillWidth, height / 2 + 2, 0.8, seed + 10)}
          stroke={color}
          strokeWidth={height - 1}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

interface SketchyProgressCircleProps {
  value: number;       // 0-100
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function SketchyProgressCircle({
  value,
  size = 32,
  color = "#6965db",
  strokeWidth = 3,
  className = "",
  children,
}: SketchyProgressCircleProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampedValue / 100);
  const center = size / 2;

  // Sketchy circle with slight wobble
  const seed = useMemo(() => Math.random() * 100, []);
  const segments = 48;
  
  const sketchyPath = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
      const wobble = Math.sin(angle * 5 + seed) * 0.5 + Math.cos(angle * 8 + seed * 2) * 0.3;
      const r = radius + wobble;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
    }
    return points.join(" ") + " Z";
  }, [radius, center, seed, segments]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle (sketchy) */}
        <path
          d={sketchyPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth - 0.5}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 -rotate-90 origin-center"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
