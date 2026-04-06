"use client";

import React, { useState } from "react";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Search, X, Pin, PinOff, Map, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

export default function RoadmapsPhase() {
  const { roadmaps, addRoadmap, toggleRoadmapPin } = useAppState();
  const { state } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMilestones, setNewMilestones] = useState<{title: string, completed: boolean}[]>([{title: "", completed: false}]);

  const handleAddMilestone = () => setNewMilestones([...newMilestones, {title: "", completed: false}]);
  const handleRemoveMilestone = (index: number) => setNewMilestones(newMilestones.filter((_, i) => i !== index));
  const handleMilestoneChange = (index: number, val: string) => {
    const updated = [...newMilestones];
    updated[index].title = val;
    setNewMilestones(updated);
  };

  const handleAddRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addRoadmap(newTitle.trim(), newMilestones);
      setNewTitle("");
      setNewMilestones([{title: "", completed: false}]);
      setIsFormOpen(false);
    }
  };

  const filteredRoadmaps = roadmaps
    .filter((rm) => rm.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "newest") return b.id.localeCompare(a.id);
      if (sortOrder === "alpha") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className={`h-full w-full overflow-y-auto bg-background pointer-events-auto relative transition-all duration-300 ease-in-out ${state === "expanded" ? "md:pl-[var(--sidebar-width)]" : ""}`}>
      <Link href="/">
        <Button variant="ghost" className="absolute top-6 right-6 h-16 w-16 rounded-full hover:bg-destructive/10 hover:text-destructive group transition-colors z-20 p-0">
          <X className="h-10 w-10 text-muted-foreground group-hover:text-destructive transition-colors shrink-0" strokeWidth={2.5} />
        </Button>
      </Link>

      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-border/50 p-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div>
              <h1 className="text-3xl font-caveat font-bold">Roadmaps</h1>
              <p className="text-sm text-muted-foreground font-indie">Plot your long-term learning goals</p>
            </div>
          </div>

          <div className="flex flex-1 w-full md:w-auto items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search roadmaps..." 
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
                <SelectItem value="alpha">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-4">
        <section className="mb-10 bg-white/40 p-6 rounded-xl border-2 border-dashed shadow-sm">
          {!isFormOpen ? (
            <Button 
              onClick={() => setIsFormOpen(true)}
              variant="ghost" 
              className="w-full h-16 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-lg font-caveat font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" /> Create Roadmap
            </Button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-caveat font-semibold inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add a new roadmap
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <form onSubmit={handleAddRoadmap} className="space-y-4">
                <Input 
                  placeholder="Roadmap Title (e.g., Learn Next.js)" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-white font-bold"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Milestones</label>
                  {newMilestones.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Milestone ${i + 1}`}
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(i, e.target.value)}
                        className="bg-white"
                      />
                      {newMilestones.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMilestone(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone} className="mt-2 text-xs font-indie">
                    + Add Another Milestone
                  </Button>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="font-caveat text-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newTitle.trim() || newMilestones.every(m => !m.title.trim())} className="font-caveat text-lg px-6">
                    Create Roadmap
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredRoadmaps.map((rm) => (
            <div 
              key={rm.id} 
              className="group relative flex flex-col bg-white p-5 rounded-xl border-2 border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{ borderRadius: '24px 8px 8px 16px' }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/reactflow", "roadmap");
                e.dataTransfer.setData("application/reactflow-id", rm.id);
                e.dataTransfer.setData("application/reactflow-title", rm.title);
                e.dataTransfer.effectAllowed = "move";
                window.dispatchEvent(new Event('app-drag-start'));
              }}
              onDragEnd={() => window.dispatchEvent(new Event('app-drag-end'))}
            >
              {/* Floating Action Menu */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-white/95 backdrop-blur-sm border shadow-sm p-1 rounded-2xl z-10">
                <Button 
                  variant={rm.isPinned ? "default" : "ghost"}
                  size="icon" 
                  className={`h-8 w-8 rounded-full ${rm.isPinned ? 'bg-primary' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleRoadmapPin(rm.id); }}
                >
                  {rm.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              </div>

              {/* Card Header Content */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center border-2 border-transparent bg-black/5 shrink-0 shadow-sm">
                  <Map className="h-6 w-6 text-foreground/70" />
                </div>
                <div className="min-w-0 pr-2">
                  <h3 className="font-bold text-lg truncate font-indie" title={rm.title}>{rm.title}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase font-normal truncate max-w-full">
                    {rm.milestonesTotal} Milestones
                  </Badge>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-dashed w-full text-sm font-medium flex justify-between items-center text-muted-foreground">
                <span className="font-sans text-xs">Progress: {rm.milestonesDone}/{rm.milestonesTotal}</span>
                <div className="w-1/2 bg-black/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-foreground rounded-full transition-all" 
                    style={{ width: `${(rm.milestonesDone / rm.milestonesTotal) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
          {filteredRoadmaps.length === 0 && (
            <div className="col-span-full py-12 text-center flex flex-col items-center opacity-50">
              <Search className="h-12 w-12 mb-4" />
              <p className="text-xl font-caveat">No roadmaps found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



