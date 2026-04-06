"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarTriggerConditional() {
  const { state } = useSidebar();

  if (state === "expanded") return null;

  return (
    <div className="pointer-events-auto absolute top-4 left-4 z-50">
      <SidebarTrigger className="bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white/80 transition-colors border" />
    </div>
  );
}
