# Icarus Chat (Frontend) Architecture & Guidelines

This document outlines the architectural principles and coding standards for the `icarus-chat` frontend. Future agents and developers should follow these guidelines to maintain code quality and prevent technical debt.

## 1. Technology Stack
*   **Framework**: Next.js 14+ (App Router).
*   **Language**: TypeScript.
*   **Styling**: Tailwind CSS.
*   **UI Library**: Shadcn UI (based on Radix UI).
*   **Icons**: Lucide React.

## 2. Directory Structure
*   `app/`: **Routes & Layouts**. Prioritize Server Components here.
    *   `page.tsx`: Route entry point.
    *   `layout.tsx`: Shared layout wrappers.
*   `components/`: **UI Components**.
    *   `ui/`: Generic, atomic components (Buttons, Inputs).
    *   `dashboard/`, `ai-elements/`: Feature-specific components.
*   `hooks/`: **Custom React Hooks**. encapsulate state logic.
*   `lib/`: **Utilities**. Helper functions, type definitions, API clients.

## 3. Core Principles

### ❌ Anti-Pattern: Deep Prop Drilling
**Do NOT** pass data down through more than 2-3 layers of components.
*   **Bad**: Passing `classId` -> `StreamFeed` -> `StreamItem` -> `StreamAction`.
*   **Good**: Create a **Feature Context** (e.g., `ClassContext`) and consume it with a hook (`useClassContext`).

### ❌ Anti-Pattern: "God Components"
**Do NOT** put all logic in `page.tsx`.
*   **Bad**: `page.tsx` having 500 lines of `useState`, `useEffect`, and data fetching.
*   **Good**: Extract logic into custom hooks (e.g., `useClassData`) or specialized sub-components.

### ❌ Anti-Pattern: Hardcoded Styles
**Do NOT** use arbitrary values in Tailwind class names if tokens exist.
*   **Bad**: `bg-[#1e1e1e]`, `text-[14px]`
*   **Good**: `bg-muted`, `text-sm`, `text-primary`.

## 4. Client vs. Server Components
*   **Server Components (Default)**: Use for fetching data, accessing backend resources, and static layout.
*   **Client Components (`"use client"`)**: Use *only* when interactivity (state, effects, event listeners) is needed.
*   **Pattern**: Push `"use client"` down the tree. Don't make the root layout a client component if only the navbar needs state.

## 5. Development Workflow
1.  **Aesthetics**: Prioritize premium design (glassmorphism, micro-interactions). See `Web App Development` rules.
2.  **Type Safety**: Strictly define interfaces. Avoid `any`.
3.  **Clean Up**: Remove `console.log` statements before finishing a task.

## 6. API Integration
*   Use robust types for API responses (shared with backend schemas if possible).
*   Handle loading and error states gracefully in the UI (Skeletons, Toasts).
