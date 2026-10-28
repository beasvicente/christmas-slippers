<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Christmas Slippers

Christmas Slippers is an open-source, nostalgic Christmas-themed Next.js app
where friends customize handmade knitted slippers and submit gift requests.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS v4
- Planned: React Three Fiber, Motion, and Resend

## Working Guidelines

- Read the existing implementation and relevant local Next.js documentation
  before editing. Preserve established patterns and avoid unrelated changes.
- Reuse the Christmas design tokens in `src/app/globals.css` and existing shared
  components before introducing new styles or components.
- Build accessible, responsive, semantic React components. Support keyboard
  navigation, useful labels, visible focus states, and reduced motion.
- Keep TypeScript strict. Prefer explicit domain types, validate assumptions at
  boundaries, and avoid `any` and unnecessary dependencies.
- Keep UI, domain configuration, 3D rendering, and server logic in separate
  modules. Do not mix secrets or server-only code into client components.
- Validate all incoming data on the server. Never expose API keys, environment
  secrets, private customer data, or sensitive error details to the client.
- Protect mobile performance: minimize client JavaScript, large assets,
  re-renders, and expensive 3D work; provide appropriate fallbacks.
- Keep changes small and focused. Use Conventional Commits when explicitly
  authorized to commit.
- When applicable, run `npm run lint`, `npx tsc --noEmit`, and `npm run build`
  before handing off work.
- Do not commit, push, create branches, or modify unrelated files without
  explicit approval.
