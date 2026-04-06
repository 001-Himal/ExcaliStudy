# ExcaliStudy: Project Overview & Architecture

This document tracks the ongoing architectural decisions and scaling strategies for **ExcaliStudy** (formerly Anchor). It serves as a unified source of truth for the codebase's evolution, allowing any developer to understand the "why" and "how" behind the project architecture.

For the chronological history of feature implementations, refer to **[DEV_TIMELINE.md](./DEV_TIMELINE.md)**.
For AI-specific context and development rules, refer to **[AI_KNOWLEDGE_BASE.md](./AI_KNOWLEDGE_BASE.md)**.

---

## Architecture & Directory Scaling

### Directory Structure
```text
ExcaliStudy/
├── app/                  # Next.js App Router (Pages, Layouts, API routes)
│   ├── globals.css       # Core styling & Tailwind directive imports
│   └── (features)...     # e.g., /subjects, /tools, /roadmaps
├── components/           # UI Components
│   ├── excalidraw/       # Core platform canvas/sidebar components (AppStateContext, Canvas)
│   │   ├── nodes.tsx     # React Flow custom node definitions
│   │   └── AppStateContext.tsx # Centralized State Management bound to Supabase
│   └── ui/               # Generic, reusable components (shadcn/ui origins)
├── database/             # External backend configuration maps & schemas
│   └── 01_schema.sql     # Supabase SQL initialization logic
├── docs/                 # Project documentation and timelines, AI knowledge base
├── lib/                  # Utilities, mock data, and 3rd party initializations
│   └── supabase.ts       # Supabase client singleton
└── public/               # Static assets
```

### How to Scale the Project Directory
As the project grows, consider the following structural evolutions:
1. **Feature-Based Module Grouping**: Instead of dumping everything into `/components/excalistudy/`, eventually split into `/components/canvas/`, `/components/sidebar/`, and `/components/dashboard/`.
2. **Custom Hooks**: Extract complex logical chunks out of the `AppStateContext` into dedicated files like `hooks/useDrafts.ts` or `hooks/useRoadmaps.ts` to keep the context provider file size manageable.
3. **Database Versioning**: If updating schemas, add sequenced files in `database/` (e.g., `02_add_auth.sql`, `03_table_migrations.sql`) to keep a reliable paper trail.

---

## Supabase & Data Scaling

The application currently prioritizes speed of frontend iterations. As such:
- **Nested Data (JSONB)**: Concepts that are intrinsically tied to their parent (like `units` inside a `subject`, or `topics` inside a `draft`) are stored as deep JSON arrays (`JSONB`). This maps directly 1:1 with React state avoiding cumbersome nested SQL joins over simple arrays.

### How to Scale Database Architecture
As the project shifts from a single-user / prototype environment to a multi-tenant platform:
1. **Adding Authentication:** 
   We will integrate Supabase Auth. At this phase, we must update all tables to include a `user_id uuid references auth.users` column.
2. **Hardening RLS (Row Level Security):** 
   Right now, the tables have `Enable RLS` toggled true, but have placeholder rules allowing `public` CRUD access. Once Auth is active, these policies will change to `USING (auth.uid() = user_id)`.
3. **Migrating away from JSONB (Optional):** 
   If `units` or `topics` grow very large or require independent indexing/sharing (e.g. users sharing specific topics), the JSONB columns should be factored out into relational normalized tables (`subject_units`, `working_card_topics`).

---

## Future Roadmap & Known Fixes

1. **Authentication / Multi-tenant Logic**: Migrate the global unauthenticated system to personalized accounts relying on Supabase built-in auth utilities and route-guards.
2. **Dynamic Dock Interaction**: The Staging Dock is implemented to hold `staged_items`. Future scaling can connect the staged items dock to more robust spatial operating-system behaviors and keyboard shortcuts.
3. **Performance/Canvas Optimization**: As nodes grow on the React Flow canvas, implement dynamic virtualization and limit auto-saving throttles to prevent Supabase thrashing.
