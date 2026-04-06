"use client";

import { useTheme } from "next-themes";
import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Button } from "@/components/ui/button";
import { X, Moon, Sun, Monitor } from "lucide-react";
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
    { value: "font-sans", label: "Sans (Clean)" },
    { value: "font-serif", label: "Serif (Elegant)" },
    { value: "font-mono", label: "Mono (Code)" },
    { value: "font-caveat", label: "Caveat (Handwritten)" },
  ];

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50 w-full h-full bg-black/20 backdrop-blur-sm flex justify-center items-center p-4 sm:p-8 animate-in fade-in duration-200">
      
      <div className="relative bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-2 p-8 sm:p-10 animate-in zoom-in-95 duration-300">
        <Link href="/">
          <Button variant="ghost" size="icon" className="absolute top-6 right-6 hover:bg-destructive/10 hover:text-destructive group transition-colors rounded-full">
            <X className="h-6 w-6 text-muted-foreground group-hover:text-destructive transition-colors shrink-0" strokeWidth={2.5} />
          </Button>
        </Link>

        <div className="space-y-12">
          <div className="space-y-2 text-left border-b pb-4">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm">Customize your study environment aesthetics.</p>
          </div>

        {/* Theme Settings */}
        <section className="space-y-6">
          <h2 className="text-xl mx-2 font-semibold border-b pb-2">Appearance</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-3 rounded-full bg-background shadow-sm border">
                <Sun className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-3 rounded-full bg-background shadow-sm border">
                <Moon className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-3 rounded-full bg-background shadow-sm border">
                <Monitor className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">System</span>
            </button>
          </div>
        </section>

        {/* Typography Settings */}
        <section className="space-y-6">
          <h2 className="text-xl mx-2 font-semibold border-b pb-2">Typography</h2>
          
          <div className="grid gap-8">
            <div className="space-y-3 p-4 border rounded-xl bg-card">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Main Content Font</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTextFont(f.value)}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${f.value} ${
                      textFont === f.value 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className={`pt-2 text-sm text-muted-foreground ${textFont}`}>This is how your notes and canvas items will read.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-xl bg-card">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sidebar Font</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSidebarFont(f.value)}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${f.value} ${
                      sidebarFont === f.value 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className={`pt-2 text-sm text-muted-foreground ${sidebarFont}`}>This is how your sidebar modules will look.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-xl bg-card">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Card Font</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setCardFont(f.value)}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${f.value} ${
                      cardFont === f.value 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className={`pt-2 text-sm text-muted-foreground ${cardFont}`}>This is how your interactive cards will look on the canvas.</p>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

