"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  X,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  Settings,
} from "lucide-react";
import { useAppState } from "./AppStateContext";
import { SketchyProgressBar } from "./SketchyProgress";
import Link from "next/link";

export function StudyPanel() {
  const {
    tools,
    subjects,
    drafts,
    assignments,
    roadmaps,
    projects,
    activeProjectId,
    deleteProject,
    isFocusMode,
    sidebarFont,
  } = useAppState();

  const [isOpen, setIsOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Listen for toggle-study-panel event (from Ctrl+B)
  React.useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-study-panel", handler);
    return () => window.removeEventListener("toggle-study-panel", handler);
  }, []);

  // Collapsible section states
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    assignments: true,
    subjects: true,
    roadmaps: false,
    drafts: true,
    projects: true,
    tools: false,
  });

  const toggleSection = (key: string) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Drag handlers for future canvas integration
  const onDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.setData("application/reactflow-id", id);
    e.dataTransfer.effectAllowed = "move";
    window.dispatchEvent(new Event("app-drag-start"));
  };

  const onDragEnd = () => {
    window.dispatchEvent(new Event("app-drag-end"));
  };

  if (isFocusMode) return null;

  return (
    <>
      {/* Toggle Button — fixed top-left, always visible when panel is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-[60px] left-3 z-[100] p-2 rounded-lg bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          title="Open Study Panel (Ctrl+B)"
        >
          <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full z-[100] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 280 }}
      >
        <div
          className={`h-full bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl ${sidebarFont}`}
        >
          {/* Header */}
          <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="text-sm font-black tracking-widest text-gray-800 dark:text-gray-200 select-none">
              EXCALISTUDY
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
            {/* ASSIGNMENTS */}
            <PanelSection
              title="Assignments"
              href="/assignments"
              isOpen={sectionsOpen.assignments}
              onToggle={() => toggleSection("assignments")}
            >
              {assignments
                .filter((a: any) => a.isPinned)
                .map((asn: any) => {
                  const subject = subjects.find(
                    (s: any) => s.id === asn.subjectId
                  );
                  const days = getDaysRemaining(asn.deadline);
                  let badgeColor = "bg-gray-100 dark:bg-gray-800 text-gray-500";
                  let badgeText = `${days}d`;
                  if (days < 0) {
                    badgeColor = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
                    badgeText = "Late";
                  } else if (days === 0) {
                    badgeColor = "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
                    badgeText = "Today";
                  } else if (days <= 3) {
                    badgeColor = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
                  }

                  return (
                    <PanelItem
                      key={asn.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, "assignment", asn.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        {subject && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                        )}
                        <span className="truncate flex-1 text-[13px]">
                          {asn.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                      </div>
                    </PanelItem>
                  );
                })}
            </PanelSection>

            <PanelDivider />

            {/* SUBJECTS */}
            <PanelSection
              title="Subjects"
              href="/subjects"
              isOpen={sectionsOpen.subjects}
              onToggle={() => toggleSection("subjects")}
            >
              {subjects
                .filter((s: any) => s.isPinned)
                .map((sub: any) => (
                  <PanelItem
                    key={sub.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, "subject", sub.id)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="truncate flex-1 text-[13px]">
                          {sub.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {sub.units.filter((u: any) => u.isDone).length}/
                          {sub.unitsTotal}
                        </span>
                      </div>
                      <SketchyProgressBar
                        value={Math.round(
                          (sub.units.filter((u: any) => u.isDone).length /
                            Math.max(sub.unitsTotal, 1)) *
                            100
                        )}
                        color={sub.color}
                        width={220}
                        height={4}
                      />
                    </div>
                  </PanelItem>
                ))}
            </PanelSection>

            <PanelDivider />

            {/* ROADMAPS */}
            <PanelSection
              title="Roadmaps"
              href="/roadmaps"
              isOpen={sectionsOpen.roadmaps}
              onToggle={() => toggleSection("roadmaps")}
            >
              {roadmaps
                .filter((r: any) => r.isPinned)
                .map((rm: any) => (
                  <PanelItem
                    key={rm.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, "roadmap", rm.id)}
                    onDragEnd={onDragEnd}
                  >
                    <span className="truncate text-[13px]">{rm.title}</span>
                  </PanelItem>
                ))}
            </PanelSection>

            <PanelDivider />

            {/* DRAFTS */}
            <PanelSection
              title="Drafts"
              href="/drafts"
              isOpen={sectionsOpen.drafts}
              onToggle={() => toggleSection("drafts")}
            >
              {drafts.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 italic">
                  No saved drafts.
                </div>
              )}
              {drafts.map((draft: any) => (
                <PanelItem
                  key={draft.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, "draft", draft.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <span className="truncate flex-1 text-[13px]">
                      {draft.title}
                    </span>
                    <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 px-1 rounded-sm shrink-0">
                      {draft.timerMinutes}m
                    </span>
                  </div>
                </PanelItem>
              ))}
            </PanelSection>

            <PanelDivider />

            {/* PROJECTS */}
            <PanelSection
              title="Projects"
              href="/projects"
              isOpen={sectionsOpen.projects}
              onToggle={() => toggleSection("projects")}
            >
              {projects.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 italic">
                  No saved projects.
                </div>
              )}
              {projects.map((proj: any) => (
                <div key={proj.id} className="flex items-center w-full">
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("app-request-save-and-load", {
                          detail: { id: proj.id },
                        })
                      );
                    }}
                    className={`flex-1 flex items-center gap-2 w-full text-[13px] h-[28px] rounded-md px-3 py-1 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeProjectId === proj.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <span className="truncate">{proj.title}</span>
                    {activeProjectId === proj.id && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(proj.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 shrink-0 h-[28px] flex items-center justify-center"
                    title="Delete Project"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="px-3 pt-1">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("app-request-save-as")
                    )
                  }
                  className="w-fit text-[12px] px-3 py-1 border rounded-md border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  + Save Current Canvas
                </button>
              </div>
            </PanelSection>

            <PanelDivider />

            {/* TOOLS */}
            <PanelSection
              title="Tools"
              href="/tools"
              isOpen={sectionsOpen.tools}
              onToggle={() => toggleSection("tools")}
            >
              {tools
                .filter((t: any) => t.isPinned)
                .map((tool: any) => (
                  <PanelItem
                    key={tool.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, "tool", tool.id)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[8px] rounded-sm font-semibold">
                        {(tool.title[0] || "T").toUpperCase()}
                      </div>
                      <span className="truncate text-[13px]">
                        {tool.title}
                      </span>
                    </div>
                  </PanelItem>
                ))}
            </PanelSection>
          </div>
        </div>
      </div>

      {/* Delete Project Confirmation */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-2">Delete Project?</h2>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Are you sure you want to permanently
              delete this project?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  deleteProject(projectToDelete);
                  setProjectToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Sub-components ─── */

function PanelSection({
  title,
  href,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  href: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex w-full items-center justify-between pt-2 pb-1 px-3">
        <Link
          href={href}
          className="text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {title}
        </Link>
        <button
          onClick={onToggle}
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronDown
            className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {isOpen && <div className="space-y-0.5 px-1">{children}</div>}
    </div>
  );
}

function PanelItem({
  children,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  children: React.ReactNode;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      className="flex items-center w-full cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1.5 transition-colors"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
    </div>
  );
}

function PanelDivider() {
  return <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3 my-1" />;
}
