"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from "@xyflow/react";
import { useRouter } from "next/navigation";
import "@xyflow/react/dist/style.css";
import {
  MousePointer2, Type, Eraser, ZoomIn, ZoomOut, Trash2,
  StickyNote, Eye, Timer, Keyboard, Hand, Minus, Plus
} from "lucide-react";
import { AssignmentNode, SubjectNode, RoadmapNode, ToolNode, TextNoteNode, StickyNoteNode, WorkingCardNode } from "./nodes";
import { useAppState } from "./AppStateContext";
import { ExportModal } from "./ExportModal";
import { FocusMode } from "./FocusMode";
import { PomodoroTimer } from "./PomodoroTimer";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

const initialNodes: any[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  assignment: AssignmentNode,
  subject: SubjectNode,
  roadmap: RoadmapNode,
  tool: ToolNode,
  textNote: TextNoteNode,
  stickyNote: StickyNoteNode,
  workingCard: WorkingCardNode,
};

function ToolbarButton({ 
  active, onClick, children, title, className = "" 
}: { 
  active?: boolean; onClick: () => void; children: React.ReactNode; title?: string; className?: string 
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-150
        ${active 
          ? "bg-[#e0e0ff] dark:bg-[#3d3b8a]/40 text-[#6965db]" 
          : "text-foreground/70 hover:bg-muted/60"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function CanvasContent() {
  const { 
    unstageItem, drafts, projects, activeProjectId, saveProject, loadProjectContext,
    isFocusMode, setFocusMode, isPomodoroVisible, setPomodoroVisible
  } = useAppState();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [activeTool, setActiveTool] = useState<"select" | "hand" | "text" | "sticky" | "eraser">("select");
  const [zoomLevel, setZoomLevel] = useState(100);
  const router = useRouter();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);

  // Track zoom level
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setZoomLevel(Math.round(getZoom() * 100));
      } catch { /* not mounted yet */ }
    }, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  const generatePreview = async () => {
    const el = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (el) {
      const { toPng } = await import('html-to-image');
      try {
        const dataUrl = await toPng(el, { backgroundColor: '#E0DDD6' });
        setExportDataUrl(dataUrl);
      } catch (err) { console.error("Export error", err); }
    }
  };

  // Quick save handler
  useEffect(() => {
    const handleQuickSave = () => {
      if (activeProjectId) {
        const proj = projects.find((p: any) => p.id === activeProjectId);
        if (proj) {
          saveProject(proj.title, nodes, edges, activeProjectId);
        }
      } else {
        // No active project — trigger save-as
        window.dispatchEvent(new CustomEvent("app-request-save-as"));
      }
    };
    window.addEventListener("app-request-quick-save", handleQuickSave);
    return () => window.removeEventListener("app-request-quick-save", handleQuickSave);
  }, [activeProjectId, projects, nodes, edges, saveProject]);

  useEffect(() => {
    const handleSaveAs = () => {
      setIsSavingProject(true);
      setExportDataUrl(null);
      generatePreview().then(() => setIsExportModalOpen(true));
    };

    const handleSaveAndLoad = (e: any) => {
      if (activeProjectId) {
         const proj = projects.find((p: any) => p.id === activeProjectId);
         if (proj) {
            saveProject(proj.title, nodes, edges, activeProjectId);
         }
      }
      loadProjectContext(e.detail.id);
    };

    const handleLoadData = (e: any) => {
       const id = e.detail.id;
       if (!id) {
         setNodes([]);
         setEdges([]);
         return;
       }
       const proj = projects.find((p: any) => p.id === id);
       if (proj) {
         setNodes(proj.nodes);
         setEdges(proj.edges);
       }
    };

    window.addEventListener("app-request-save-as", handleSaveAs);
    window.addEventListener("app-request-save-and-load", handleSaveAndLoad);
    window.addEventListener("app-load-project", handleLoadData);
    return () => {
      window.removeEventListener("app-request-save-as", handleSaveAs);
      window.removeEventListener("app-request-save-and-load", handleSaveAndLoad);
      window.removeEventListener("app-load-project", handleLoadData);
    };
  }, [nodes, edges, activeProjectId, projects, saveProject, loadProjectContext, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const jsonRaw = event.dataTransfer.getData("application/reactflow-json");
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (jsonRaw) {
        try {
          const parsed = JSON.parse(jsonRaw);
          if (parsed.type === "workingCard") {
            setNodes((nds) => nds.concat({
              id: `working-${Date.now()}`,
              type: "workingCard",
              position,
              data: { ...parsed.data, id: `working-${Date.now()}` }
            }));
            return;
          }
        } catch (e) {
          console.error("Failed to parse dragged node payload", e);
        }
      }

      const type = event.dataTransfer.getData("application/reactflow");
      const id = event.dataTransfer.getData("application/reactflow-id");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const title = event.dataTransfer.getData("application/reactflow-title") || type;

      if (type === "draft") {
        const draft = drafts.find(d => d.id === id);
        if (draft) {
          setNodes((nds) => nds.concat({
            id: `working-${Date.now()}`,
            type: "workingCard",
            position,
            data: { ...draft }
          }));
        }
        return;
      }

      const newNode = {
        id: `${type}-${id}-${Date.now()}`,
        type: type,
        position,
        data: { label: title, originalId: id },
      };

      setNodes((nds) => nds.concat(newNode));
      unstageItem(id);
      router.push("/");
    },
    [screenToFlowPosition, setNodes, unstageItem, drafts, router]
  );

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (activeTool === "text" || activeTool === "sticky") {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: `${activeTool}-${Date.now()}`,
        type: activeTool === "text" ? "textNote" : "stickyNote",
        position,
        data: { text: "" },
      };
      setNodes((nds) => nds.concat(newNode));
      setActiveTool("select");
    }
  }, [activeTool, screenToFlowPosition, setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (activeTool === "eraser") {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setActiveTool("select");
    }
  }, [activeTool, setNodes]);

  const handleSetTool = useCallback((tool: string) => {
    setActiveTool(tool as typeof activeTool);
  }, []);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.1 }}
        className="bg-transparent"
        minZoom={0.2}
        maxZoom={4}
        panOnDrag={activeTool === "hand" || activeTool === "select"}
        selectionOnDrag={activeTool === "select"}
      >
        <Background variant={BackgroundVariant.Dots} color="#E0DDD6" gap={24} size={2} />

        {/* ─── Excalidraw-style top toolbar ─── */}
        {!isFocusMode && (
          <Panel position="top-center" className="mt-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/60 px-2 py-1.5 flex items-center gap-0.5 font-sans">
              {/* Core tools */}
              <ToolbarButton active={activeTool === "hand"} onClick={() => setActiveTool("hand")} title="Hand tool (H)">
                <Hand className="h-[18px] w-[18px]" />
              </ToolbarButton>
              <ToolbarButton active={activeTool === "select"} onClick={() => setActiveTool("select")} title="Selection (V / 1)">
                <MousePointer2 className="h-[18px] w-[18px]" />
              </ToolbarButton>

              <div className="w-[1px] h-5 bg-border mx-1" />

              <ToolbarButton active={activeTool === "text"} onClick={() => setActiveTool("text")} title="Text (T / 2)">
                <Type className="h-[18px] w-[18px]" />
              </ToolbarButton>
              <ToolbarButton active={activeTool === "sticky"} onClick={() => setActiveTool("sticky")} title="Sticky Note (N / 3)">
                <StickyNote className="h-[18px] w-[18px]" />
              </ToolbarButton>
              <ToolbarButton active={activeTool === "eraser"} onClick={() => setActiveTool("eraser")} title="Eraser (E / 4)">
                <Eraser className="h-[18px] w-[18px]" />
              </ToolbarButton>

              <div className="w-[1px] h-5 bg-border mx-1" />

              {/* Productivity tools */}
              <ToolbarButton active={isFocusMode} onClick={() => setFocusMode(!isFocusMode)} title="Focus Mode (Ctrl+Shift+F)">
                <Eye className="h-[18px] w-[18px]" />
              </ToolbarButton>
              <ToolbarButton active={isPomodoroVisible} onClick={() => setPomodoroVisible(!isPomodoroVisible)} title="Pomodoro Timer (Ctrl+Shift+P)">
                <Timer className="h-[18px] w-[18px]" />
              </ToolbarButton>

              <div className="w-[1px] h-5 bg-border mx-1" />

              {/* Export */}
              <ToolbarButton onClick={() => {
                setIsSavingProject(false);
                setExportDataUrl(null);
                generatePreview().then(() => setIsExportModalOpen(true));
              }} title="Export / Save">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </ToolbarButton>
              <ToolbarButton onClick={() => setNodes(nodes.filter(n => !n.selected))} title="Delete Selected" className="hover:text-destructive">
                <Trash2 className="h-[18px] w-[18px]" />
              </ToolbarButton>
            </div>
          </Panel>
        )}

        {/* ─── Excalidraw-style bottom-left zoom controls ─── */}
        {!isFocusMode && (
          <Panel position="bottom-left" className="mb-4 ml-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-md border border-border/60 flex items-center gap-0 font-sans overflow-hidden">
              <button
                onClick={() => zoomOut()}
                className="p-2 text-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => fitView({ maxZoom: 1, padding: 0.1 })}
                className="px-2 py-1.5 text-[12px] font-mono text-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors min-w-[48px] text-center"
                title="Reset zoom"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => zoomIn()}
                className="p-2 text-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </Panel>
        )}

        {/* ─── Bottom-right help trigger ─── */}
        {!isFocusMode && (
          <Panel position="bottom-right" className="mb-4 mr-4">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }))}
              className="w-7 h-7 rounded-full bg-background/95 backdrop-blur-sm border border-border/60 shadow-md text-muted-foreground hover:text-foreground text-[13px] font-sans flex items-center justify-center transition-colors"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>
          </Panel>
        )}
      </ReactFlow>

      {/* Focus Mode Overlay */}
      <FocusMode isActive={isFocusMode} onExit={() => setFocusMode(false)} />

      {/* Pomodoro Timer */}
      <PomodoroTimer isVisible={isPomodoroVisible} onClose={() => setPomodoroVisible(false)} />

      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts
        onToggleFocusMode={() => setFocusMode(!isFocusMode)}
        onTogglePomodoro={() => setPomodoroVisible(!isPomodoroVisible)}
        onSetTool={handleSetTool}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        previewDataUrl={exportDataUrl}
        isSavingProject={isSavingProject}
        onSaveProject={(name) => {
           saveProject(name, nodes, edges);
           setIsExportModalOpen(false);
        }}
        onDownload={(name) => {
          if (!exportDataUrl) return;
          const a = document.createElement("a");
          a.href = exportDataUrl;
          a.download = `${name}.png`;
          a.click();
          setIsExportModalOpen(false);
        }}
        onShare={async (name) => {
          if (!exportDataUrl) return;
          try {
            const res = await fetch(exportDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${name}.png`, { type: "image/png" });
            if ('share' in navigator) {
              await navigator.share({
                title: name,
                files: [file]
              });
            }
          } catch (e) {
            console.error("Error sharing", e);
          }
          setIsExportModalOpen(false);
        }}
      />
    </div>
  );
}

export function ExcaliStudyCanvas() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => {
      setTimeout(() => setIsDragging(false), 50); 
    };
    
    const handleGlobalDrop = () => {
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener("app-drag-start", onDragStart);
    window.addEventListener("app-drag-end", onDragEnd);
    window.addEventListener("drop", handleGlobalDrop);

    return () => {
      window.removeEventListener("app-drag-start", onDragStart);
      window.removeEventListener("app-drag-end", onDragEnd);
      window.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  return (
    <main className={`absolute inset-0 h-full w-full overflow-hidden transition-all ${isDragging ? "z-50" : "z-0"}`}>
      <ReactFlowProvider>
        <CanvasContent />
      </ReactFlowProvider>
      {isDragging && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-40 border-l border-dashed border-destructive/40 bg-destructive/5 flex items-center justify-center p-4 z-[60] pointer-events-auto backdrop-blur-[1px]"
          onDragOver={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            e.dataTransfer.dropEffect = "none"; 
          }}
          onDrop={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
          }}
        >
           <span className="text-[11px] text-destructive/80 text-center font-bold tracking-widest uppercase flex flex-col gap-2">
             <span>Drop Here</span>
             <span className="opacity-50 text-[10px]">or</span>
             <span>Press ESC<br/>to cancel</span>
           </span>
        </div>
      )}
    </main>
  );
}
