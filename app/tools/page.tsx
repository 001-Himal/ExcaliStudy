"use client";

import React, { useState } from "react";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Search, Plus, Trash2, X, Pin, PinOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

export default function ToolsPhase() {
  const { tools, addTool, removeTool, toggleToolPin } = useAppState();
  const { state } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [newToolUrl, setNewToolUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest" | "alpha"
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (newToolUrl.trim()) {
      addTool(newToolUrl.trim());
      setNewToolUrl("");
      setIsFormOpen(false);
    }
  };

  const filteredTools = tools
    .filter((tool) => tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || tool.url.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Simulate ID-based chronological sorting since our mock IDs start with 't-' and real IDs 't-ts'
      if (sortOrder === "newest") {
        return b.id.localeCompare(a.id);
      } else if (sortOrder === "oldest") {
        return a.id.localeCompare(b.id);
      } else if (sortOrder === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className={`h-full w-full overflow-y-auto bg-background/50 pointer-events-auto relative transition-all duration-300 ease-in-out ${state === "expanded" ? "md:pl-[var(--sidebar-width)]" : ""}`}>
      <Link href="/">
        <Button variant="ghost" size="icon" className="absolute top-6 right-6 hover:bg-destructive/10 hover:text-destructive group transition-colors z-20">
          <X className="h-10 w-10 text-muted-foreground group-hover:text-destructive transition-colors shrink-0" strokeWidth={2.5} />
        </Button>
      </Link>
      
      {/* Hand-drawn style sticky header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-border/50 p-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div>
              <h1 className="text-3xl font-caveat font-bold">Tools Repository</h1>
              <p className="text-sm text-muted-foreground font-indie">Organize and quick-access your study tools</p>
            </div>
          </div>

          <div className="flex flex-1 w-full md:w-auto items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tools..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50 border-dashed border-2 focus-visible:ring-1"
              />
            </div>
            <Select value={sortOrder} onValueChange={(val) => setSortOrder(val || "newest")}>
              <SelectTrigger className="w-[120px] bg-white/50 border-dashed border-2">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="alpha">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-4">
        {/* Add Tool Form */}
        <section className="mb-10 bg-white/40 p-6 rounded-xl border-2 border-dashed shadow-sm">
          {!isFormOpen ? (
            <Button 
              onClick={() => setIsFormOpen(true)}
              variant="ghost" 
              className="w-full h-16 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-lg font-caveat font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" /> Create Tool
            </Button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-caveat font-semibold inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add a new tool
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <form onSubmit={handleAddTool} className="flex gap-2 flex-col sm:flex-row">
                <Input 
                  placeholder="Paste tool URL (e.g., https://excalidraw.com)" 
                  value={newToolUrl}
                  onChange={(e) => setNewToolUrl(e.target.value)}
                  className="flex-1 bg-white"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="font-caveat text-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newToolUrl.trim()} className="font-caveat text-lg px-6">
                    Add
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div 
              key={tool.id} 
              className="group relative flex flex-col bg-white p-5 rounded-xl border-2 border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{
                borderRadius: '8px 24px 8px 16px', // Slight hand-drawn irregularity
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/reactflow", "tool");
                e.dataTransfer.setData("application/reactflow-id", tool.id);
                e.dataTransfer.setData("application/reactflow-title", tool.title);
                e.dataTransfer.effectAllowed = "move";
                // Trigger a custom event so the Dock can appear instantly
                window.dispatchEvent(new Event('app-drag-start'));
              }}
              onDragEnd={() => {
                window.dispatchEvent(new Event('app-drag-end'));
              }}
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant={tool.isPinned ? "default" : "secondary"}
                  size="icon" 
                  className={`h-8 w-8 rounded-full shadow-sm ${tool.isPinned ? 'bg-primary' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleToolPin(tool.id); }}
                >
                  {tool.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={(e) => { e.stopPropagation(); removeTool(tool.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-black/5 flex items-center justify-center border p-1 overflow-hidden shrink-0 shadow-sm">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64`} 
                    alt={`${tool.title} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAxNmguMDFNMTIgOGwyIDIgMi0yIi8+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate font-indie" title={tool.title}>{tool.title}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase font-normal truncate max-w-full">
                    {tool.domain}
                  </Badge>
                </div>
              </div>

              <a 
                href={tool.url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-auto text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Launch Tool 
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          ))}

          {filteredTools.length === 0 && (
            <div className="col-span-full py-12 text-center flex flex-col items-center opacity-50">
              <Search className="h-12 w-12 mb-4" />
              <p className="text-xl font-caveat">No tools found.</p>
              {searchTerm && <p className="text-sm font-indie">Try adjusting your search.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

