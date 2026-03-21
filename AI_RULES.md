# AI Rules & Developer Guidelines

This document outlines the core technologies and strict rules for developing and modifying this application. When writing or refactoring code, always adhere to these guidelines to maintain consistency.

## Tech Stack Overview

This project is built using the following core technologies:

* **React 18 + Vite**: The core frontend framework and fast build tool.
* **TypeScript**: Used exclusively for all frontend logic to ensure type safety.
* **Tailwind CSS**: The primary styling solution, using custom utility classes and design tokens.
* **shadcn/ui & Radix UI**: Accessible, unstyled primitives acting as the foundation for the UI component library.
* **Supabase**: The complete backend-as-a-service (BaaS) handling PostgreSQL Database, Authentication, and Realtime subscriptions.
* **TanStack React Query**: Manages all asynchronous state, data fetching, caching, and mutations from Supabase.
* **React Router v6**: Handles all client-side routing.
* **Framer Motion**: Powers smooth UI animations, layout transitions, and presence animations.
* **Lucide React**: The standard icon library.
* **Sonner**: The toast notification system.

## Library Usage Rules

### 1. Styling & CSS
* **Rule**: Use **Tailwind CSS** for all styling.
* **Rule**: For conditional classes or merging Tailwind strings, always use the `cn()` utility from `@/lib/utils` (which utilizes `clsx` and `tailwind-merge`).
* **Avoid**: Do not write custom CSS or inline styles (`style={{...}}`) unless absolutely necessary for dynamic values (like dynamic colors from the database).

### 2. Data Fetching & State Management
* **Rule**: All server state interactions (fetching, inserting, updating, deleting) must use **TanStack React Query** (`useQuery`, `useMutation`).
* **Rule**: Keep database interactions organized. Custom data hooks should be placed in `src/hooks/useTripData.ts` and use the `@supabase/supabase-js` client from `@/integrations/supabase/client`.
* **Avoid**: Do not use `useEffect` for data fetching.

### 3. Authentication
* **Rule**: Always use the provided `useAuth` hook (`src/hooks/useAuth.tsx`) to access the current user, session, and auth methods (`signIn`, `signUp`, `signOut`).
* **Avoid**: Do not interact with `supabase.auth` directly inside UI components.

### 4. UI Components & Elements
* **Rule**: Utilize the existing **shadcn/ui** components located in `src/components/ui/`. 
* **Rule**: If a complex UI element is needed, check if a Radix UI primitive is already installed in `package.json` before building from scratch.
* **Avoid**: Do not install third-party component libraries (like Material UI, Chakra UI, Ant Design). 

### 5. Icons
* **Rule**: Exclusively use **Lucide React** (`lucide-react`) for all icons.

### 6. Animations
* **Rule**: Use **Framer Motion** (`framer-motion`) for complex transitions. Wrap conditionally rendered animated components in `<AnimatePresence>` and use `<motion.div>` for entering/exiting logic.

### 7. Dates and Times
* **Rule**: Use **date-fns** for all date parsing, formatting, and manipulation.

### 8. Notifications
* **Rule**: Use **Sonner** (`sonner`) for all user feedback notifications (e.g., `toast.success('Saved!')`).
* **Avoid**: Do not use native browser `alert()` or `confirm()` dialogs. For confirmations, use the shadcn `AlertDialog`.

### 9. Routing
* **Rule**: Define new routes in `src/App.tsx` using **React Router DOM**. Use `ProtectedRoute` or `PublicRoute` wrappers as necessary based on authentication requirements.