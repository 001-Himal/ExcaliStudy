import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from "@xyflow/react";
import { CheckSquare, Square, Trash2, Play, Pause, RotateCcw, Save, GitBranch, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppState } from "./AppStateContext";

const CardWrapper = ({ children, className = "", cardFont = "", selected, resizable = false, minW = 260 }: { children: React.ReactNode; className?: string, cardFont?: string, selected?: boolean, resizable?: boolean, minW?: number }) => (
  <>
    {resizable && (
      <NodeResizer 
        isVisible={selected} 
        minWidth={minW} 
        minHeight={150} 
        handleStyle={{ width: 12, height: 12, border: 'none', background: 'transparent', right: 0, bottom: 0, zIndex: 10 }}
        lineStyle={{ border: 'none' }}
      />
    )}
    <div className={`bg-card text-card-foreground p-3 rounded-md border-[1.5px] border-card-border shadow-card h-full w-full relative ${className}`} style={{ minWidth: minW }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {children}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      {resizable && selected && (
        <div className="absolute right-1 bottom-1 w-3 h-3 cursor-nwse-resize opacity-30 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
        </div>
      )}
    </div>
  </>
);

export function AssignmentNode({ data }: NodeProps) {
  const { assignments, subjects, cardFont, updateAssignment } = useAppState();
  const asn = assignments.find(a => a.id === data.originalId);
  
  if (!asn) return <CardWrapper cardFont={cardFont}>Assignment not found</CardWrapper>;

  const subject = subjects.find((s) => s.id === asn.subjectId);
  const diff = new Date(asn.deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  let badgeColor = "text-muted-foreground";
  if (days < 0) badgeColor = "text-destructive font-bold";
  else if (days === 0) badgeColor = "text-orange-500 font-bold";
  else if (days <= 3) badgeColor = "text-accent font-bold";

  return (
    <CardWrapper cardFont={cardFont} className={days < 0 ? "border-l-4 border-l-destructive" : ""}>
      <div className="flex gap-2 items-start mb-2">
        <button onClick={() => updateAssignment(asn.id, { status: asn.status === "submitted" ? "pending" : "submitted" })} className="mt-0.5 text-foreground">
          {asn.status === "submitted" ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
        </button>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg leading-tight ${asn.status === "submitted" ? "line-through text-muted-foreground" : ""}`}>
            {asn.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Subject: {subject?.name || "Unknown"} • Due: {new Date(asn.deadline).toLocaleDateString()}
          </p>
          <p className={`text-sm mt-0.5 ${badgeColor}`}>
            ⏱ {days < 0 ? "Overdue" : days === 0 ? "Today" : `${days} days remaining`}
          </p>
        </div>
      </div>
      
      <div className="h-[1.5px] bg-border my-2" />
      
      <div>
        <p className="text-sm font-semibold mb-1">Keep in mind:</p>
        <ul className="text-sm text-muted-foreground font-sans list-disc list-inside">
          {asn.keepInMind.map((point, idx) => (
            <li key={idx} className="mb-0.5">{point}</li>
          ))}
        </ul>
      </div>
    </CardWrapper>
  );
}

export function SubjectNode({ id, data }: NodeProps) {
  const { subjects, cardFont, toggleSubjectUnit } = useAppState();
  const sub = subjects.find(s => s.id === data.originalId);
  const { addNodes, getNode } = useReactFlow();

  if (!sub) return <CardWrapper cardFont={cardFont}>Subject not found</CardWrapper>;

  const handleBranch = (unit: any) => {
    const thisNode = getNode(id);
    const xPos = thisNode ? thisNode.position.x + 320 : 0;
    const yPos = thisNode ? thisNode.position.y : 0;

    const newNodeId = `working-${Date.now()}`;
    addNodes({
      id: newNodeId,
      type: "workingCard",
      position: { x: xPos, y: yPos },
      data: {
        id: newNodeId,
        sourceId: unit.id,
        title: `${sub.name} → ${unit.title}`,
        topics: [],
        timerMinutes: 45
      }
    });
  };

  const doneCount = sub.units.filter(u => u.isDone).length;
  const progressPercent = Math.round((doneCount / sub.unitsTotal) * 100) || 0;

  return (
    <CardWrapper cardFont={cardFont}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
        <h3 className="font-semibold text-lg">{sub.name}</h3>
      </div>
      
      <div className="flex items-center gap-2 mb-2 text-sm">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="text-muted-foreground whitespace-nowrap">{doneCount}/{sub.unitsTotal} units</span>
      </div>
      
      <div className="h-[1.5px] bg-border my-2" />
      
      <div className="flex flex-col gap-1">
        {sub.units.map(unit => {
          return (
            <div key={unit.id} className="flex items-center justify-between group p-1 rounded-sm hover:bg-black/5 transition-colors">
              <button onClick={() => toggleSubjectUnit(sub.id, unit.id)} className="flex items-center gap-2 text-left">
                <div className="text-muted-foreground">
                  {unit.isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-50" />}
                </div>
                <span className={`text-sm ${unit.isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>{unit.title}</span>
              </button>
              <button 
                onClick={() => handleBranch(unit)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] uppercase font-bold bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-sm transition-all hover:bg-accent"
              >
                <GitBranch className="w-3 h-3" /> Branch
              </button>
            </div>
          )
        })}
      </div>
    </CardWrapper>
  );
}

export function RoadmapNode({ id, data }: NodeProps) {
  const { roadmaps, cardFont, toggleRoadmapMilestone } = useAppState();
  const rm = roadmaps.find(r => r.id === data.originalId);
  const { addNodes, getNode } = useReactFlow();

  if (!rm) return <CardWrapper cardFont={cardFont}>Roadmap not found</CardWrapper>;

  const handleBranch = (milestone: any) => {
    const thisNode = getNode(id);
    const xPos = thisNode ? thisNode.position.x + 320 : 0;
    const yPos = thisNode ? thisNode.position.y : 0;

    const newNodeId = `working-${Date.now()}`;
    addNodes({
      id: newNodeId,
      type: "workingCard",
      position: { x: xPos, y: yPos },
      data: {
        id: newNodeId,
        sourceId: milestone.id,
        title: `${rm.title} → ${milestone.title}`,
        topics: [],
        timerMinutes: 45
      }
    });
  };

  const doneCount = rm.milestones.filter(m => m.isDone).length;
  const progressPercent = Math.round((doneCount / rm.milestonesTotal) * 100) || 0;

  return (
    <CardWrapper cardFont={cardFont}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🗺</span>
        <h3 className="font-semibold text-lg">{rm.title}</h3>
      </div>
      
      <div className="flex items-center gap-2 mb-2 text-sm">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="text-muted-foreground whitespace-nowrap">{doneCount}/{rm.milestonesTotal} done</span>
      </div>
      
      <div className="h-[1.5px] bg-border my-2" />
      
      <div className="flex flex-col gap-1">
        {rm.milestones.map(m => {
          return (
            <div key={m.id} className="flex items-center justify-between group p-1 rounded-sm hover:bg-black/5 transition-colors">
              <button onClick={() => toggleRoadmapMilestone(rm.id, m.id)} className="flex items-center gap-2 text-left">
                <div className="text-muted-foreground">
                  {m.isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-50" />}
                </div>
                <span className={`text-sm ${m.isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.title}</span>
              </button>
              <button 
                onClick={() => handleBranch(m)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] uppercase font-bold bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-sm transition-all hover:bg-accent"
              >
                <GitBranch className="w-3 h-3" /> Branch
              </button>
            </div>
          )
        })}
      </div>
    </CardWrapper>
  );
}

export function ToolNode({ data }: NodeProps) {
  const { tools, cardFont } = useAppState();
  const tool = tools.find(t => t.id === data.originalId);
  
  if (!tool) return <CardWrapper cardFont={cardFont}>Tool not found</CardWrapper>;

  return (
    <CardWrapper cardFont={cardFont} className="min-w-[200px]">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 shrink-0 bg-white border border-border flex items-center justify-center text-xs rounded-sm font-semibold">
          {(tool.title[0] || "T").toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{tool.title}</h3>
          <p className="font-mono text-xs text-muted-foreground">{tool.domain}</p>
        </div>
      </div>
      <a 
        href={tool.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 block text-center text-sm font-medium hover:underline text-foreground"
      >
        [Open →]
      </a>
    </CardWrapper>
  );
}

export function TextNoteNode({ data, selected }: NodeProps) {
  const [text, setText] = useState((data.text as string) || "");

  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={150} 
        minHeight={80} 
        handleStyle={{ width: 12, height: 12, border: 'none', background: 'transparent', right: 0, bottom: 0 }}
        lineStyle={{ border: 'none' }}
      />
      <div className="w-full h-full min-w-[150px] border border-transparent hover:border-border focus-within:border-border focus-within:bg-card hover:bg-card/50 transition-colors rounded-md p-2 relative">
        <textarea
          value={text as string}
          onChange={(e) => setText(e.target.value)}
          placeholder="click to type..."
          className="w-full h-full bg-transparent resize-none outline-none font-sans text-lg text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => e.stopPropagation()} 
        />
        {selected && (
          <div className="absolute right-1 bottom-1 w-2 h-2 cursor-nwse-resize opacity-20 pointer-events-none border-b-2 border-r-2 border-current rounded-br-[1px]" />
        )}
      </div>
    </>
  );
}

export function StickyNoteNode({ data, selected }: NodeProps) {
  const [text, setText] = useState((data.text as string) || "");

  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={150} 
        minHeight={150} 
        handleStyle={{ width: 12, height: 12, border: 'none', background: 'transparent', right: 0, bottom: 0 }}
        lineStyle={{ border: 'none' }}
      />
      <div className="w-full h-full min-w-[150px] bg-yellow-200 text-yellow-950 shadow-md p-4 transition-all focus-within:shadow-lg focus-within:-translate-y-1 relative" style={{ borderRadius: '2px 24px 2px 2px' }}>
        <textarea
          value={text as string}
          onChange={(e) => setText(e.target.value)}
          placeholder="Sticky note..."
          className="w-full h-full bg-transparent resize-none outline-none font-caveat text-xl placeholder:text-yellow-950/50"
          onKeyDown={(e) => e.stopPropagation()}
        />
        {selected && (
          <div className="absolute right-2 bottom-2 w-2 h-2 cursor-nwse-resize opacity-20 pointer-events-none border-b-2 border-r-2 border-current rounded-br-[1px]" />
        )}
      </div>
    </>
  );
}

export function WorkingCardNode({ id, data, selected }: NodeProps) {
  const { saveDraft, cardFont } = useAppState();
  const { deleteElements } = useReactFlow();
  
  const [topics, setTopics] = useState<{id: string, title: string, isDone: boolean}[]>((data.topics as any) || []);
  const [newTopic, setNewTopic] = useState("");
  const [timerMinutes, setTimerMinutes] = useState((data.timerMinutes as number) || 45);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerMinutes * 60);
  };
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTopic = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTopic.trim()) {
      setTopics([...topics, { id: `t-${Date.now()}`, title: newTopic.trim(), isDone: false }]);
      setNewTopic("");
    }
  };

  const toggleTopic = (tId: string) => {
    setTopics(topics.map(t => t.id === tId ? { ...t, isDone: !t.isDone } : t));
  };

  const handleSave = () => {
    saveDraft({
      id: (data.id as string) || `draft-${Date.now()}`,
      sourceId: data.sourceId as string,
      title: data.title as string,
      topics,
      timerMinutes
    });
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <CardWrapper cardFont={cardFont} selected={selected} resizable={true} className="flex flex-col">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="font-semibold text-lg max-w-[180px] break-words leading-tight flex-1">{data.title as string}</h3>
        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => deleteElements({ nodes: [{ id }] })} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors flex bg-background border border-border shadow-sm">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button onClick={handleSave} className="text-xs flex items-center gap-1 bg-accent/10 hover:bg-accent text-accent-foreground px-2 py-1 rounded-sm transition-colors border border-accent/20 h-fit w-full justify-center">
            <Save className="w-3 h-3" /> Save Draft
          </button>
        </div>
      </div>

      <div className="bg-muted rounded-md p-2 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            value={timerMinutes} 
            onChange={e => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              setTimerMinutes(val);
              if (!isActive) setTimeLeft(val * 60);
            }}
            className="w-12 bg-transparent text-right font-mono text-sm outline-none border-b border-border nodrag"
            disabled={isActive}
          />
          <span className="text-sm text-muted-foreground mr-2">min</span>
        </div>
        <div className="font-mono text-xl font-bold">{formatTime(timeLeft)}</div>
        <div className="flex gap-1">
          <button onClick={toggleTimer} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={resetTimer} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[1.5px] bg-border my-2" />

      <div className="flex flex-col gap-1 mb-2 max-h-[200px] overflow-y-auto pr-1">
        {topics.map(t => (
          <button 
            key={t.id} 
            onClick={() => toggleTopic(t.id)}
            className="flex items-start gap-2 text-left hover:bg-black/5 p-1 rounded-sm transition-colors"
          >
            <div className="mt-0.5 shrink-0 text-foreground">
              {t.isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </div>
            <span className={`text-sm ${t.isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {t.title}
            </span>
          </button>
        ))}
      </div>

      <input 
        type="text"
        value={newTopic}
        onChange={e => setNewTopic(e.target.value)}
        onKeyDown={handleAddTopic}
        placeholder="+ Add topic (Enter)"
        className="w-full text-sm bg-transparent border-b border-transparent hover:border-border focus:border-accent outline-none pb-1 transition-colors nodrag"
      />
    </CardWrapper>
  );
}
