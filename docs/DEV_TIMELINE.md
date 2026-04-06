# ExcaliStudy: Development Timeline

This document tracks the chronological sequence of architectural decisions and implementations for **ExcaliStudy**.

---

### Phase 1: Foundation & Conceptual UI
- **Pre-April 2026**: Initial layout, themes, sidebar navigation, infinite canvas base construction, and React Flow library integration.
- **April 05, 2026**: Standardized platform fonts layout and generic app UI refinements. Established MockData architectures in `AppStoreContext` binding strictly to `localStorage` for visual prototyping. Defined core behaviors like sticky notes functionality in the generic canvas.

### Phase 2: Supabase Integration & Brand Rename
- **April 06, 2026**: 
  - Connected platform successfully to Supabase for data persistence over transient Edge/Local storage environments.
  - Initialized `database/01_schema.sql` utilizing frontend-friendly JSONB structures.
  - Rewrote context hooks in `AppStateContext.tsx` to interface asynchronously via `@supabase/supabase-js`.
  - Added build-time fallbacks to `lib/supabase.ts` preventing `supabaseUrl is required` errors during Next.js deploy edge steps.
  - Renamed branding globally across `layout.tsx` metadata and sidebar DOM from **Anchor** to **ExcaliStudy** for a dedicated product feel.
  - Successfully renamed all internal references `components/anchor/*` folders to `components/excalistudy/*`, completing the full transition from the legacy prototype name.

### Phase 3: Working Cards & Core Stability
- **April 06, 2026**:
  - Implemented the "Working Card" system (Drafts) enabling dynamic branched checklist creation and a Pomodoro text timer component mapping directly to `.drafts` table on Supabase.
  - Finalized the ExcaliStudy naming cleanup by forcefully deleting the unused, deprecated `components/anchor/` directory to resolve Next.js Turbopack build crashes on Vercel (`Cannot find module './nodes'`).
  - Added centralized AI context mapping to streamline future feature scaling and PRD/Architecture understanding.

### Phase 4: UI Refinement & Workflow Optimization
- **April 07, 2026**:
  - **Sidebar Redesign**: Space-efficient layout, uppercase headers, and `PanelLeftClose` toggle with custom animations.
  - **Canvas Enhancements**: Capped `fitView` zoom at `1.0` on drops; integrated `NodeResizer` into interactive nodes.
  - **Workflow Overhaul**: Implemented drag-to-cancel zone and standardized safe-deletion protocols with confirmation dialogs.
  - **Standalone Management**: Decoupled Drafts and Projects into full-screen list/grid view pages.
  - **Settings Redesign**: Minimalist dialog-style settings with font/theme toggles.
