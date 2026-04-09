"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface KeyboardShortcutsProps {
  onToggleFocusMode: () => void;
  onTogglePomodoro: () => void;
  onSetTool: (tool: string) => void;
}

export function KeyboardShortcuts({
  onToggleFocusMode,
  onTogglePomodoro,
  onSetTool,
}: KeyboardShortcutsProps) {
  const { toggleSidebar } = useSidebar();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[contenteditable]")
      ) {
        return;
      }

      // Ctrl/Cmd + Shift combos
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "f":
            e.preventDefault();
            onToggleFocusMode();
            return;
          case "p":
            e.preventDefault();
            onTogglePomodoro();
            return;
          case "s":
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("app-request-save-as"));
            return;
        }
      }

      // Ctrl/Cmd combos (no shift)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            toggleSidebar();
            return;
          case "s":
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("app-request-quick-save"));
            return;
          case "`":
            e.preventDefault();
            setShowHelp((prev) => !prev);
            return;
        }
      }

      // Single-key shortcuts (tool switching) — only when no modifier
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        switch (e.key) {
          case "1":
          case "v":
          case "V":
            onSetTool("select");
            return;
          case "2":
          case "t":
          case "T":
            onSetTool("text");
            return;
          case "3":
          case "n":
          case "N":
            onSetTool("sticky");
            return;
          case "4":
          case "e":
          case "E":
            onSetTool("eraser");
            return;
          case "?":
            setShowHelp((prev) => !prev);
            return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggleFocusMode, onTogglePomodoro, onSetTool, toggleSidebar]);

  if (!showHelp) return null;

  return <ShortcutsHelpDialog onClose={() => setShowHelp(false)} />;
}

// --- Help Dialog ---

const SHORTCUTS = [
  { category: "Canvas Tools", items: [
    { keys: ["V", "1"], action: "Selection tool" },
    { keys: ["T", "2"], action: "Text tool" },
    { keys: ["N", "3"], action: "Sticky note tool" },
    { keys: ["E", "4"], action: "Eraser tool" },
  ]},
  { category: "Navigation", items: [
    { keys: ["Ctrl", "B"], action: "Toggle sidebar" },
    { keys: ["Ctrl", "Shift", "F"], action: "Toggle focus mode" },
  ]},
  { category: "Productivity", items: [
    { keys: ["Ctrl", "Shift", "P"], action: "Toggle Pomodoro timer" },
    { keys: ["Ctrl", "S"], action: "Quick save project" },
    { keys: ["Ctrl", "Shift", "S"], action: "Save as new project" },
  ]},
  { category: "Help", items: [
    { keys: ["?"], action: "Show keyboard shortcuts" },
    { keys: ["Esc"], action: "Exit focus mode / Close dialogs" },
  ]},
];

function ShortcutsHelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-background max-w-lg w-full rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Keyboard Shortcuts</h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
              Quick Reference
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-[13px] text-foreground">{item.action}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, j) => (
                        <span key={j}>
                          {j > 0 && <span className="text-muted-foreground text-[10px] mx-0.5">+</span>}
                          <kbd className="inline-block min-w-[24px] text-center text-[11px] font-mono bg-muted border border-border rounded-[4px] px-1.5 py-0.5 text-foreground/70 shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-muted/20 border-t text-center">
          <span className="text-[11px] text-muted-foreground">
            Press <kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1 py-0.5">?</kbd> anywhere to toggle this dialog
          </span>
        </div>
      </div>
    </div>
  );
}
