"use client";

import React, { useState } from "react";
import { useAppState } from "./AppStateContext";
import { Minus, X, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StagingDock() {
  const { stagedItems, unstageItem, clearStagedItems, stageItem } = useAppState();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Listen for global drag events dispatched from any phase page
  React.useEffect(() => {
    const handleStart = () => setIsDragActive(true);
    const handleEnd = () => setIsDragActive(false);
    window.addEventListener("app-drag-start", handleStart);
    window.addEventListener("app-drag-end", handleEnd);
    return () => {
      window.removeEventListener("app-drag-start", handleStart);
      window.removeEventListener("app-drag-end", handleEnd);
    };
  }, []);

  // Show if there are items, OR if the user is currently dragging an item
  if (stagedItems.length === 0 && !isDragActive) return null;

  const onDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.setData("application/reactflow-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    const id = e.dataTransfer.getData("application/reactflow-id");

    if (type && id && !stagedItems.find((i) => i.id === id)) {
      // Note: Full logic for pulling title/data requires passing it in the drag event
      // or looking it up. For now, since we drop FROM pages to the dock, 
      // the pages should really just trigger `stageItem` natively instead of using HTMl5 drop
      // but if we support drag and drop TO the dock:
      const title = e.dataTransfer.getData("application/reactflow-title") || "Unknown Item";
      stageItem({ id, type: type as any, title });
    }
  };

  return (
    <div 
      className={`fixed bottom-6 left-6 z-50 flex flex-col transition-all duration-300 ease-in-out ${isMinimized ? 'w-16 h-16' : 'w-72'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-white/90 backdrop-blur-md border-2 border-border/50 rounded-xl shadow-lg overflow-hidden flex flex-col h-full pointer-events-auto">
        <div className="flex items-center justify-between p-2 border-b border-border/50 bg-black/5">
          <div className="flex items-center gap-2 px-2">
            {!isMinimized && <span className="font-caveat font-bold text-lg">Staging Dock</span>}
            {isMinimized && <span className="font-caveat font-bold text-lg px-1">{stagedItems.length}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsMinimized(!isMinimized)}>
              <Minus className="h-3 w-3" />
            </Button>
            {!isMinimized && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={clearStagedItems}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {!isMinimized && (
          <div className="p-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
            {stagedItems.length === 0 && (
              <div className="p-4 text-center text-sm font-indie text-muted-foreground border-2 border-dashed rounded-lg">
                Drag items here to stage them!
              </div>
            )}
            {stagedItems.map(item => (
              <div 
                key={item.id} 
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-border shadow-sm group hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => onDragStart(e, item.type, item.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold truncate block">{item.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{item.type}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={() => unstageItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
