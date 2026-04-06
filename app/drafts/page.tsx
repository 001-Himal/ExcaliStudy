"use client";

import { useAppState } from "@/components/excalistudy/AppStateContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Edit2, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DraftsPage() {
  const { drafts, deleteDraft, saveDraft } = useAppState();
  const router = useRouter();
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

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
            <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
            <p className="text-muted-foreground text-sm">Manage your in-progress study sessions and working cards.</p>
          </div>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            <p>You have no saved drafts.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>Return to Canvas</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft: any) => (
              <div key={draft.id} className="group relative border bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{draft.title}</h3>
                  <Badge variant="secondary" className="font-mono text-xs whitespace-nowrap">{draft.timerMinutes} min</Badge>
                </div>
                
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">{draft.topics?.length || 0} topics included.</p>
                  <div className="flex flex-col gap-1 max-h-[80px] overflow-hidden text-sm">
                    {draft.topics?.slice(0, 3).map((t: any) => (
                      <div key={t.id} className="flex items-center gap-2 text-muted-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.isDone ? 'bg-green-500' : 'bg-border'}`} />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {(draft.topics?.length || 0) > 3 && (
                      <div className="text-xs text-muted-foreground italic pl-3.5">+ {(draft.topics?.length || 0) - 3} more</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <p className="text-[10px] text-muted-foreground font-mono truncate mr-2" title={draft.id}>
                    ID: {draft.id.split('-').pop()}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDraftToDelete(draft.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {draftToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-background max-w-sm w-full rounded-2xl shadow-xl border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-2">Delete Draft?</h2>
            <p className="text-muted-foreground text-sm mb-6">This action cannot be undone. Are you sure you want to permanently delete this draft?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDraftToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                deleteDraft(draftToDelete);
                setDraftToDelete(null);
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
