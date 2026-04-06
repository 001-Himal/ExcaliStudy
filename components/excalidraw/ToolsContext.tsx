"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tool, MOCK_TOOLS } from "@/lib/mockData";

type ToolsContextType = {
  tools: Tool[];
  addTool: (url: string) => void;
  removeTool: (id: string) => void;
};

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([]);

  // Client-side hydration
  useEffect(() => {
    const stored = localStorage.getItem("Excalidraw_tools");
    if (stored) {
      setTools(JSON.parse(stored));
    } else {
      setTools(MOCK_TOOLS);
    }
  }, []);

  useEffect(() => {
    if (tools.length > 0) {
      localStorage.setItem("Excalidraw_tools", JSON.stringify(tools));
    }
  }, [tools]);

  const addTool = (url: string) => {
    try {
      const validUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(validUrl);
      const domain = urlObj.hostname.replace(/^www\./, "");
      const title = domain.split(".")[0];
      
      const newTool: Tool = {
        id: `t-${Date.now()}`,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        url: validUrl,
        domain,
      };
      setTools((prev) => [...prev, newTool]);
    } catch (e) {
      console.error("Invalid URL", e);
    }
  };

  const removeTool = (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToolsContext.Provider value={{ tools, addTool, removeTool }}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools() {
  const context = useContext(ToolsContext);
  if (!context) throw new Error("useTools must be used within ToolsProvider");
  return context;
}


