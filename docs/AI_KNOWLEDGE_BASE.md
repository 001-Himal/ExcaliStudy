# AI Knowledge Base & Context

This file is a centralized repository of project patterns for AI code assistants and engineers working on **ExcaliStudy**. Read this before suggesting architectural changes.

## 1. Project Background
ExcaliStudy is an Excalidraw-inspired desktop-only study organizer.
- **Legacy Name:** Anchor
- **Current Core Prefix:** Everything uses the "ExcaliStudy" name, but the core technical component folder is typically `components/excalistudy/`.
- **Primary View:** It is a single-screen application centered on an interactive, infinite canvas powered by `@xyflow/react` (React Flow).

## 2. Core Technologies
- **Framework:** Next.js 16 (App Router), React 19.
- **State & Data:** Client-heavy state. `components/excalistudy/AppStateContext.tsx` is the monolithic provider managing all CRUD state mapped directly to a Supabase backend.
- **Styling:** Tailwind CSS (specifically utility classes like `bg-card`, `text-card-foreground`). Themes use `next-themes`.

## 3. The React/Supabase Data Pattern
To decouple heavy frontend iterations from database joins, **nested data is stored using Supabase JSONB arrays**.
- An `Assignment` row stores its `keep_in_mind` list as `JSONB`.
- A `Subject` row stores its `units` (which have their own ids and `isDone` statuses) as `JSONB`.
- **IMPORTANT RULE:** When making updates, always modify the full array in local React state first, then upload the fully modified JSONB array back to Supabase. This avoids complex partial-array SQL queries and keeps the AppState context hook completely synchronously synced for the user UI.

## 4. The Canvas ("nodes.tsx")
The canvas runs on React Flow but behaves like an unbounded whiteboard.
- All cards placed on the canvas are defined in `components/excalistudy/nodes.tsx`.
- React Flow elements map to database concepts: `SubjectNode`, `AssignmentNode`, `RoadmapNode`, and `WorkingCardNode`.
- Data for these nodes is extracted *from* `AppStateContext`. Nodes use `data.originalId` to do a `.find()` within context to render live data seamlessly (so checking a checkbox on a canvas node immediately updates the Sidebar).

## 5. Avoiding Build Errors (Vercel)
- Vercel is case-sensitive (Linux), local dev (Windows/Mac) is not. Ensure all imports strictly match filename casing.
- **Deprecation Cleanups:** Do not leave un-used duplicate files during scaling that import older modules.
- **Supabase Fallbacks:** `supabaseUrl` can crash build operations in Next.js `next build` prerenders. `lib/supabase.ts` manages this fallback.

## 6. Development Ethos
- **Hand-drawn Aesthetic:** The UI must feel like a notebook using the `Caveat` font. Avoid heavy gradients and hyper-corporate polish. Use standard tailwind `md` or `lg` radii, but maintain minimal structural borders.
- **Don't Over-engineer:** ExcaliStudy prioritizes visual immediacy. Do not introduce complex Redux state trees or tRPC routers; rely on the central Context and Supabase client until extreme scale necessitates otherwise.
