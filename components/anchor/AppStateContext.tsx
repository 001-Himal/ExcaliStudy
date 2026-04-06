"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tool, Subject, Assignment, Roadmap, DraftCard, MOCK_TOOLS, MOCK_SUBJECTS, MOCK_ASSIGNMENTS, MOCK_ROADMAPS } from "@/lib/mockData";

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
    const storedTools = localStorage.getItem("anchor_tools");
    if (storedTools) setTools(JSON.parse(storedTools));
    else setTools(MOCK_TOOLS.map(t => ({ ...t, isPinned: true })));

    const storedSubjects = localStorage.getItem("anchor_subjects");
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    else setSubjects(MOCK_SUBJECTS.map(s => ({ ...s, isPinned: true })));

    const storedAssignments = localStorage.getItem("anchor_assignments");
    if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
    else setAssignments(MOCK_ASSIGNMENTS.map(a => ({ ...a, isPinned: true })));

    const storedRoadmaps = localStorage.getItem("anchor_roadmaps");
    if (storedRoadmaps) setRoadmaps(JSON.parse(storedRoadmaps));
    else setRoadmaps(MOCK_ROADMAPS.map(r => ({ ...r, isPinned: true })));
    
    // Check for staged items
    const storedStaged = localStorage.getItem("anchor_staged");
    if (storedStaged) setStagedItems(JSON.parse(storedStaged));

    // Check for drafts
    const storedDrafts = localStorage.getItem("anchor_drafts");
    if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
  }, []);

  // Sync state arrays
  useEffect(() => {
    if (tools.length > 0) localStorage.getItem("anchor_tools") || localStorage.setItem("anchor_tools", JSON.stringify(tools));
    localStorage.setItem("anchor_tools", JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem("anchor_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("anchor_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("anchor_roadmaps", JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem("anchor_staged", JSON.stringify(stagedItems));
  }, [stagedItems]);

  useEffect(() => {
    localStorage.setItem("anchor_drafts", JSON.stringify(drafts));
  }, [drafts]);

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
  const addTool = (url: string) => {
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
    } catch (e) {
      console.error("Invalid URL", e);
    }
  };

  const removeTool = (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  };
  
  const toggleToolPin = (id: string) => {
    setTools((prev) => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  // ---- APP WIDE LOGIC ----

  const addSubject = (name: string, color: string, rawUnits: string[]) => {
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
      isPinned: true, // pin by default for better UX discovery
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const removeSubject = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));
  
  const addAssignment = (subjectId: string, title: string, deadline: string, rawNotes: string[]) => {
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
  };

  const removeAssignment = (id: string) => setAssignments((prev) => prev.filter((a) => a.id !== id));

  const addRoadmap = (title: string, rawMilestones: {title: string, completed: boolean}[]) => {
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
  };

  const removeRoadmap = (id: string) => setRoadmaps((prev) => prev.filter((r) => r.id !== id));

  const toggleSubjectPin = (id: string) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  const toggleAssignmentPin = (id: string) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  const toggleRoadmapPin = (id: string) => setRoadmaps(prev => prev.map(r => r.id === id ? { ...r, isPinned: !r.isPinned } : r));

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
  const saveDraft = (draft: DraftCard) => {
    setDrafts(prev => {
      const exists = prev.find(d => d.id === draft.id);
      if (exists) {
        return prev.map(d => d.id === draft.id ? draft : d);
      }
      return [...prev, draft];
    });
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
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
      sidebarFont,
      textFont,
      cardFont,
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
