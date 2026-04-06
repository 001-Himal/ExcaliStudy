"use client";

import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Code2, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { projects, deleteProject, activeProjectId, loadProjectContext } = useAppState();
  const router = useRouter();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-[40] w-full h-full bg-background flex flex-col p-8 sm:p-12 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-sm">Manage your saved canvases and workspaces.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            <p>You have no saved projects.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>Return to Canvas</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((proj: any) => {
              const isActive = proj.id === activeProjectId;
              const nodeCount = proj.nodes?.length || 0;
              const edgeCount = proj.edges?.length || 0;
              
              return (
                <div key={proj.id} className={`group relative border bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 ${isActive ? 'border-primary ring-1 ring-primary' : ''}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold text-lg line-clamp-1 leading-tight">{proj.title}</h3>
                    </div>
                    {isActive && (
                      <Badge variant="default" className="text-[10px] uppercase font-bold">Active</Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 py-2">
                    <p className="text-xs text-muted-foreground">Stats:</p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{nodeCount}</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Nodes</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{edgeCount}</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Edges</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t pt-4">
                     <Button 
                       variant={isActive ? "secondary" : "default"} 
                       className="w-full mr-2"
                       onClick={() => {
                         if (!isActive) {
                           window.dispatchEvent(new CustomEvent("app-request-save-and-load", { detail: { id: proj.id } }));
                           router.push("/");
                         } else {
                           router.push("/");
                         }
                       }}
                     >
                        {isActive ? "Return to Workspace" : "Open Workspace"}
                     </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setProjectToDelete(proj.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {projectToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-background max-w-sm w-full rounded-2xl shadow-xl border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-2">Delete Project?</h2>
            <p className="text-muted-foreground text-sm mb-6">This action cannot be undone. Are you sure you want to permanently delete this project and all its canvas data?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setProjectToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                deleteProject(projectToDelete);
                setProjectToDelete(null);
              }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'} ${className}`}>{children}</span>;
}
