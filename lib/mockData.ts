export type Subject = {
  id: string;
  name: string;
  color: string;
  unitsTotal: number;
  unitsDone: number;
  units: { id: string; title: string; isDone: boolean }[];
};

export type Assignment = {
  id: string;
  subjectId: string;
  title: string;
  deadline: string;
  keepInMind: string[];
  status: "pending" | "submitted";
};

export type Roadmap = {
  id: string;
  title: string;
  milestonesDone: number;
  milestonesTotal: number;
  milestones: { id: string; title: string; isDone: boolean }[];
};

export type Tool = {
  id: string;
  title: string;
  url: string;
  domain: string;
};

export type DraftCard = {
  id: string;
  sourceId: string;
  title: string;
  topics: { id: string; title: string; isDone: boolean }[];
  timerMinutes: number;
};

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "Operating Systems",
    color: "#4285F4", // blue
    unitsTotal: 5,
    unitsDone: 2,
    units: [
      { id: "u1", title: "Unit 1: Introduction", isDone: true },
      { id: "u2", title: "Unit 2: Process Management", isDone: true },
      { id: "u3", title: "Unit 3: Memory Management", isDone: false },
      { id: "u4", title: "Unit 4: File Systems", isDone: false },
      { id: "u5", title: "Unit 5: I/O Systems", isDone: false },
    ],
  },
  {
    id: "sub-2",
    name: "Data Structures",
    color: "#0F9D58", // green
    unitsTotal: 4,
    unitsDone: 0,
    units: [
      { id: "u11", title: "Arrays & Linked Lists", isDone: false },
      { id: "u12", title: "Trees & Graphs", isDone: false },
    ],
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asn-1",
    subjectId: "sub-1",
    title: "OS Notes PDF",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    keepInMind: ["Submit as PDF", "Cover page required", "Check formatting guidelines"],
    status: "pending",
  },
  {
    id: "asn-2",
    subjectId: "sub-2",
    title: "Graph Traversal Algo",
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // overdue 1 day
    keepInMind: ["Comments essential", "Include test cases"],
    status: "pending",
  },
];

export const MOCK_ROADMAPS: Roadmap[] = [
  {
    id: "rm-1",
    title: "Docker",
    milestonesTotal: 5,
    milestonesDone: 2,
    milestones: [
      { id: "m1", title: "Install Docker", isDone: true },
      { id: "m2", title: "Build first container", isDone: true },
      { id: "m3", title: "Docker Compose", isDone: false },
      { id: "m4", title: "Volumes & Networks", isDone: false },
      { id: "m5", title: "Push to Docker Hub", isDone: false },
    ],
  },
];

export const MOCK_TOOLS: Tool[] = [
  {
    id: "t-1",
    title: "Excalidraw",
    url: "https://excalidraw.com",
    domain: "excalidraw.com",
  },
  {
    id: "t-2",
    title: "ChatGPT",
    url: "https://chat.openai.com",
    domain: "chat.openai.com",
  },
];
