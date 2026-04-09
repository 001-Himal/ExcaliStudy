"use client";

import { useEffect, useState } from "react";

export function FocusMode({ isActive, onExit }: { isActive: boolean; onExit: () => void }) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (isActive) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, onExit]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Hand-drawn border frame */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top edge */}
        <path
          d="M 0,8 C 60,5 120,11 240,7 C 360,4 480,10 640,6 C 800,9 960,4 1120,8 C 1280,5 1440,10 1600,7 C 1760,4 1860,9 1920,6"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-foreground/10"
          strokeLinecap="round"
        />
        {/* Bottom edge */}
        <path
          d="M 0,1074 C 80,1077 160,1071 320,1075 C 480,1072 640,1078 800,1073 C 960,1076 1120,1072 1280,1076 C 1440,1073 1600,1077 1760,1074 C 1840,1071 1880,1076 1920,1073"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-foreground/10"
          strokeLinecap="round"
        />
        {/* Left edge */}
        <path
          d="M 8,0 C 5,60 11,120 7,240 C 4,360 10,480 6,640 C 9,800 4,960 8,1080"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-foreground/10"
          strokeLinecap="round"
        />
        {/* Right edge */}
        <path
          d="M 1912,0 C 1915,80 1909,160 1913,320 C 1916,480 1910,640 1914,800 C 1911,960 1915,1040 1912,1080"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-foreground/10"
          strokeLinecap="round"
        />
        {/* Corner accents - sketchy dots */}
        <circle cx="10" cy="10" r="3" className="fill-foreground/8" />
        <circle cx="1910" cy="10" r="3" className="fill-foreground/8" />
        <circle cx="10" cy="1070" r="3" className="fill-foreground/8" />
        <circle cx="1910" cy="1070" r="3" className="fill-foreground/8" />
      </svg>

      {/* Exit hint */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ${
          showHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-full px-5 py-2.5 flex items-center gap-3 pointer-events-auto">
          <span className="text-[13px] text-muted-foreground font-sans tracking-wide">
            Press
          </span>
          <kbd className="text-[12px] font-mono bg-background/80 border border-border rounded-[4px] px-2 py-0.5 text-foreground/70 shadow-sm">
            Esc
          </kbd>
          <span className="text-[13px] text-muted-foreground font-sans tracking-wide">
            to exit focus mode
          </span>
        </div>
      </div>
    </div>
  );
}
