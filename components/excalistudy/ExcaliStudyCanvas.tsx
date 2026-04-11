"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppState } from "./AppStateContext";
import { FocusMode } from "./FocusMode";
import { PomodoroTimer } from "./PomodoroTimer";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import "@excalidraw/excalidraw/index.css";

// Excalidraw must be loaded client-only — it uses window/canvas APIs
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

export function ExcaliStudyCanvas() {
  const {
    isFocusMode,
    setFocusMode,
    isPomodoroVisible,
    setPomodoroVisible,
  } = useAppState();

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme with document
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      // Future: wire into project save/load
    },
    []
  );

  // Keyboard shortcut handlers — only study-specific
  const handleToggleFocusMode = useCallback(() => {
    setFocusMode(!isFocusMode);
  }, [isFocusMode, setFocusMode]);

  const handleTogglePomodoro = useCallback(() => {
    setPomodoroVisible(!isPomodoroVisible);
  }, [isPomodoroVisible, setPomodoroVisible]);

  // No-op for tool switching — Excalidraw handles its own tools
  const handleSetTool = useCallback(() => {}, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Excalidraw Canvas — full native UI */}
      <Excalidraw
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        theme={theme}
        UIOptions={{
          welcomeScreen: false,
        }}
        onChange={handleChange}
      />

      {/* Focus Mode Overlay */}
      <FocusMode isActive={isFocusMode} onExit={() => setFocusMode(false)} />

      {/* Pomodoro Timer Overlay */}
      <PomodoroTimer
        isVisible={isPomodoroVisible}
        onClose={() => setPomodoroVisible(false)}
      />

      {/* Keyboard Shortcuts — study-specific only */}
      <KeyboardShortcuts
        onToggleFocusMode={handleToggleFocusMode}
        onTogglePomodoro={handleTogglePomodoro}
        onSetTool={handleSetTool}
      />
    </div>
  );
}
