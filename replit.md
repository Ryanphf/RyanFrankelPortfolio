# Mechanical Engineer Portfolio

A personal portfolio site for a mechanical engineer — featuring a project gallery, resume viewer/downloader, and a private admin panel for managing content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/portfolio run dev` — run the frontend (port 21113)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, wouter, TanStack Query
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all contracts)
- `lib/db/src/schema/projects.ts` — projects table schema
- `artifacts/api-server/src/routes/` — API routes (projects, admin, resume)
- `artifacts/api-server/resume_files/` — place your `resume.pdf` here for the resume page
- `artifacts/portfolio/src/` — React frontend (pages in `src/pages/`)

## Architecture decisions

- Admin auth uses express-session + a password stored in `ADMIN_PASSWORD` secret — no user accounts needed since only one admin exists.
- Resume is served as a static file from `artifacts/api-server/resume_files/resume.pdf`. To upload your resume, place your PDF there and restart the API server.
- All API contracts are OpenAPI-first; never hand-write types that codegen produces.
- `SESSION_SECRET` is required for the session middleware — already configured in Replit Secrets.

## Product

- **Home** (`/`) — hero intro, featured projects, portfolio stats
- **Projects** (`/projects`) — filterable gallery of all engineering projects
- **Project detail** (`/projects/:id`) — full project description, tags, links
- **Resume** (`/resume`) — inline PDF viewer + prominent download button
- **Admin login** (`/admin/login`) — password-protected (uses `ADMIN_PASSWORD` secret)
- **Admin dashboard** (`/admin`) — manage all projects (edit/delete)
- **Admin form** (`/admin/project/new`, `/admin/project/:id/edit`) — add or edit projects

## User preferences

- Modern but human/real aesthetic — warm industrial tones, strong typography
- No emojis in the UI

## Gotchas

- To add your resume: place `resume.pdf` in `artifacts/api-server/resume_files/` then restart the API workflow.
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before touching backend or frontend.
- Session cookies use `secure: true` in production — ensure HTTPS is enabled on deployment.
- `ADMIN_PASSWORD` and `SESSION_SECRET` must be set in Replit Secrets before starting.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
