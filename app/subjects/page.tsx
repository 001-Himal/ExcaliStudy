"use client";

import React, { useState } from "react";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Search, Plus, X, Pin, PinOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

export default function SubjectsPhase() {
  const { subjects, addSubject, removeSubject, updateSubject, toggleSubjectPin } = useAppState();
  const { state } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "alpha"
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectUnits, setNewSubjectUnits] = useState<string[]>([""]);

  const handleAddUnit = () => setNewSubjectUnits([...newSubjectUnits, ""]);
  const handleRemoveUnit = (index: number) => setNewSubjectUnits(newSubjectUnits.filter((_, i) => i !== index));
  const handleUnitChange = (index: number, val: string) => {
    const updated = [...newSubjectUnits];
    updated[index] = val;
    setNewSubjectUnits(updated);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewSubjectName("");
    setNewSubjectUnits([""]);
    setIsFormOpen(false);
  };

  const openEditForm = (sub: any) => {
    setEditingId(sub.id);
    setNewSubjectName(sub.name);
    setNewSubjectUnits(sub.units.length ? sub.units.map((u: any) => u.title) : [""]);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      if (editingId) {
         const sub = subjects.find(s => s.id === editingId);
         const color = sub?.color || "#4285F4";
         updateSubject(editingId, newSubjectName.trim(), color, newSubjectUnits);
      } else {
         const colors = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"];
         const randomColor = colors[Math.floor(Math.random() * colors.length)];
         addSubject(newSubjectName.trim(), randomColor, newSubjectUnits);
      }
      resetForm();
    }
  };

  const filteredSubjects = subjects
    .filter((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Mocks mock ID parsing
      if (sortOrder === "newest") return b.id.localeCompare(a.id);
      if (sortOrder === "alpha") return a.name.localeCompare(b.name);
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
              <h1 className="text-3xl font-caveat font-bold">Subjects Repository</h1>
              <p className="text-sm text-muted-foreground font-indie">Track and organize your academic structure</p>
            </div>
          </div>

          <div className="flex flex-1 w-full md:w-auto items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search subjects..." 
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
              <Plus className="h-5 w-5 mr-2" /> Create Subject
            </Button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-caveat font-semibold inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> {editingId ? "Edit subject" : "Add a new subject"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              
              <form onSubmit={handleAddSubject} className="space-y-4">
                <Input 
                  placeholder="Subject Name (e.g., Operating Systems)" 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="bg-white font-bold"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Syllabus / Units</label>
                  {newSubjectUnits.map((u, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Unit ${i + 1} title`}
                        value={u}
                        onChange={(e) => handleUnitChange(i, e.target.value)}
                        className="bg-white"
                      />
                      {newSubjectUnits.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveUnit(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddUnit} className="mt-2 text-xs font-indie">
                    + Add Another Unit
                  </Button>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="font-caveat text-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newSubjectName.trim() || newSubjectUnits.every(u => !u.trim())} className="font-caveat text-lg px-6">
                    {editingId ? "Save Changes" : "Create Subject"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <div 
              key={sub.id} 
              className="group relative flex flex-col bg-white p-5 rounded-xl border-2 border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{ borderRadius: '16px 8px 24px 8px' }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/reactflow", "subject");
                e.dataTransfer.setData("application/reactflow-id", sub.id);
                e.dataTransfer.setData("application/reactflow-title", sub.name);
                e.dataTransfer.effectAllowed = "move";
                window.dispatchEvent(new Event('app-drag-start'));
              }}
              onDragEnd={() => window.dispatchEvent(new Event('app-drag-end'))}
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant={sub.isPinned ? "default" : "secondary"}
                  size="icon" 
                  className={`h-8 w-8 rounded-full shadow-sm ${sub.isPinned ? 'bg-primary' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleSubjectPin(sub.id); }}
                  title={sub.isPinned ? "Unpin" : "Pin"}
                >
                  {sub.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={(e) => { e.stopPropagation(); openEditForm(sub); }}
                  title="Edit Subject"
                >
                  <Plus className="h-3 w-3" style={{ transform: 'rotate(45deg)' }} /> 
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-sm hover:bg-destructive hover:text-white"
                  onClick={(e) => { e.stopPropagation(); removeSubject(sub.id); }}
                  title="Delete Subject"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center border-2 border-dashed shrink-0 shadow-sm"
                  style={{ borderColor: sub.color, backgroundColor: `${sub.color}20` }}
                >
                  <span className="font-bold font-caveat text-xl" style={{ color: sub.color }}>
                    {sub.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 pr-8">
                  <h3 className="font-bold text-lg truncate font-indie" title={sub.name}>{sub.name}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase font-normal truncate max-w-full">
                    {sub.unitsTotal} units
                  </Badge>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-dashed w-full text-sm font-medium flex justify-between items-center text-muted-foreground">
                <span>Progress: {sub.unitsDone}/{sub.unitsTotal}</span>
                <div className="w-1/2 bg-black/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${(sub.unitsDone / sub.unitsTotal) * 100}%`, backgroundColor: sub.color }} 
                  />
                </div>
              </div>
            </div>
          ))}
          {filteredSubjects.length === 0 && (
            <div className="col-span-full py-12 text-center flex flex-col items-center opacity-50">
              <Search className="h-12 w-12 mb-4" />
              <p className="text-xl font-caveat">No subjects found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

