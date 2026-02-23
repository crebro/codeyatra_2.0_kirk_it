# VDF — Video to Document Frames

Turn lecture and tutorial videos into visual study guides. VDF extracts the key frames from YouTube videos so you can study the slides, diagrams, and visuals without re-watching the entire video.

## How It Works

1. **Paste a link** — Drop any public YouTube URL.
2. **We find the key moments** — The compile service extracts unique frames with timestamps and captions.
3. **You study the frames** — Browse slides, read descriptions, and export to PDF.

## Features

- YouTube URL submission and async video compilation
- Frame-by-frame slide viewer with keyboard navigation (arrow keys)
- Per-frame captions and descriptions
- Export slides to PDF (via jsPDF)
- Rename and delete videos / individual frames
- Supabase Auth (email/password sign-up, login, password reset)
- Responsive UI with Tailwind CSS and shadcn/ui

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Auth & Database | [Supabase](https://supabase.com) (Auth, Postgres, SSR cookies) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + [Radix Primitives](https://www.radix-ui.com) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://database.new))

### 1. Clone the repo

```bash
git clone https://github.com/crebro/codeyatra_2.0_kirk_it.git
cd codeyatra_2.0_kirk_it
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# Compile service
COMPILE_REQUEST_SERVICE_URL=<url-of-compilation-backend>
NEXT_PUBLIC_COMPILE_REQUEST_SERVICE_BASEURL=<base-url-for-frame-images>

# Shared secrets
X_COMPILE_REQUEST_HEADER=<shared-secret-for-compile-service>
X_COMPLETION_HEADER=<shared-secret-for-completion-callback>
```

Both Supabase values can be found in your [project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                    # Landing page
  auth/                       # Login, sign-up, password flows
  protected/                  # Authenticated pages
    page.tsx                  #   URL input (home)
    files/page.tsx            #   Video file browser
    preview/[id]/page.tsx     #   Slide viewer
  api/
    completion/route.ts       # Callback from compile service
    protected/
      begin_compile/route.ts  # Trigger compilation
      delete_frames/route.ts  # Delete individual frames
      delete_video/route.ts   # Delete a video + frames
      rename_video/route.ts   # Rename a video
components/                   # Reusable UI and feature components
lib/supabase/                 # Supabase client helpers (browser, server, admin)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Team

**Codeyatra 2.0 — Kirk IT**

## License

This project is part of the Codeyatra 2.0 hackathon.
