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
