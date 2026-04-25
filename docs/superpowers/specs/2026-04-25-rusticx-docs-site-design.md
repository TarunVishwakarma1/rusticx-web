# Rusticx Documentation Site Design

**Date:** 2026-04-25  
**Project:** rusticx-web (Next.js + Fumadocs)  
**ORM Repo:** github.com/TarunVishwakarma1/rusticx-orm

---

## Overview

Build a documentation site for the rusticx Rust ORM. Two main deliverables:
1. **Homepage** — magazine/Awwwards-quality, dark techy aesthetic
2. **Docs** — comprehensive 13-page documentation with sidebar navigation

---

## Architecture

**Stack:** Next.js 15 + Fumadocs UI 16 + Tailwind CSS v4 + Canvas API (browser-native)

**No new npm dependencies.** All animation via CSS keyframes + `requestAnimationFrame`.

**File changes:**

```
app/(home)/page.tsx          — full homepage (replaces Hello World stub)
app/(home)/layout.tsx        — unchanged
app/layout.tsx               — add JetBrains Mono font alongside Inter
components/CodeRain.tsx      — canvas code rain (client component)
components/CodeTabs.tsx      — tabbed code demo for hero section 2
lib/shared.ts                — update appName="rusticx", gitConfig to TarunVishwakarma1/rusticx-orm
content/docs/               — 13 MDX pages (see Docs Structure)
app/global.css              — orange accent theme override for Fumadocs
```

**Fumadocs theming:** Override `--color-fd-primary` to `#f97316` (orange) in `global.css`. Sidebar, search, breadcrumbs, and code blocks all inherit automatically.

---

## Homepage Design

**Theme:** Background `#0a0a0f`, accent `#f97316` (orange), text `#ffffff`/`#a3a3a3`

### Section 1 — Hero (full viewport height)
- `<CodeRain>` canvas fills the full viewport behind all content
  - Canvas draws actual rusticx syntax tokens: `#[derive`, `Model]`, `repo.find`, `Uuid`, `.await`, `INSERT`, `WHERE`, `Eq`, `paginate`, etc.
  - Columns of falling chars at 0.08–0.15 opacity orange, varying speeds
  - Radial vignette gradient over canvas ensures text readability
- Center-aligned content stack:
  - Eyebrow: `BLAZINGLY FAST RUST ORM` (monospace, letter-spaced, orange)
  - H1: `"Query any database. Zero compromise."` (large, bold, white with orange highlight)
  - Subline: `"Async-first · Type-safe · Multi-database ORM for Rust"` (muted gray)
  - CTA row: `cargo add rusticx` copy-button (orange pill) + `Read Docs →` (ghost border)

### Section 2 — Tabbed Code Demo
- Section heading: `"See it in action"`
- 3 tabs: `Define Model` / `Insert & Query` / `Update & Delete`
- Fumadocs `<CodeBlock>` with shiki syntax highlighting (Rust language)
- Real rusticx code from the README for each tab

### Section 3 — Stats Bar
- Full-width band `#111111`
- 4 stats with vertical dividers: `3 Databases` · `Async-First` · `Derive Macros` · `Zero Boilerplate`
- Orange numbers/highlights, monospace font

### Section 4 — Feature Grid
- Heading: `"Everything you need"`
- 3×2 grid of cards (dark `#111` bg, orange top-border on hover)
- 6 features, each with lucide icon + title + 1-line description:
  1. Multi-DB Support — PostgreSQL, MySQL, MongoDB from one API
  2. Async Runtime — Built on Tokio, sqlx, mongodb async drivers
  3. Type-safe Queries — Composable query builder, no raw SQL strings
  4. Derive Macros — `#[derive(Model)]` generates all boilerplate
  5. Connection Pooling — Automatic pool management for all backends
  6. Auto Migration — `repo.migrate()` creates tables automatically

### Section 5 — Database Support
- Heading: `"Works with your database"`
- 3 large cards side by side:
  - **PostgreSQL** — `feature = "postgres"` — green `Available` badge + install snippet
  - **MySQL / MariaDB** — `feature = "mysql"` — green `Available` badge + install snippet
  - **MongoDB** — `feature = "mongo"` — green `Available` badge + install snippet
- Below cards: muted row of `Coming Soon` databases: CockroachDB · SQLite · Cassandra

### Section 6 — CTA
- Full-width dark section with radial orange glow
- Large heading: `"Start building in minutes"`
- Code block: `cargo add rusticx --features postgres`
- Two buttons: `Read the Docs →` (orange filled) + `View on GitHub` (ghost)

---

## Documentation Structure

**Fumadocs sidebar groups:**

### Introduction
- `index.mdx` — What is rusticx, feature overview, quick teaser code
- `getting-started.mdx` — Install, cargo.toml setup, first model, first query (5-min tutorial)

### Guides
- `core-concepts.mdx` — Models, Repos, the derive macro system explained
- `crud-operations.mdx` — insert, insert_many, find_by_id, find_all, find_one, save, delete
- `query-builder.mdx` — CondOp enum, Direction, .where(), .order_by(), .limit(), chaining
- `migrations.mdx` — repo.migrate(), auto table creation, schema management
- `connection-pooling.mdx` — Pool config, DATABASE_URL env var, connection string formats

### Database Guides
- `databases/postgres.mdx` — Postgres-specific setup, feature flags, connection string
- `databases/mysql.mdx` — MySQL/MariaDB setup, differences from Postgres
- `databases/mongodb.mdx` — MongoDB setup, collection vs table differences

### Advanced
- `sync-adapter.mdx` — SyncAdapter wrapper, blocking contexts, when to use sync vs async
- `advanced.mdx` — Raw SQL via execute_raw/query_raw, custom field types, skip attribute
- `api-reference.mdx` — All public methods, attributes (#[rusticx(...)]), enums (CondOp, Direction)

**Content quality:** All code examples use real rusticx syntax. No placeholder lorem ipsum.

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Visual style | Dark techy, black + orange | Matches Rust ecosystem aesthetic |
| Hero background | Canvas code rain | True matrix quality, 60fps, no deps |
| Homepage sections | 6 (Full Featured) | Comprehensive showcase |
| Docs depth | Comprehensive (10 pages) | Covers all ORM features |
| Animation approach | Canvas + CSS keyframes | No new dependencies |
| Font | Inter + JetBrains Mono | Code-heavy docs need mono |
