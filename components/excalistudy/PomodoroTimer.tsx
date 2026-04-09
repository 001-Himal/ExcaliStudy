"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, X, Coffee, Minus } from "lucide-react";

type TimerMode = "work" | "break" | "longBreak";

const MODE_CONFIG: Record<TimerMode, { label: string; minutes: number; color: string }> = {
  work: { label: "Focus", minutes: 25, color: "#6965db" },
  break: { label: "Break", minutes: 5, color: "#0F9D58" },
  longBreak: { label: "Long Break", minutes: 15, color: "#4285F4" },
};

// Generate a rough circle path with subtle wobble
function sketchyCirclePath(cx: number, cy: number, r: number, seed: number = 42): string {
  const points: string[] = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobble = Math.sin(angle * 7 + seed) * 1.2 + Math.cos(angle * 11 + seed * 2) * 0.8;
    const rx = r + wobble;
    const ry = r + wobble * 0.7;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
  }
  return points.join(" ") + " Z";
}

export function PomodoroTimer({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.work.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const config = MODE_CONFIG[mode];
  const totalTime = config.minutes * 60;
  const progress = 1 - timeLeft / totalTime;

  // Timer tick
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [isActive, timeLeft]);

  // Timer complete
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playChime();

      if (mode === "work") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        if (newSessions % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("break");
        }
      } else {
        switchMode("work");
      }
    }
  }, [timeLeft, isActive, mode, sessions]);

  const playChime = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      /* audio may not be available */
    }
  }, []);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].minutes * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  if (!isVisible) return null;

  // Minimized pip
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[90] pointer-events-auto">
        <button
          onClick={() => setIsMinimized(false)}
          className="group relative w-12 h-12 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl"
        >
          <svg width="36" height="36" viewBox="0 0 36 36">
            <path
              d={sketchyCirclePath(18, 18, 14, 42)}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
              opacity="0.2"
            />
            <path
              d={sketchyCirclePath(18, 18, 14, 42)}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
              strokeDasharray={`${progress * 88} ${88}`}
              className="transition-all duration-1000"
            />
          </svg>
          {isActive && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: config.color }} />
          )}
        </button>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="fixed bottom-6 right-6 z-[90] pointer-events-auto">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl w-[220px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Pomodoro
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setIsMinimized(true)} className="p-1 rounded hover:bg-muted transition-colors">
              <Minus className="w-3 h-3 text-muted-foreground" />
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Circle Timer */}
        <div className="flex flex-col items-center py-5 px-4">
          <div className="relative w-[120px] h-[120px]">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Background circle (sketchy) */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/50"
                strokeDasharray="4 4"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={config.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                className="transition-all duration-1000 ease-linear"
                style={{ filter: "url(#sketchy)" }}
              />
            </svg>
            {/* Filter for sketchy look */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <filter id="sketchy">
                  <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
              </defs>
            </svg>

            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-caveat text-3xl font-bold text-foreground leading-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mt-1">
                {config.label}
              </span>
            </div>
          </div>

          {/* Session dots */}
          <div className="flex gap-1.5 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < sessions % 4 ? "bg-[#6965db]" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 px-4 pb-4">
          <button
            onClick={reset}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-3 rounded-full transition-all text-white shadow-md hover:shadow-lg active:scale-95"
            style={{ backgroundColor: config.color }}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => switchMode(mode === "work" ? "break" : "work")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title={mode === "work" ? "Take a break" : "Back to work"}
          >
            <Coffee className="w-4 h-4" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex border-t border-border/50">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                mode === m
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
