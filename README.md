# Wandr

Wandr is a collaborative trip planning app for groups. It helps travelers organize itineraries, track shared expenses, manage checklists, coordinate members, and chat in one place.

## Live App

- https://plantrips.chetanchauhan.fun/

## Features

- Group trip dashboard with section-based navigation
- Day-by-day itinerary management
- Shared expense tracking and budget overview
- Checklist and packing list management
- Member management and role-based collaboration
- In-app comments/chat for trip discussions
- Auth and profile management with Supabase

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage, Realtime)
- TanStack Query
- Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### 1) Clone and install

```bash
git clone <your-repo-url>
cd plan-trips
npm install
```

### 2) Configure environment variables

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Set these required variables:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

### 3) Start development server

```bash
npm run dev
```

App runs on `http://localhost:8080`.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm test` - run Vitest tests
- `npm run test:watch` - run tests in watch mode

## Production Readiness Checks

Before deployment, run:

```bash
npm run lint
npm test
npm run build
npx tsc --noEmit
npm audit
```

## Project Structure

- `src/components/` - UI components and trip feature sections
- `src/pages/` - route-level pages
- `src/hooks/` - auth/data hooks
- `src/integrations/supabase/` - Supabase client and types
- `supabase/` - database migrations and config

## License

Private project. All rights reserved.
