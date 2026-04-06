# ExcaliStudy (Formerly Anchor)

**ExcaliStudy** is a spatial study environment designed to help you focus and organize your learning efficiently. Using an infinite canvas, you can drop reference notes, draft working cards, time your sessions, and plan your roadmaps—all in one place.

## Features

- **Infinite Study Canvas**: A drag-and-drop workspace powered by React Flow.
- **Working Cards**: Interactive cards with checklists and dedicated Pomodoro-style timers for distinct study sessions.
- **Cloud Persistence**: Instantly sync your Drafts, Assignments, Subject Modules, and Roadmaps to Supabase.
- **Customizable Environment**: Granular control over the fonts for your sidebar, generic text, and card/canvas text independently.
- **Dark/Light Modes**: Integrated seamless theme switching.

## Tech Stack

- **Frontend Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS, Shadcn/UI
- **Canvas Interface**: `xyflow/react` (React Flow)
- **Database/Persistence**: Supabase (utilizes JSONB models mapped to React state for speed and flexibility)
- **Deployment**: Vercel

## Setup and Getting Started

### Prerequisites

Make sure you have a [Supabase](https://supabase.com) project created.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/001-Himal/ExcaliStudy.git
   cd ExcaliStudy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env.local` (or create a new `.env.local` file).
   - Add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Initialize Database Schema:**
   Go to your Supabase project dashboard -> SQL Editor -> Create a new query.
   Copy the contents of `database/01_schema.sql` and run the script to generate the tables required for persistence.

5. **Start the local development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the canvas.

## Deployment

If deploying to Vercel, ensure you navigate to your Vercel Project **Settings -> Environment Variables** and add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

For a comprehensive technical architecture overview and development logs, see **[PROJECT.md](./PROJECT.md)**.
