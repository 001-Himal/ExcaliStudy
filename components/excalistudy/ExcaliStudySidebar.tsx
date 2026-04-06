"use client";

import { ChevronDown, GripVertical, User, Settings, X, PanelLeftClose } from "lucide-react";
import React from "react";
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import Link from "next/link";

export function ExcaliStudySidebar({ className }: { className?: string }) {
  const { tools, subjects, drafts, assignments, roadmaps, sidebarFont, projects, activeProjectId, loadProjectContext, deleteProject } = useAppState();
  const { toggleSidebar } = useSidebar();
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const onDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.setData("application/reactflow-id", id);
    e.dataTransfer.effectAllowed = "move";
    window.dispatchEvent(new Event('app-drag-start'));
  };

  const onDragEnd = () => {
    window.dispatchEvent(new Event('app-drag-end'));
  };

  return (
    <Sidebar className={`border-r-sidebar-border bg-sidebar ${sidebarFont} ${className || ""}`}>
      <SidebarHeader className="h-14 flex items-center px-4 relative">
        <Link href="/" className="text-base font-black font-sans text-primary tracking-widest hover:opacity-80 transition-opacity text-left focus:outline-none">
          EXCALISTUDY
        </Link>
        <button onClick={toggleSidebar} className="absolute right-2 top-3 p-1 rounded-md hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors">
          <PanelLeftClose className="h-5 w-5 transition-transform active:scale-95" />
        </button>
      </SidebarHeader>

      <SidebarContent>
        {/* ASSIGNMENTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/assignments" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Assignments
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {assignments.filter((a: any) => a.isPinned).map((asn: any) => {
                    const subject = subjects.find((s: any) => s.id === asn.subjectId);
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
                      <SidebarMenuItem key={asn.id}>
                        <SidebarMenuButton 
                           className="cursor-grab active:cursor-grabbing hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] border-l-2 border-transparent hover:border-[#F5E642]"
                           draggable 
                           onDragStart={(e) => onDragStart(e, "assignment", asn.id)}
                           onDragEnd={onDragEnd}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {subject && (
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: subject.color }}
                              />
                            )}
                            <span className="truncate flex-1">{asn.title}</span>
                            <Badge variant="secondary" className={`text-[11px] px-[6px] py-[2px] rounded-[4px] ${badgeColor} font-sans`}>
                              {badgeText}
                            </Badge>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <div className="h-[1px] bg-sidebar-border mx-4 my-1" />

        {/* SUBJECTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/subjects" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Subjects
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {subjects.filter((s: any) => s.isPinned).map((sub: any) => (
                    <SidebarMenuItem key={sub.id}>
                      <SidebarMenuButton
                        className="cursor-grab active:cursor-grabbing hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] border-l-2 border-transparent hover:border-[#F5E642]"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "subject", sub.id)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: sub.color }}
                          />
                          <span className="truncate">{sub.name}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        
        <div className="h-[1px] bg-sidebar-border mx-4 my-1" />

        {/* ROADMAPS */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/roadmaps" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Roadmaps
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {roadmaps.filter((r: any) => r.isPinned).map((rm: any) => (
                    <SidebarMenuItem key={rm.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] border-l-2 border-transparent hover:border-[#F5E642]"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "roadmap", rm.id)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{rm.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <div className="h-[1px] bg-sidebar-border mx-4 my-1" />

        {/* DRAFTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/drafts" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Drafts
                </Link>
                <div className="flex gap-1 ml-auto">
                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {drafts.length === 0 && (
                    <div className="px-5 py-2 text-xs text-muted-foreground italic">No saved drafts.</div>
                  )}
                  {drafts.map((draft: any) => (
                    <SidebarMenuItem key={draft.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] border-l-2 border-transparent hover:border-[#F5E642]"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "draft", draft.id)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="truncate flex-1">{draft.title}</span>
                          <span className="text-[10px] text-muted-foreground border px-1 rounded-sm">{draft.timerMinutes}m</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <div className="h-[1px] bg-sidebar-border mx-4 my-1" />

        {/* PROJECTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/projects" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Projects
                </Link>
                <div className="flex gap-1 ml-auto">
                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {projects.length === 0 && (
                    <div className="px-5 py-2 text-xs text-muted-foreground italic">No saved projects.</div>
                  )}
                  {projects.map((proj: any) => (
                    <SidebarMenuItem key={proj.id}>
                      <div className="flex items-center w-full">
                        <button
                          onClick={() => {
                            // Request canvas to save current first, then load
                            window.dispatchEvent(new CustomEvent("app-request-save-and-load", { detail: { id: proj.id } }));
                          }}
                          className={`flex-1 flex items-center gap-2 w-full hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] text-left border-l-2 hover:border-[#F5E642] ${activeProjectId === proj.id ? 'border-[#F5E642] bg-black/5' : 'border-transparent'}`}
                        >
                          <span className="truncate">{proj.title}</span>
                          {activeProjectId === proj.id && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
                          )}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setProjectToDelete(proj.id); }}
                          className="p-2 text-muted-foreground hover:text-destructive shrink-0 h-[28px] flex items-center justify-center"
                          title="Delete Project"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                  <div className="px-[8px] pt-1">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent("app-request-save-as"))}
                      className="w-fit text-[12px] px-3 py-1 border border-solid rounded-[5px] border-[#D4D0C8] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    >
                      + Save Current Canvas
                    </button>
                  </div>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <div className="h-[1px] bg-sidebar-border mx-4 my-1" />

        {/* TOOLS */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between pt-[8px] pb-[4px] px-[8px]">
                <Link href="/tools" className="text-[11px] font-semibold tracking-[0.08em] text-[#8A8680] uppercase hover:text-foreground">
                  Tools
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-[12px] w-[12px] text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-[2px]">
                  {tools.filter((t: any) => t.isPinned).map((tool: any) => (
                    <SidebarMenuItem key={tool.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/[0.03] text-[13px] h-[28px] rounded-[5px] px-[8px] py-[5px] border-l-2 border-transparent hover:border-[#F5E642]"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "tool", tool.id)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 shrink-0 bg-white border border-border flex items-center justify-center text-[8px] rounded-sm">
                            {(tool.title[0] || "T").toUpperCase()}
                          </div>
                          <span className="truncate">{tool.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" className="w-full">
              <SidebarMenuButton className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground px-[12px] py-[8px] h-auto rounded-[5px]">
                <Settings className="size-4" />
                <span className="font-semibold text-[13px]">Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {projectToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-background max-w-sm w-full rounded-2xl shadow-xl border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-2 text-foreground">Delete Project?</h2>
            <p className="text-muted-foreground text-sm mb-6">This action cannot be undone. Are you sure you want to permanently delete this project?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setProjectToDelete(null)}>Cancel</button>
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
                deleteProject(projectToDelete);
                setProjectToDelete(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}



