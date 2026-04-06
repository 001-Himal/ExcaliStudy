"use client";

import React, { useState } from "react";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Search, X, Pin, PinOff, Calendar, Plus, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

export default function AssignmentsPhase() {
  const { assignments, subjects, addAssignment, removeAssignment, updateAssignment, toggleAssignmentPin } = useAppState();
  const { state } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("deadline");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newNotes, setNewNotes] = useState<string[]>([""]);

  const handleAddNote = () => setNewNotes([...newNotes, ""]);
  const handleRemoveNote = (index: number) => setNewNotes(newNotes.filter((_, i) => i !== index));
  const handleNoteChange = (index: number, val: string) => {
    const updated = [...newNotes];
    updated[index] = val;
    setNewNotes(updated);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTitle("");
    setNewDeadline("");
    setNewSubjectId("");
    setNewNotes([""]);
    setIsFormOpen(false);
  };

  const openEditForm = (asn: any) => {
    setEditingId(asn.id);
    setNewTitle(asn.title);
    setNewDeadline(asn.deadline);
    setNewSubjectId(asn.subjectId);
    setNewNotes(asn.keepInMind.length ? asn.keepInMind : [""]);
    setIsFormOpen(true);
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newDeadline && newSubjectId) {
      if (editingId) {
        updateAssignment(editingId, {
          title: newTitle.trim(),
          deadline: newDeadline,
          subjectId: newSubjectId,
          keepInMind: newNotes.filter(n => n.trim() !== "")
        });
      } else {
        addAssignment(newSubjectId, newTitle.trim(), newDeadline, newNotes);
      }
      resetForm();
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredAssignments = assignments
    .filter((asn) => asn.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
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
              <h1 className="text-3xl font-caveat font-bold">Assignments</h1>
              <p className="text-sm text-muted-foreground font-indie">Track definitions, deadlines, and deliverables</p>
            </div>
          </div>

          <div className="flex flex-1 w-full md:w-auto items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search assignments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50 border-dashed border-2 focus-visible:ring-1"
              />
            </div>
            <Select value={sortOrder} onValueChange={(val) => setSortOrder(val || "deadline")}>
              <SelectTrigger className="w-[120px] bg-white/50 border-dashed border-2">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Urgency</SelectItem>
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
              <Plus className="h-5 w-5 mr-2" /> Create Assignment
            </Button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-caveat font-semibold inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> {editingId ? "Edit assignment" : "Add a new assignment"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="Title (e.g., Essay)" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 bg-white font-bold"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={newSubjectId} onValueChange={(val) => setNewSubjectId(val || "")}>
                      <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        className="pl-9 w-[160px] bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Keep in mind (Notes)</label>
                  {newNotes.map((note, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Details or constraint ${i + 1}`}
                        value={note}
                        onChange={(e) => handleNoteChange(i, e.target.value)}
                        className="bg-white"
                      />
                      {newNotes.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveNote(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddNote} className="mt-2 text-xs font-indie">
                    + Add Another Note
                  </Button>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="font-caveat text-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newTitle.trim() || !newDeadline || !newSubjectId} className="font-caveat text-lg px-6">
                    {editingId ? "Save Changes" : "Add Assignment"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAssignments.map((asn) => {
            const subject = subjects.find(s => s.id === asn.subjectId);
            const days = getDaysRemaining(asn.deadline);
            let badgeColor = "bg-muted text-muted-foreground";
            let badgeText = `${days} days`;
            if (days < 0) {
              badgeColor = "bg-destructive text-white";
              badgeText = "Overdue";
            } else if (days === 0) {
              badgeColor = "bg-orange-500 text-white";
              badgeText = "Today";
            } else if (days <= 3) {
              badgeColor = "bg-accent text-foreground";
            }

            return (
              <div 
                key={asn.id} 
                className="group relative flex flex-col bg-white p-5 rounded-xl border-2 border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                style={{ borderRadius: '8px 8px 24px 8px' }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/reactflow", "assignment");
                  e.dataTransfer.setData("application/reactflow-id", asn.id);
                  e.dataTransfer.setData("application/reactflow-title", asn.title);
                  e.dataTransfer.effectAllowed = "move";
                  window.dispatchEvent(new Event('app-drag-start'));
                }}
                onDragEnd={() => window.dispatchEvent(new Event('app-drag-end'))}
              >
                {/* Floating Action Menu */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-white/95 backdrop-blur-sm border shadow-sm p-1 rounded-2xl z-10">
                  <Button 
                    variant={asn.isPinned ? "default" : "ghost"}
                    size="icon" 
                    className={`h-8 w-8 rounded-full ${asn.isPinned ? 'bg-primary' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleAssignmentPin(asn.id); }}
                    title={asn.isPinned ? "Unpin" : "Pin"}
                  >
                    {asn.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => { e.stopPropagation(); openEditForm(asn); }}
                    title="Edit Assignment"
                  >
                    <Pencil className="h-3 w-3" /> 
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => { e.stopPropagation(); removeAssignment(asn.id); }}
                    title="Delete Assignment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Card Header Content */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-lg flex flex-col items-center justify-center border-2 border-dashed shrink-0 shadow-sm ${days < 0 ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'}`}>
                    <Calendar className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-bold font-mono">{days < 0 ? 'LATE' : days + 'D'}</span>
                  </div>
                  <div className="min-w-0 pr-2">
                    <h3 className="font-bold text-lg truncate font-indie" title={asn.title}>{asn.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                       {subject && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />}
                       <Badge variant="secondary" className="font-mono text-[10px] uppercase font-normal truncate">
                         {subject ? subject.name : 'No Topic'}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-1.5 border-t border-dashed pt-4">
                  {asn.keepInMind.slice(0, 2).map((kim, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground font-sans">
                      <span className="text-black/30">•</span>
                      <span className="truncate">{kim}</span>
                    </div>
                  ))}
                  {asn.keepInMind.length > 2 && (
                    <div className="text-[10px] text-muted-foreground/50 font-mono italic">
                      + {asn.keepInMind.length - 2} more notes...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredAssignments.length === 0 && (
            <div className="col-span-full py-12 text-center flex flex-col items-center opacity-50">
              <Search className="h-12 w-12 mb-4" />
              <p className="text-xl font-caveat">No assignments found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



