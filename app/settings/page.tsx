"use client";

import { useTheme } from "next-themes";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Button } from "@/components/ui/button";
import { X, Moon, Sun, Monitor, Type, Layout, Palette } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettingsPhase() {
  const { theme, setTheme } = useTheme();
  const { sidebarFont, setSidebarFont, textFont, setTextFont, cardFont, setCardFont } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fonts = [
    { value: "font-sans", label: "Sans" },
    { value: "font-serif", label: "Serif" },
    { value: "font-mono", label: "Mono" },
    { value: "font-caveat", label: "Handwritten" },
  ];

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50 w-full h-full bg-black/40 backdrop-blur-[2px] flex justify-center items-center p-4 animate-in fade-in duration-200">
      
      <div className="relative bg-background max-w-md w-full rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Settings</h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Environment Preference</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5">
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Appearance Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Palette className="h-4 w-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Appearance</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" },
                { id: "system", icon: Monitor, label: "System" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    theme === t.id 
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                      : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                  }`}
                >
                  <t.icon className={`h-4 w-4 ${theme === t.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground border-t pt-6">
              <Type className="h-4 w-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Typography</h2>
            </div>

            <div className="space-y-4">
              {/* Content Font */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground pl-1">Main Application</label>
                <div className="flex flex-wrap gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setTextFont(f.value)}
                      className={`px-3 py-1.5 rounded-md border text-[12px] transition-all ${f.value} ${
                        textFont === f.value 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Font */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground pl-1">Navigation & Sidebar</label>
                <div className="flex flex-wrap gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSidebarFont(f.value)}
                      className={`px-3 py-1.5 rounded-md border text-[12px] transition-all ${f.value} ${
                        sidebarFont === f.value 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Font */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground pl-1">Canvas Cards (Working Area)</label>
                <div className="flex flex-wrap gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setCardFont(f.value)}
                      className={`px-3 py-1.5 rounded-md border text-[12px] transition-all ${f.value} ${
                        cardFont === f.value 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <Link href="/">
            <Button className="h-9 px-6 rounded-lg text-sm font-semibold">Done</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
