<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Styling & Code Guidelines

- **Tailwind CSS v4 Standard Classes**:
  - Use `shrink-0` instead of `flex-shrink-0`.
  - Use `stroke-3` instead of `stroke-[3]`.
  - Use `bg-linear-to-r` / `bg-linear-to-b` instead of `bg-gradient-to-*`.
  - Prefer Tailwind v4 numeric spacing classes (e.g., `w-73.75` for 295px, `rounded-t-4xl`, `h-150`, `h-120`) to avoid arbitrary class linter warnings.
