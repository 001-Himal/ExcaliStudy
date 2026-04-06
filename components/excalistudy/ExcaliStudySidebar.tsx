"use client";

import { ChevronDown, GripVertical, User, Settings, X } from "lucide-react";
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
  const { tools, subjects, drafts, assignments, roadmaps, sidebarFont } = useAppState();
  const { toggleSidebar } = useSidebar();

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const onDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.setData("application/reactflow-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sidebar className={`border-r-sidebar-border bg-sidebar ${sidebarFont} ${className || ""}`}>
      <SidebarHeader className="h-14 flex items-center px-4 relative">
        <h1 className="text-xl font-bold tracking-tight">ExcaliStudy</h1>
        <button onClick={toggleSidebar} className="absolute right-2 top-3 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </SidebarHeader>

      <SidebarContent>
        {/* ASSIGNMENTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between p-2">
                <Link href="/assignments" className="font-mono text-sm tracking-widest text-muted-foreground uppercase hover:text-foreground">
                  Assignments
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
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
                           className="cursor-grab active:cursor-grabbing hover:bg-black/5"
                           draggable 
                           onDragStart={(e) => onDragStart(e, "assignment", asn.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover/collapsible:opacity-100 shrink-0" />
                            {subject && (
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: subject.color }}
                              />
                            )}
                            <span className="truncate flex-1">{asn.title}</span>
                            <Badge variant="secondary" className={`text-[10px] px-1 py-0 ${badgeColor} font-sans`}>
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

        <div className="h-[1px] bg-sidebar-border mx-4 my-2" />

        {/* SUBJECTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between p-2">
                <Link href="/subjects" className="font-mono text-sm tracking-widest text-muted-foreground uppercase hover:text-foreground">
                  Subjects
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {subjects.filter((s: any) => s.isPinned).map((sub: any) => (
                    <SidebarMenuItem key={sub.id}>
                      <SidebarMenuButton
                        className="cursor-grab active:cursor-grabbing hover:bg-black/5"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "subject", sub.id)}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
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
        
        <div className="h-[1px] bg-sidebar-border mx-4 my-2" />

        {/* ROADMAPS */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between p-2">
                <Link href="/roadmaps" className="font-mono text-sm tracking-widest text-muted-foreground uppercase hover:text-foreground">
                  Roadmaps
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {roadmaps.filter((r: any) => r.isPinned).map((rm: any) => (
                    <SidebarMenuItem key={rm.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/5"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "roadmap", rm.id)}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
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

        <div className="h-[1px] bg-sidebar-border mx-4 my-2" />

        {/* DRAFTS */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between p-2">
                <span className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
                  Drafts
                </span>
                <div className="flex gap-1 ml-auto">
                  <CollapsibleTrigger>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {drafts.length === 0 && (
                    <div className="px-5 py-2 text-xs text-muted-foreground italic">No saved drafts.</div>
                  )}
                  {drafts.map((draft: any) => (
                    <SidebarMenuItem key={draft.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/5"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "draft", draft.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0 opacity-0 group-hover/collapsible:opacity-100" />
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

        <div className="h-[1px] bg-sidebar-border mx-4 my-2" />

        {/* TOOLS */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="p-0 h-auto w-full">
              <div className="flex w-full items-center justify-between p-2">
                <Link href="/tools" className="font-mono text-sm tracking-widest text-muted-foreground uppercase hover:text-foreground">
                  Tools
                </Link>
                <div className="flex gap-1 ml-auto">

                  <CollapsibleTrigger>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tools.filter((t: any) => t.isPinned).map((tool: any) => (
                    <SidebarMenuItem key={tool.id}>
                      <SidebarMenuButton 
                        className="cursor-grab active:cursor-grabbing hover:bg-black/5"
                        draggable 
                        onDragStart={(e) => onDragStart(e, "tool", tool.id)}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" className="w-full">
              <SidebarMenuButton size="lg" className="hover:bg-accent hover:text-accent-foreground font-mono">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Settings className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">Settings</span>
                  <span className="text-xs text-muted-foreground">Manage Theme & Fonts</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

