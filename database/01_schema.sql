-- Supabase DB Schema
-- This schema allows you to add and remove data directly from the frontend.
-- We are using JSONB to store nested arrays (like units, milestones, topics) 
-- to exactly match the frontend local storage state structures and simplify operations.

-- 1. Tools Table
CREATE TABLE IF NOT EXISTS public.tools (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    units_total INTEGER DEFAULT 0,
    units_done INTEGER DEFAULT 0,
    units JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    keep_in_mind JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    milestones_total INTEGER DEFAULT 0,
    milestones_done INTEGER DEFAULT 0,
    milestones JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Drafts Table (Working Cards from Canvas)
CREATE TABLE IF NOT EXISTS public.drafts (
    id TEXT PRIMARY KEY,
    source_id TEXT,
    title TEXT NOT NULL,
    topics JSONB DEFAULT '[]'::jsonb,
    timer_minutes INTEGER DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Staged Items table (Items pushed to the docking area)
CREATE TABLE IF NOT EXISTS public.staged_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Because there is no user authentication yet, we'll enable Row Level Security (RLS)
-- but create policies that allow ALL SELECT, INSERT, UPDATE, DELETE operations anonymously.

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all public access to modify everything for now
CREATE POLICY "Allow public all operations on tools" ON public.tools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on roadmaps" ON public.roadmaps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on drafts" ON public.drafts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on staged_items" ON public.staged_items FOR ALL USING (true) WITH CHECK (true);
