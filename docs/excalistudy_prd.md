# ExcaliStudy — Product Requirements Document

**Version:** 2.0 (Major Revision — Canvas Architecture)
**Date:** April 2026
**Author:** Personal
**Status:** Ready to Build

---

## Changelog

| Version | Change |
|---|---|
| 1.0 | Initial dashboard-style PRD |
| 1.1 | Added Weekly View, Roadmap→Task spawn, Tools recent sort |
| 1.2 | All open questions resolved |
| 2.0 | Full architecture change — Excalidraw-style canvas, desktop-only, stripped back to core |
| 2.1 | UI Refinement: Standalone Drafts/Projects pages, NodeResizer, Dark Mode support, Multi-font settings |

---

## 1. What ExcaliStudy Is

A **desktop-only** personal study organiser built around an infinite canvas — like Excalidraw, but instead of drawing shapes, you drag your academic data onto it.

You open ExcaliStudy, see your canvas, drag your semester's subjects and assignments onto it, check things off, and close it. That's the core loop.

**It replaces the physical copy students use to:**
- Track pending assignments, deadlines, formats, notes
- See what's left to study per subject
- Keep a personal toolkit of productive websites
- Track long-term learning goals

**It does NOT try to be:**
- A calendar app
- A mobile app
- A Notion clone
- A week planner

**Primary platform:** Desktop web (laptop/desktop browser only)

---

## 2. Design System

### 2.1 Visual Language

**Style:** Excalidraw-inspired — hand-drawn, sketch-like, intentionally imperfect
**Feel:** Like a physical notebook, but digital. Warm, minimal, no corporate polish.
**References:** Excalidraw, Obsidian Canvas, physical grid notebooks

### 2.2 Colors

Mostly black and white. One warm accent only.

| Token | Value |
|---|---|
| Background (canvas) | `#FAFAF7` — warm off-white |
| Canvas grid dots | `#E0DDD6` — subtle dot grid |
| Surface / Cards | `#FFFFFF` |
| Card border | `#D4D0C8` — warm grey, slightly rough |
| Text primary | `#1A1916` — near black |
| Text muted | `#8A8680` |
| Accent | `#F5E642` — light yellow, used sparingly |
| Accent dark | `#D4C800` — hover state |
| Danger / overdue | `#D05050` |
| Sidebar background | `#F0EEE8` — slightly darker than canvas |
| Sidebar border | `#DDD9D0` |

**Theme Support:** v2.1 introduces a high-quality Dark Mode using `next-themes` with a carefully curated dark palette for the infinite canvas.

### 2.3 Typography

**Multi-font Environment** — v2.1 adds user preference for fonts across three scopes:
- **Application/Sidebar:** Choose between Sans (Inter), Serif (Outfit/Roboto Serif), or Mono.
- **Canvas Cards:** Handwritten (Caveat) is default for the "notebook" feel, but interchangeable via Settings.
- **Text Notes:** Fixed handwritten for the sketch aesthetic.

Import from Google Fonts. Caveat is the signature "sketch" font.

### 2.4 Canvas Aesthetic

- Dot grid background (like Excalidraw's dot canvas)
- Cards have slightly rough/rounded borders — `border-radius: 6px`, `border: 1.5px solid #D4D0C8`
- Subtle drop shadow on cards: `2px 3px 0px rgba(0,0,0,0.08)` — like a sticky note
- No gradients, no heavy shadows, no glassmorphism
- Toolbar elements look hand-placed, not corporate

---

## 3. Layout

### 3.1 Overall Structure

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │  Canvas (infinite)        │
│  240px / 52px           │  fills remaining space    │
│                         │                           │
│  [Assignments]          │   · · · · · · · · · · ·  │
│  [Semester/Subjects]    │   ┌──────────┐            │
│  [Roadmap]              │   │ card     │            │
│  ───────────────        │   └──────────┘            │
│  [Drafts] ──> /drafts   │   · · · · · · · · · · ·  │
│  [Projects] ─> /projects│                           │
│  ───────────────        │                           │
│  [Settings]             │                           │
└─────────────────────────────────────────────────────┘
```

### 3.2 Sidebar

**Collapsed state:** 52px wide — icons only, tooltip on hover
**Expanded state:** 240px wide — icons + section labels + content

**Collapse toggle:** Small arrow button on the right edge of sidebar, vertically centered

**Sections (top to bottom):**

1. **Assignments** — collapsible section
2. **Semester / Subjects** — collapsible section
3. **Roadmap** — collapsible section
4. `── divider ──`
5. **Tools** — collapsible section
6. `── divider ──`
7. **Profile** (bottom, always visible)
8. **Settings** (bottom, always visible)

Profile and Settings pinned to bottom like Claude's sidebar.

Each section header:
- Small section label in Caveat, muted, letter-spaced
- Chevron to collapse/expand
- "+" icon to add new item inline

### 3.3 Canvas

- Infinite, pannable with middle mouse button or spacebar + drag
- Zoomable with scroll wheel
- Dot grid always visible (subtle)
- Canvas state (card positions, zoom level) saved to Supabase on change

**Top toolbar (floating, centered top of canvas):**
- Select tool (cursor)
- Text note tool (click anywhere to add a free text note)
- Eraser (delete a card from canvas — does NOT delete the data, just removes from canvas)
- Zoom in / Zoom out / Reset zoom (100%)
- Clear canvas button (removes all cards, data stays in sidebar)

Toolbar style: pill-shaped floating bar, white background, subtle shadow, Caveat font labels

---

## 4. Authentication & Onboarding

### 4.1 Auth

Supabase Auth — Email + Google OAuth

### 4.2 Onboarding (one-time)

**Step 1 — Mode**
- School → "Class" terminology
- College → "Semester" terminology

**Step 2 — First term**
- Name, start date, end date

**Step 3 — Add subjects**
- At least 1 required

**Step 4 — Land on empty canvas with sidebar populated**
- First-time hint: "Drag a subject or assignment onto the canvas to get started"
- Hint disappears after first drag

---

## 5. Sidebar Sections

---

### 5.1 Assignments

List of all pending assignments across all subjects.

Each assignment row in sidebar:
- Assignment title (truncated if long)
- Subject tag (colored dot)
- Days remaining badge — "3 days" (yellow) / "Today" (orange) / "Overdue" (red)
- Drag handle on left

**Add assignment:** Click "+" in section header → inline form appears:
- Title, Subject (select), Deadline (date picker), Type

Full detail editing happens on the canvas card (not in sidebar).

---

### 5.2 Semester / Subjects

Hierarchical tree:

```
▼ Sem 4  (active term)
    ▶ Operating Systems
    ▶ Data Structures
    ▶ Computer Networks
  + Add subject
```

Each subject row: colored dot + name + drag handle

Clicking a subject in sidebar → expands to show its units inline in sidebar (compact list)

Dragging a subject onto canvas → places a full Subject Card on canvas

---

### 5.3 Roadmap

List of roadmaps:

```
▶ SDE Prep
▶ DSA
▶ Cloud
+ New roadmap
```

Each roadmap expandable to show topics inline in sidebar.

Dragging a roadmap/topic onto canvas → places a Roadmap Card on canvas.

---

### 5.4 Tools

List of bookmarked tools.

Each tool row: favicon + name + drag handle

Search bar at top of Tools section (searches name + tags).
Sort: Recently Opened (default).

Dragging a tool onto canvas → places a Tool Card (link card) on canvas.
Clicking a tool in sidebar → opens URL in new tab.

---

### 5.5 Profile & Settings (bottom)

Minimal — like Claude's sidebar bottom:
- Avatar + name (click → profile dropdown)
- Settings gear icon (click → settings drawer)

---

## 6. Canvas Cards

Everything dragged onto the canvas becomes a **card**. Cards are movable, resizable via a corner handle (`NodeResizer`), and deletable from canvas (data stays in sidebar).

---

### 6.1 Assignment Card

```
┌─────────────────────────────────┐
│ ☐  Operating Systems Notes      │
│     Subject: OS  •  Due: Apr 8  │
│     ⏱ 3 days remaining          │
│  ─────────────────────────────  │
│  Keep in mind:                  │
│  - Submit as PDF                │
│  - Cover page required          │
│  - Check formatting guidelines  │
└─────────────────────────────────┘
```

- Checkbox top left: marks assignment as submitted
- Title (Caveat 600, 16px)
- Subject dot + name, deadline date
- Days remaining: yellow if >2 days, orange if 1-2 days, red if overdue
- Keep in mind: plain text, bullet list, Caveat 400 14px
- Click card to open edit drawer (full fields)
- Overdue: card gets a soft red left border

---

### 6.2 Subject Card

```
┌─────────────────────────────────┐
│  📘 Operating Systems           │
│  ████████░░░░  6/10 units done  │
│  ─────────────────────────────  │
│  ☑ Unit 1: Introduction         │
│  ☑ Unit 2: Process Management   │
│  ☐ Unit 3: Memory Management    │
│  ☐ Unit 4: File Systems         │
│  ☐ Unit 5: I/O Systems          │
│  + Add unit                     │
└─────────────────────────────────┘
```

- Subject name + color dot header
- Progress bar (yellow fill, grey track)
- All units listed with checkboxes
- Check unit → marks done, progress bar updates
- "+ Add unit" inline at bottom
- Card is taller — scrollable if many units

---

### 6.3 Roadmap Card

```
┌─────────────────────────────────┐
│  🗺 Docker                      │
│  ███░░░░░  2/5 done             │
│  ─────────────────────────────  │
│  ☑ Install Docker               │
│  ☑ Build first container        │
│  ☐ Docker Compose               │
│  ☐ Volumes & Networks           │
│  ☐ Push to Docker Hub           │
└─────────────────────────────────┘
```

Same structure as Subject Card but for roadmap milestones.

---

### 6.4 Free Text Note Card

Created by the Text tool on toolbar (click anywhere on canvas).

```
┌─────────────────────────────────┐
│  click to type...               │
│                                 │
└─────────────────────────────────┘
```

Plain textarea, Caveat font, no border when not focused (looks like it's written directly on canvas). Border appears on hover/focus.

---

### 6.5 Tool Card (Link Card)

```
┌─────────────────────────────────┐
│  🌐  Excalidraw                 │
│  excalidraw.com                 │
│  [Open →]                       │
└─────────────────────────────────┘
```

Favicon + name + domain + open button. Minimal.

---

## 7. Data & Interactions

### 7.1 Canvas State Persistence

Every card's position (x, y), size (width), and which item it represents is saved to Supabase.

When user returns → canvas restores exactly as left.

"Clear canvas" removes all placed cards but data remains in sidebar.

### 7.2 Checkbox Sync

Checking a unit on a Subject Card → marks that unit done everywhere (sidebar + DB).
Checking an assignment → marks it submitted everywhere.
Checking a roadmap milestone → marks it done everywhere.

### 7.3 Days Remaining Calculation

Computed client-side: `deadline date - today's date = N days`

- `> 3 days` → muted text
- `2–3 days` → yellow `#F5E642` badge
- `1 day` → orange badge
- `Today` → orange bold
- `Overdue` → red `#D05050` badge + card left border turns red

---

## 8. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| Canvas | React Flow or custom canvas with drag logic |
| Components | shadcn/ui (base only, heavily restyled) |
| Icons | Lucide React |
| Font | Caveat (Google Fonts) |
| Auth | Supabase Auth (Email + Google) |
| Database | Supabase (PostgreSQL) |
| Favicon fetch | Google Favicons API |
| Hosting | Vercel |

> **Canvas library note:** React Flow handles node positioning, drag, pan/zoom out of the box. Cards are custom React Flow nodes. This is the fastest path to a working canvas without building pan/zoom from scratch.

---

## 9. Database Schema

```sql
-- profiles
profiles
  id             uuid references auth.users primary key
  mode           text        -- 'school' | 'college'
  created_at     timestamptz

-- terms
terms
  id             uuid primary key
  user_id        uuid references profiles
  name           text
  start_date     date
  end_date       date
  is_active      boolean default false

-- subjects
subjects
  id             uuid primary key
  term_id        uuid references terms
  user_id        uuid references profiles
  name           text
  color          text

-- units (syllabus)
units
  id             uuid primary key
  subject_id     uuid references subjects
  title          text
  is_done        boolean default false
  order_index    int

-- assignments
assignments
  id             uuid primary key
  subject_id     uuid references subjects
  user_id        uuid references profiles
  title          text
  type           text        -- 'assignment'|'exam'|'project'|'quiz'|'lab'
  deadline       date
  description    text
  format         text
  keep_in_mind   text
  status         text        -- 'pending'|'submitted'
  priority       text        -- 'low'|'medium'|'high'|'exam'
  created_at     timestamptz

-- roadmaps
roadmaps
  id             uuid primary key
  user_id        uuid references profiles
  title          text
  description    text

-- roadmap_topics
roadmap_topics
  id             uuid primary key
  roadmap_id     uuid references roadmaps
  title          text
  order_index    int

-- roadmap_milestones
roadmap_milestones
  id             uuid primary key
  topic_id       uuid references roadmap_topics
  title          text
  is_done        boolean default false
  order_index    int

-- tools
tools
  id             uuid primary key
  user_id        uuid references profiles
  url            text
  title          text
  favicon_url    text
  tags           text[]
  last_opened_at timestamptz nullable
  created_at     timestamptz

-- canvas_cards (positions of all cards on canvas)
canvas_cards
  id             uuid primary key
  user_id        uuid references profiles
  item_type      text        -- 'assignment'|'subject'|'roadmap_topic'|'tool'|'note'
  item_id        uuid nullable  -- null for free text notes
  content        text nullable  -- for free text notes only
  pos_x          float
  pos_y          float
  width          float default 280
  created_at     timestamptz
```

**RLS:** All tables have `user_id`. Enable Row Level Security with `user_id = auth.uid()` on every table.

---

## 10. MVP Scope (v1.0)

### In v1.0

- Auth: email + Google
- Onboarding: mode, first term, subjects
- Sidebar: all 5 sections working (Assignments, Subjects, Roadmap, Tools, Profile/Settings)
- Canvas: pan, zoom, dot grid, card placement, card drag/move
- Assignment cards: full fields, days remaining, checkbox
- Subject cards: units list, checkboxes, progress bar
- Roadmap cards: milestones, checkboxes
- Free text note cards
- Tool cards: link open
- Canvas state saved to Supabase
- Checkbox sync across canvas + sidebar + DB
- Tools: add, tag, search, recently-opened sort

### Deferred to v2

- Dark mode
- Mobile / responsive
- History / archive page
- Week view
- Notifications / reminders
- File attachments
- AI features
- Windows desktop app
- Job mode

---

## 11. Build Order

| # | What | Why |
|---|---|---|
| 1 | Auth + Onboarding | Foundation |
| 2 | Sidebar skeleton | Collapsible sidebar, all sections visible |
| 3 | Academics data (terms, subjects, units, assignments) | Core data layer |
| 4 | Basic canvas (pan, zoom, dot grid) | Canvas shell working |
| 5 | Drag from sidebar → canvas cards | Core interaction |
| 6 | Checkbox sync | Makes it actually useful |
| 7 | Assignment days remaining logic | High value, low effort |
| 8 | Tools section | Searchable bookmarks |
| 9 | Roadmap section | Learning goals |
| 10 | Polish (fonts, colors, empty states, transitions) | Makes it feel like ExcaliStudy |

---

## 12. What Makes ExcaliStudy Different

Most student tools feel like productivity software — Notion, Trello, Linear. They're powerful but cold.

ExcaliStudy feels like opening your notebook. The canvas is your desk. You pull out what you need, check things off, and put it back. The handwritten font, the dot grid, the warm off-white — it all feels like yours, not like enterprise software.

That's the bet: a tool that feels personal wins over a tool that has more features.

---

*Desktop only. Ship fast. Iterate from real daily use.*
