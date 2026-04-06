"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tool, Subject, Assignment, Roadmap, DraftCard, MOCK_TOOLS, MOCK_SUBJECTS, MOCK_ASSIGNMENTS, MOCK_ROADMAPS } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

export type StagedItem = {
  id: string; // The original id of the dragged item
  type: "tool" | "subject" | "assignment" | "roadmap";
  title: string;
  data?: any; // To hold any additional required visualization data
};

type AppStateContextType = {
  tools: (Tool & { isPinned?: boolean })[];
  subjects: (Subject & { isPinned?: boolean })[];
  assignments: (Assignment & { isPinned?: boolean })[];
  roadmaps: (Roadmap & { isPinned?: boolean })[];
  drafts: DraftCard[];
  stagedItems: StagedItem[];

  sidebarFont: string;
  textFont: string;
  cardFont: string;
  setSidebarFont: (f: string) => void;
  setTextFont: (f: string) => void;
  setCardFont: (f: string) => void;

  // Tools Actions
  addTool: (url: string) => void;
  removeTool: (id: string) => void;
  toggleToolPin: (id: string) => void;

  // New Creation Actions
  addSubject: (name: string, color: string, units: string[]) => void;
  addAssignment: (subjectId: string, title: string, deadline: string, keepInMind: string[]) => void;
  addRoadmap: (title: string, milestones: {title: string, completed: boolean}[]) => void;

  // Deletion Actions
  removeSubject: (id: string) => void;
  removeAssignment: (id: string) => void;
  removeRoadmap: (id: string) => void;

  // Staging Dock Actions
  stageItem: (item: StagedItem) => void;
  unstageItem: (id: string) => void;
  clearStagedItems: () => void;
  
  // Draft Actions
  saveDraft: (draft: DraftCard) => void;
  removeDraft: (id: string) => void;
  
  // Generic Pin Actions for mocks (would normally be in their specific controllers)
  toggleSubjectPin: (id: string) => void;
  toggleAssignmentPin: (id: string) => void;
  toggleRoadmapPin: (id: string) => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<(Tool & { isPinned?: boolean })[]>([]);
  const [subjects, setSubjects] = useState<(Subject & { isPinned?: boolean })[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { isPinned?: boolean })[]>([]);
  const [roadmaps, setRoadmaps] = useState<(Roadmap & { isPinned?: boolean })[]>([]);
  const [drafts, setDrafts] = useState<DraftCard[]>([]);
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [sidebarFont, setSidebarFont] = useState<string>("font-sans");
  const [textFont, setTextFont] = useState<string>("font-sans");
  const [cardFont, setCardFont] = useState<string>("font-caveat");

  // Client-side hydration
  useEffect(() => {
    async function fetchAll() {
      // Fetch Tools
      const { data: tData } = await supabase.from('tools').select('*');
      if (tData && tData.length > 0) {
        setTools(tData.map(t => ({ id: t.id, title: t.title, url: t.url, domain: t.domain, isPinned: t.is_pinned })));
      } else {
        setTools(MOCK_TOOLS.map(t => ({ ...t, isPinned: true })));
      }

      // Fetch Subjects
      const { data: sData } = await supabase.from('subjects').select('*');
      if (sData && sData.length > 0) {
        setSubjects(sData.map(s => ({
          id: s.id, name: s.name, color: s.color,
          unitsTotal: s.units_total, unitsDone: s.units_done,
          units: s.units, isPinned: s.is_pinned
        })));
      } else {
        setSubjects(MOCK_SUBJECTS.map(s => ({ ...s, isPinned: true })));
      }

      // Fetch Assignments
      const { data: aData } = await supabase.from('assignments').select('*');
      if (aData && aData.length > 0) {
        setAssignments(aData.map(a => ({
          id: a.id, subjectId: a.subject_id, title: a.title, deadline: a.deadline,
          keepInMind: a.keep_in_mind, status: a.status as any, isPinned: a.is_pinned
        })));
      } else {
        setAssignments(MOCK_ASSIGNMENTS.map(a => ({ ...a, isPinned: true })));
      }

      // Fetch Roadmaps
      const { data: rData } = await supabase.from('roadmaps').select('*');
      if (rData && rData.length > 0) {
        setRoadmaps(rData.map(r => ({
          id: r.id, title: r.title, milestonesTotal: r.milestones_total,
          milestonesDone: r.milestones_done, milestones: r.milestones, isPinned: r.is_pinned
        })));
      } else {
        setRoadmaps(MOCK_ROADMAPS.map(r => ({ ...r, isPinned: true })));
      }

      // Fetch Drafts
      const { data: dData } = await supabase.from('drafts').select('*');
      if (dData && dData.length > 0) {
        setDrafts(dData.map(d => ({
          id: d.id, sourceId: d.source_id, title: d.title,
          topics: d.topics, timerMinutes: d.timer_minutes
        })));
      } else {
        const storedDrafts = localStorage.getItem("anchor_drafts");
        if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
      }

      // Staged items (keep transient in localStorage)
      const storedStaged = localStorage.getItem("anchor_staged");
      if (storedStaged) setStagedItems(JSON.parse(storedStaged));
    }
    fetchAll();
  }, []);

  useEffect(() => {
    localStorage.setItem("anchor_staged", JSON.stringify(stagedItems));
  }, [stagedItems]);

  useEffect(() => {
    const sFont = localStorage.getItem("anchor_sidebarFont");
    if (sFont) setSidebarFont(sFont);
    const tFont = localStorage.getItem("anchor_textFont");
    if (tFont) setTextFont(tFont);
    const cFont = localStorage.getItem("anchor_cardFont");
    if (cFont) setCardFont(cFont);
  }, []);

  const handleSetSidebarFont = (f: string) => {
    setSidebarFont(f);
    localStorage.setItem("anchor_sidebarFont", f);
  };

  const handleSetTextFont = (f: string) => {
    setTextFont(f);
    localStorage.setItem("anchor_textFont", f);
  };

  const handleSetCardFont = (f: string) => {
    setCardFont(f);
    localStorage.setItem("anchor_cardFont", f);
  };

  // ---- TOOL LOGIC ----
  const addTool = async (url: string) => {
    try {
      const validUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(validUrl);
      const domain = urlObj.hostname.replace(/^www\./, "");
      const title = domain.split(".")[0];
      
      const newTool: Tool & { isPinned: boolean } = {
        id: `t-${Date.now()}`,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        url: validUrl,
        domain,
        isPinned: false, // Default unpinned
      };
      
      setTools((prev) => [...prev, newTool]);
      await supabase.from('tools').insert({
        id: newTool.id, title: newTool.title, url: newTool.url, domain: newTool.domain, is_pinned: newTool.isPinned
      });
    } catch (e) {
      console.error("Invalid URL", e);
    }
  };

  const removeTool = async (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tools').delete().eq('id', id);
  };
  
  const toggleToolPin = async (id: string) => {
    let pinState = false;
    setTools((prev) => prev.map(t => {
      if (t.id === id) {
        pinState = !t.isPinned;
        return { ...t, isPinned: pinState };
      }
      return t;
    }));
    await supabase.from('tools').update({ is_pinned: pinState }).eq('id', id);
  };

  // ---- APP WIDE LOGIC ----
  const addSubject = async (name: string, color: string, rawUnits: string[]) => {
    const validUnits = rawUnits.filter(u => u.trim() !== "");
    const units = validUnits.map((u, i) => ({
      id: `u-${Date.now()}-${i}`,
      title: u.trim(),
      isDone: false
    }));

    const newSubject: Subject & { isPinned: boolean } = {
      id: `sub-${Date.now()}`,
      name,
      color,
      unitsTotal: units.length,
      unitsDone: 0,
      units,
      isPinned: true,
    };
    
    setSubjects((prev) => [...prev, newSubject]);
    await supabase.from('subjects').insert({
      id: newSubject.id, name: newSubject.name, color: newSubject.color,
      units_total: newSubject.unitsTotal, units_done: newSubject.unitsDone,
      units: newSubject.units, is_pinned: newSubject.isPinned
    });
  };

  const removeSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('subjects').delete().eq('id', id);
  };
  
  const addAssignment = async (subjectId: string, title: string, deadline: string, rawNotes: string[]) => {
    const keepInMind = rawNotes.filter(n => n.trim() !== "");
    const newAssignment: Assignment & { isPinned: boolean } = {
      id: `asn-${Date.now()}`,
      subjectId,
      title,
      deadline,
      keepInMind,
      status: "pending",
      isPinned: true,
    };
    setAssignments((prev) => [...prev, newAssignment]);
    await supabase.from('assignments').insert({
      id: newAssignment.id, subject_id: newAssignment.subjectId, title: newAssignment.title,
      deadline: newAssignment.deadline, keep_in_mind: newAssignment.keepInMind, 
      status: newAssignment.status, is_pinned: newAssignment.isPinned
    });
  };

  const removeAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    await supabase.from('assignments').delete().eq('id', id);
  };

  const addRoadmap = async (title: string, rawMilestones: {title: string, completed: boolean}[]) => {
    const valid = rawMilestones.filter(m => m.title.trim() !== "");
    const milestones = valid.map((m, i) => ({
      id: `m-${Date.now()}-${i}`,
      title: m.title.trim(),
      isDone: m.completed
    }));

    const newRoadmap: Roadmap & { isPinned: boolean } = {
      id: `rm-${Date.now()}`,
      title,
      milestonesTotal: milestones.length,
      milestonesDone: milestones.filter(m => m.isDone).length,
      milestones,
      isPinned: true,
    };
    setRoadmaps((prev) => [...prev, newRoadmap]);
    await supabase.from('roadmaps').insert({
      id: newRoadmap.id, title: newRoadmap.title, milestones_total: newRoadmap.milestonesTotal,
      milestones_done: newRoadmap.milestonesDone, milestones: newRoadmap.milestones, is_pinned: newRoadmap.isPinned
    });
  };

  const removeRoadmap = async (id: string) => {
    setRoadmaps((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('roadmaps').delete().eq('id', id);
  };

  const toggleSubjectPin = async (id: string) => {
    let pinState = false;
    setSubjects(prev => prev.map(s => {
      if (s.id === id) { pinState = !s.isPinned; return { ...s, isPinned: pinState }; }
      return s;
    }));
    await supabase.from('subjects').update({ is_pinned: pinState }).eq('id', id);
  };

  const toggleAssignmentPin = async (id: string) => {
    let pinState = false;
    setAssignments(prev => prev.map(a => {
      if (a.id === id) { pinState = !a.isPinned; return { ...a, isPinned: pinState }; }
      return a;
    }));
    await supabase.from('assignments').update({ is_pinned: pinState }).eq('id', id);
  };

  const toggleRoadmapPin = async (id: string) => {
    let pinState = false;
    setRoadmaps(prev => prev.map(r => {
      if (r.id === id) { pinState = !r.isPinned; return { ...r, isPinned: pinState }; }
      return r;
    }));
    await supabase.from('roadmaps').update({ is_pinned: pinState }).eq('id', id);
  };

  // ---- DOCK LOGIC ----
  const stageItem = (item: StagedItem) => {
    if (!stagedItems.find(i => i.id === item.id)) {
      setStagedItems(prev => [...prev, item]);
    }
  };

  const unstageItem = (id: string) => {
    setStagedItems(prev => prev.filter(i => i.id !== id));
  };

  const clearStagedItems = () => {
    setStagedItems([]);
  };

  // ---- DRAFT LOGIC ----
  const saveDraft = async (draft: DraftCard) => {
    let exists = false;
    setDrafts(prev => {
      exists = !!prev.find(d => d.id === draft.id);
      if (exists) {
        return prev.map(d => d.id === draft.id ? draft : d);
      }
      return [...prev, draft];
    });

    const payload = {
      id: draft.id,
      source_id: draft.sourceId,
      title: draft.title,
      topics: draft.topics,
      timer_minutes: draft.timerMinutes
    };

    if (exists) {
      await supabase.from('drafts').update(payload).eq('id', draft.id);
    } else {
      await supabase.from('drafts').insert(payload);
    }
  };

  const removeDraft = async (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    await supabase.from('drafts').delete().eq('id', id);
  };

  return (
    <AppStateContext.Provider value={{
      tools, subjects, assignments, roadmaps, drafts, stagedItems,
      addTool, removeTool, toggleToolPin,
      addSubject, addAssignment, addRoadmap,
      removeSubject, removeAssignment, removeRoadmap,
      stageItem, unstageItem, clearStagedItems,
      saveDraft, removeDraft,
      toggleSubjectPin, toggleAssignmentPin, toggleRoadmapPin,
      sidebarFont, textFont, cardFont,
      setSidebarFont: handleSetSidebarFont,
      setTextFont: handleSetTextFont,
      setCardFont: handleSetCardFont,
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
}
