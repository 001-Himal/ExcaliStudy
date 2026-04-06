"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageVisibilityWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // If we are on the homepage, there shouldn't be any pointer-events blocking the canvas
  return (
    <div className={`transition-opacity duration-300 ${isHomePage ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} ${className || ""}`}>
      {children}
    </div>
  );
}
