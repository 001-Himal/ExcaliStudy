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

export type ExcaliProject = {
  id: string;
  title: string;
  nodes: any[];
  edges: any[];
  updatedAt: string;
};

type AppStateContextType = {
  tools: (Tool & { isPinned?: boolean })[];
  subjects: (Subject & { isPinned?: boolean })[];
  assignments: (Assignment & { isPinned?: boolean })[];
  roadmaps: (Roadmap & { isPinned?: boolean })[];
  drafts: DraftCard[];
  stagedItems: StagedItem[];

  projects: ExcaliProject[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;

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

  // Edit Actions
  updateSubject: (id: string, name: string, color: string, units: string[]) => void;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment & { isPinned?: boolean }, 'id'>>) => void;
  toggleSubjectUnit: (subjectId: string, unitId: string) => void;
  toggleRoadmapMilestone: (roadmapId: string, milestoneId: string) => void;

  // Staging Dock Actions
  stageItem: (item: StagedItem) => void;
  unstageItem: (id: string) => void;
  clearStagedItems: () => void;
  
  // Draft Actions
  saveDraft: (draft: DraftCard) => void;
  deleteDraft: (id: string) => void;
  
  // Generic Pin Actions for mocks (would normally be in their specific controllers)
  toggleSubjectPin: (id: string) => void;
  toggleAssignmentPin: (id: string) => void;
  toggleRoadmapPin: (id: string) => void;

  // Project Actions
  saveProject: (title: string, nodes: any[], edges: any[], projectId?: string) => void;
  loadProjectContext: (id: string | null) => void;
  deleteProject: (id: string) => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<(Tool & { isPinned?: boolean })[]>([]);
  const [subjects, setSubjects] = useState<(Subject & { isPinned?: boolean })[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { isPinned?: boolean })[]>([]);
  const [roadmaps, setRoadmaps] = useState<(Roadmap & { isPinned?: boolean })[]>([]);
  const [drafts, setDrafts] = useState<DraftCard[]>([]);
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [projects, setProjects] = useState<ExcaliProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
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
        const storedDrafts = localStorage.getItem("Excalidraw_drafts");
        if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
      }

      // Staged items (keep transient in localStorage)
      const storedStaged = localStorage.getItem("Excalidraw_staged");
      if (storedStaged) setStagedItems(JSON.parse(storedStaged));

      // Load Projects from localStorage for persistence
      const storedProjects = localStorage.getItem("Excalidraw_projects");
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      const activeProjId = localStorage.getItem("Excalidraw_active_project");
      if (activeProjId) setActiveProjectId(activeProjId);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    localStorage.setItem("Excalidraw_staged", JSON.stringify(stagedItems));
  }, [stagedItems]);

  useEffect(() => {
    const sFont = localStorage.getItem("Excalidraw_sidebarFont");
    if (sFont) setSidebarFont(sFont);
    const tFont = localStorage.getItem("Excalidraw_textFont");
    if (tFont) setTextFont(tFont);
    const cFont = localStorage.getItem("Excalidraw_cardFont");
    if (cFont) setCardFont(cFont);
  }, []);

  const handleSetSidebarFont = (f: string) => {
    setSidebarFont(f);
    localStorage.setItem("Excalidraw_sidebarFont", f);
  };

  const handleSetTextFont = (f: string) => {
    setTextFont(f);
    localStorage.setItem("Excalidraw_textFont", f);
  };

  const handleSetCardFont = (f: string) => {
    setCardFont(f);
    localStorage.setItem("Excalidraw_cardFont", f);
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

  const updateSubject = async (id: string, name: string, color: string, rawUnits: string[]) => {
    const validUnits = rawUnits.filter(u => u.trim() !== "");
    // Gather all existing units from local state to preserve isDone status
    let newUnits: any[] = [];
    let newSubjectObj: any = null;
    
    setSubjects(prev => {
      const existingSub = prev.find(s => s.id === id);
      newUnits = validUnits.map((u, i) => {
        const titleTrimmed = u.trim();
        const existingUnit = existingSub?.units.find(x => x.title === titleTrimmed);
        if (existingUnit) return existingUnit;
        return { id: `u-${Date.now()}-${i}`, title: titleTrimmed, isDone: false };
      });
      
      const newProps = { 
        name, 
        color, 
        unitsTotal: newUnits.length,
        unitsDone: newUnits.filter(x => x.isDone).length,
        units: newUnits 
      };

      const newState = prev.map(s => {
        if (s.id === id) {
          newSubjectObj = { ...s, ...newProps };
          return newSubjectObj;
        }
        return s;
      });
      return newState;
    });

    if (newSubjectObj) {
      await supabase.from('subjects').update({
        name: newSubjectObj.name,
        color: newSubjectObj.color,
        units_total: newSubjectObj.unitsTotal,
        units_done: newSubjectObj.unitsDone,
        units: newSubjectObj.units
      }).eq('id', id);
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Omit<Assignment & { isPinned?: boolean }, 'id'>>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    
    const dbPayload: any = {};
    if (updates.subjectId !== undefined) dbPayload.subject_id = updates.subjectId;
    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.deadline !== undefined) dbPayload.deadline = updates.deadline;
    if (updates.keepInMind !== undefined) dbPayload.keep_in_mind = updates.keepInMind;
    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.isPinned !== undefined) dbPayload.is_pinned = (updates as any).isPinned;
    
    if (Object.keys(dbPayload).length > 0) {
      await supabase.from('assignments').update(dbPayload).eq('id', id);
    }
  };

  const toggleSubjectUnit = async (subjectId: string, unitId: string) => {
    let newSubjectObj: any = null;
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const newUnits = s.units.map(u => u.id === unitId ? { ...u, isDone: !u.isDone } : u);
        newSubjectObj = { ...s, units: newUnits, unitsDone: newUnits.filter(u => u.isDone).length };
        return newSubjectObj;
      }
      return s;
    }));
    
    if (newSubjectObj) {
      await supabase.from('subjects').update({
        units_done: newSubjectObj.unitsDone,
        units: newSubjectObj.units
      }).eq('id', subjectId);
    }
  };

  const toggleRoadmapMilestone = async (roadmapId: string, milestoneId: string) => {
    let newRoadmapObj: any = null;
    setRoadmaps(prev => prev.map(r => {
      if (r.id === roadmapId) {
        const newMilestones = r.milestones.map(m => m.id === milestoneId ? { ...m, isDone: !m.isDone } : m);
        newRoadmapObj = { ...r, milestones: newMilestones, milestonesDone: newMilestones.filter(m => m.isDone).length };
        return newRoadmapObj;
      }
      return r;
    }));

    if (newRoadmapObj) {
      await supabase.from('roadmaps').update({
        milestones_done: newRoadmapObj.milestonesDone,
        milestones: newRoadmapObj.milestones
      }).eq('id', roadmapId);
    }
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

  const deleteDraft = async (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    await supabase.from('drafts').delete().eq('id', id);
  };

  // ---- PROJECT LOGIC ----
  const saveProject = (title: string, nodes: any[], edges: any[], projectId?: string) => {
    setProjects(prev => {
      const existingId = projectId || activeProjectId;
      let newProjects;
      
      if (existingId) {
        newProjects = prev.map(p => p.id === existingId ? { ...p, title, nodes, edges, updatedAt: new Date().toISOString() } : p);
      } else {
        const newProject: ExcaliProject = {
          id: `proj-${Date.now()}`,
          title,
          nodes,
          edges,
          updatedAt: new Date().toISOString()
        };
        newProjects = [...prev, newProject];
        setActiveProjectId(newProject.id); // Set the newly created one as active
        localStorage.setItem("Excalidraw_active_project", newProject.id);
      }
      
      localStorage.setItem("Excalidraw_projects", JSON.stringify(newProjects));
      return newProjects;
    });
  };

  const loadProjectContext = (id: string | null) => {
    setActiveProjectId(id);
    if (id) {
      localStorage.setItem("Excalidraw_active_project", id);
    } else {
      localStorage.removeItem("Excalidraw_active_project");
    }
    // The actual replacing of nodes & edges will be handled via an event or effect inside Canvas
    window.dispatchEvent(new CustomEvent("app-load-project", { detail: { id } }));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const newProjects = prev.filter(p => p.id !== id);
      localStorage.setItem("Excalidraw_projects", JSON.stringify(newProjects));
      if (activeProjectId === id) {
        setActiveProjectId(null);
        localStorage.removeItem("Excalidraw_active_project");
      }
      return newProjects;
    });
  };

  return (
    <AppStateContext.Provider value={{
      // Data
      projects,
      activeProjectId,
      setActiveProjectId,
      tools, subjects, assignments, roadmaps, drafts, stagedItems,
      addTool, removeTool, toggleToolPin,
      addSubject, addAssignment, addRoadmap,
      removeSubject, removeAssignment, removeRoadmap,
      updateSubject, updateAssignment,
      toggleSubjectUnit, toggleRoadmapMilestone,
      stageItem, unstageItem, clearStagedItems,
      saveDraft, deleteDraft,
      toggleSubjectPin,
      toggleAssignmentPin,
      toggleRoadmapPin,
      saveProject,
      loadProjectContext,
      deleteProject,
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


