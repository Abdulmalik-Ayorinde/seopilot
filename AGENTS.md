# AGENTS.md

Instructions for AI coding agents working in this project. This is the cross-tool
entry point: Codex, Cursor, GitHub Copilot, Gemini CLI, Aider, Zed, Windsurf, and
others.

## What this is

SeoPilot - a local AI-assisted SEO pipeline that pulls Search Console data,
scores ranking opportunities, enriches them with keyword and SERP research,
generates page rewrites with Claude, and opens GitHub PRs for approved changes.
v1 is single-user, single-site, local only.

## Context files

- `blueprint/context/project-overview.md` - the project's source of truth
- `blueprint/context/coding-standards.md` - conventions to follow
- `blueprint/context/ai-interaction.md` - how to work with the user
- `blueprint/context/current-feature.md` - the one feature, fix, or rollback being built right now

## Conventions

See `blueprint/context/coding-standards.md` for the full conventions. Key points:

- **Next.js 16** with App Router, TypeScript strict mode
- **Tailwind CSS v4** with CSS-first config
- **npm** as package manager
- Server components by default, Server Actions for mutations
- Components: `src/components/[feature]/ComponentName.tsx`
- Server Actions: `src/actions/[feature].ts`
- Validate inputs with Zod
- Return `{ success, data, error }` from actions

## Commands

- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Production server: `npm run start`
- Lint: `npm run lint`

No test command configured yet. No Verify command configured yet.

## Testing

Testing is opt-in. When a `test` command is added to the Commands section,
tests become a required gate for logic-bearing steps (parsers, validators,
server actions). UI and integration-only steps remain exempt.

## Workflow

Build one feature, fix, or rollback at a time. Spec before code, small reviewed
diffs, one work item at a time. Current work lives in
`blueprint/context/current-feature.md`. History lives in `blueprint/history/`.

Branch naming: `feature/[name]` or `fix/[name]`. Conventional commit messages
(`feat:`, `fix:`, `chore:`). Ask before committing.
