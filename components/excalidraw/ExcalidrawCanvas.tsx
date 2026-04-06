"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
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
import { MousePointer2, Type, Eraser, ZoomIn, ZoomOut, Trash2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignmentNode, SubjectNode, RoadmapNode, ToolNode, TextNoteNode, StickyNoteNode, WorkingCardNode } from "./nodes";
import { useAppState } from "./AppStateContext";
import { ExportModal } from "./ExportModal";

const initialNodes: any[] = [];
const initialEdges: Edge[] = [];

// Temporarily use generic nodes until custom ones are built
const nodeTypes = {
  assignment: AssignmentNode,
  subject: SubjectNode,
  roadmap: RoadmapNode,
  tool: ToolNode,
  textNote: TextNoteNode,
  stickyNote: StickyNoteNode,
  workingCard: WorkingCardNode,
};

function CanvasContent() {
  const { unstageItem, drafts, projects, activeProjectId, saveProject, loadProjectContext } = useAppState();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const [activeTool, setActiveTool] = useState<"select" | "text" | "sticky" | "eraser">("select");
  const router = useRouter();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);

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

  useEffect(() => {
    const handleSaveAs = () => {
      setIsSavingProject(true);
      setExportDataUrl(null);
      generatePreview().then(() => setIsExportModalOpen(true));
    };

    const handleSaveAndLoad = (e: any) => {
      // Auto save current if active project
      if (activeProjectId) {
         const proj = projects.find((p: any) => p.id === activeProjectId);
         if (proj) {
            saveProject(proj.title, nodes, edges, activeProjectId);
         }
      } else {
         // Optionally, prompt to save an unsaved canvas. But we skip for now if not explicitly saved initially.
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
            return; // Successfully created branch
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
        type: type, // we will map this to our custom node types
        position,
        data: { label: title, originalId: id },
      };

      setNodes((nds) => nds.concat(newNode));
      
      // Auto-remove from the staging dock if it came from there
      unstageItem(id);

      // Successfully dropped - automatically return to the workspace to see it
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
      setActiveTool("select"); // revert to select
    }
  }, [activeTool, screenToFlowPosition, setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (activeTool === "eraser") {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setActiveTool("select"); // revert to select
    }
  }, [activeTool, setNodes]);

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
        className="bg-transparent"
        minZoom={0.2}
        maxZoom={4}
      >
        <Background variant={BackgroundVariant.Dots} color="#E0DDD6" gap={24} size={2} />

        {/* Top Toolbar Panel */}
        <Panel position="top-center" className="bg-white rounded-full shadow-card border border-border p-1.5 flex gap-1 items-center font-sans mt-4">
          <Button
            variant={activeTool === "select" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={() => setActiveTool("select")}
            aria-label="Select Tool"
          >
            <MousePointer2 className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant={activeTool === "text" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={() => setActiveTool("text")}
            aria-label="Text Tool"
          >
            <Type className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant={activeTool === "sticky" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={() => setActiveTool("sticky")}
            aria-label="Sticky Note Tool"
          >
            <StickyNote className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant={activeTool === "eraser" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={() => setActiveTool("eraser")}
            aria-label="Eraser Tool"
          >
            <Eraser className="h-4 w-4 text-foreground" />
          </Button>
          
          <div className="w-[1px] h-4 bg-border mx-1" />
          
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => zoomIn()}>
            <ZoomIn className="h-4 w-4 text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => zoomOut()}>
            <ZoomOut className="h-4 w-4 text-foreground" />
          </Button>
          
          <div className="w-[1px] h-4 bg-border mx-1" />
          
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-accent" onClick={() => {
            setIsSavingProject(false);
            setExportDataUrl(null);
            generatePreview().then(() => setIsExportModalOpen(true));
          }} title="Export / Share Canvas">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:text-destructive hover:bg-destructive/10" onClick={() => setNodes(nodes.filter(n => !n.selected))} title="Delete Selected">
            <Trash2 className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>

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

export function ExcalidrawCanvas() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => {
      setTimeout(() => setIsDragging(false), 50); 
    };
    
    // Also reset if drop happens
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
    </main>
  );
}


