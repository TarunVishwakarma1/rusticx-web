# Rusticx Docs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a magazine/Awwwards-quality homepage and comprehensive 13-page documentation site for the rusticx Rust ORM on the existing Next.js + Fumadocs scaffold.

**Architecture:** Dark techy aesthetic (`#0a0a0f` bg, `#f97316` orange accent). Homepage has 6 sections with a canvas-based Rust code rain hero. Docs use Fumadocs' MDX pipeline with folder-based sidebar groups. No new npm dependencies — canvas is browser-native, Fumadocs handles shiki highlighting in MDX automatically.

**Tech Stack:** Next.js 15, Fumadocs UI 16, Tailwind CSS v4, Canvas API, lucide-react (already installed)

---

## File Map

**Modified:**
- `lib/shared.ts` — update appName + gitConfig to rusticx
- `app/global.css` — orange Fumadocs theme override + custom CSS vars
- `app/layout.tsx` — add JetBrains Mono font
- `app/(home)/page.tsx` — full homepage replacing Hello World stub
- `content/docs/index.mdx` — replace stub with real Overview page

**Created:**
- `components/CodeRain.tsx` — `'use client'` canvas code rain component
- `components/CopyButton.tsx` — `'use client'` clipboard copy button
- `components/CodeTabs.tsx` — `'use client'` tabbed code demo
- `content/docs/meta.json` — root sidebar ordering
- `content/docs/getting-started.mdx`
- `content/docs/guides/meta.json`
- `content/docs/guides/core-concepts.mdx`
- `content/docs/guides/crud-operations.mdx`
- `content/docs/guides/query-builder.mdx`
- `content/docs/guides/migrations.mdx`
- `content/docs/guides/connection-pooling.mdx`
- `content/docs/databases/meta.json`
- `content/docs/databases/postgres.mdx`
- `content/docs/databases/mysql.mdx`
- `content/docs/databases/mongodb.mdx`
- `content/docs/advanced/meta.json`
- `content/docs/advanced/sync-adapter.mdx`
- `content/docs/advanced/advanced.mdx`
- `content/docs/advanced/api-reference.mdx`

---

## Task 1: Foundation — Config, Theme, Font

**Files:**
- Modify: `lib/shared.ts`
- Modify: `app/global.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update shared config**

Replace entire `lib/shared.ts`:

```ts
export const appName = 'rusticx';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'TarunVishwakarma1',
  repo: 'rusticx-orm',
  branch: 'main',
};
```

- [ ] **Step 2: Add orange theme to global.css**

Replace entire `app/global.css`:

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';

html {
  scrollbar-gutter: stable;
}

html > body[data-scroll-locked] {
  margin-right: 0px !important;
  --removed-body-scroll-bar-size: 0px !important;
}

/* Orange accent for Fumadocs UI */
:root {
  --color-fd-primary: 249 115 22;
  --color-fd-ring: 249 115 22;
}

.dark {
  --color-fd-primary: 249 115 22;
  --color-fd-ring: 249 115 22;
}

/* Code rain canvas fills its parent without pointer events */
.code-rain-canvas {
  display: block;
  pointer-events: none;
}
```

- [ ] **Step 3: Add JetBrains Mono font to root layout**

Replace entire `app/layout.tsx`:

```tsx
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-[var(--font-inter)]">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify dev server starts clean**

```bash
cd /Users/tarunvishwakarma/Documents/MacAntigravity/personal-proj/rust/rusticx-web
bun run dev
```

Expected: Server starts at `http://localhost:3000` with no TypeScript errors. Nav bar should now show "rusticx" as the app name.

- [ ] **Step 5: Commit**

```bash
git add lib/shared.ts app/global.css app/layout.tsx
git commit -m "feat: configure rusticx branding, orange theme, JetBrains Mono font"
```

---

## Task 2: CodeRain Canvas Component

**Files:**
- Create: `components/CodeRain.tsx`

- [ ] **Step 1: Create the component**

Create `components/CodeRain.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';

// Characters from Rust/rusticx syntax for the rain effect
const RUST_CHARS =
  '#[](){}<>:;.,&|*_/=!?abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface CodeRainProps {
  className?: string;
}

export default function CodeRain({ className }: CodeRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const fontSize = 14;

    const setup = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setup();

    const cols = Math.floor(canvas.width / fontSize);
    // Stagger starting positions so rain doesn't all start together
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -100);

    const draw = () => {
      // Low-alpha fill creates the trailing fade effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = RUST_CHARS[Math.floor(Math.random() * RUST_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Lead character is bright orange; trail chars are dim
        const isLead = drops[i] % 8 < 1;
        ctx.fillStyle = isLead
          ? 'rgba(249, 115, 22, 0.85)'
          : 'rgba(249, 115, 22, 0.18)';
        ctx.fillText(char, x, y);

        // Reset column to top after it passes the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => setup();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`code-rain-canvas ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Verify by temporarily adding to homepage**

In `app/(home)/page.tsx`, add a quick test render to confirm canvas works:

```tsx
import CodeRain from '@/components/CodeRain';

export default function HomePage() {
  return (
    <div className="relative h-screen bg-[#0a0a0f] overflow-hidden">
      <CodeRain className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex items-center justify-center h-full text-white text-2xl font-bold">
        Code Rain Test
      </div>
    </div>
  );
}
```

Open `http://localhost:3000`. Expected: black background with orange falling characters.

- [ ] **Step 3: Commit**

```bash
git add components/CodeRain.tsx app/(home)/page.tsx
git commit -m "feat: add CodeRain canvas component with Rust syntax chars"
```

---

## Task 3: CopyButton and CodeTabs Components

**Files:**
- Create: `components/CopyButton.tsx`
- Create: `components/CodeTabs.tsx`

- [ ] **Step 1: Create CopyButton**

Create `components/CopyButton.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200"
    >
      {copied ? (
        <Check size={14} />
      ) : (
        <Copy size={14} className="opacity-70 group-hover:opacity-100" />
      )}
      {label ?? text}
    </button>
  );
}
```

- [ ] **Step 2: Create CodeTabs**

Create `components/CodeTabs.tsx`:

```tsx
'use client';
import { useState } from 'react';

interface Tab {
  label: string;
  code: string;
  language?: string;
}

interface CodeTabsProps {
  tabs: Tab[];
}

export default function CodeTabs({ tabs }: CodeTabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-[#111116]">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 bg-[#0d0d12]">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-5 py-3 text-sm font-mono transition-colors duration-150 ${
              i === active
                ? 'text-orange-400 border-b-2 border-orange-500 bg-[#111116]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Code panel */}
      <div className="p-6 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-neutral-300 whitespace-pre">
          <code>{tabs[active].code}</code>
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

```bash
bun run build 2>&1 | tail -20
```

Expected: Build completes with no TypeScript errors on the new components.

- [ ] **Step 4: Commit**

```bash
git add components/CopyButton.tsx components/CodeTabs.tsx
git commit -m "feat: add CopyButton and CodeTabs UI components"
```

---

## Task 4: Homepage — All 6 Sections

**Files:**
- Modify: `app/(home)/page.tsx`

- [ ] **Step 1: Write the full homepage**

Replace entire `app/(home)/page.tsx`:

```tsx
import Link from 'next/link';
import { Database, Zap, Shield, Code2, Layers, GitMerge } from 'lucide-react';
import CodeRain from '@/components/CodeRain';
import CopyButton from '@/components/CopyButton';
import CodeTabs from '@/components/CodeTabs';

const CODE_TABS = [
  {
    label: 'Define Model',
    code: `use rusticx::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Model, Serialize, Deserialize, Debug)]
#[rusticx(table = "users")]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,
    #[rusticx(unique)]
    pub email: String,
    pub name: String,
    #[rusticx(nullable)]
    pub bio: Option<String>,
}`,
  },
  {
    label: 'Insert & Query',
    code: `#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let repo = PostgresRepo::<User>::new(&database_url).await?;
    repo.migrate().await?;

    // Insert a record
    let user = User {
        id: Uuid::new_v4(),
        email: "alice@example.com".into(),
        name: "Alice".into(),
        bio: None,
    };
    repo.insert(&user).await?;

    // Query with filter
    let users = repo
        .find()
        .where_clause("email", CondOp::Eq, "alice@example.com")
        .order_by("name", Direction::Asc)
        .limit(10)
        .fetch_all()
        .await?;

    println!("Found {} users", users.len());
    Ok(())
}`,
  },
  {
    label: 'Update & Delete',
    code: `// Update matching records
repo.update()
    .where_clause("id", CondOp::Eq, user.id)
    .set("name", "Alice Smith")
    .execute()
    .await?;

// Paginate results
let page = repo.paginate(1, 20).await?;
println!("Page 1 of {}", page.total_pages);

// Delete by id
repo.delete_by_id(user.id).await?;

// Count with filter
let count = repo
    .count()
    .where_clause("bio", CondOp::IsNull, ())
    .fetch()
    .await?;
println!("{} users have no bio", count);`,
  },
];

const FEATURES = [
  {
    icon: Database,
    title: 'Multi-DB Support',
    desc: 'PostgreSQL, MySQL, and MongoDB from a single unified API.',
  },
  {
    icon: Zap,
    title: 'Async Runtime',
    desc: 'Built on Tokio, sqlx, and the MongoDB async driver.',
  },
  {
    icon: Shield,
    title: 'Type-safe Queries',
    desc: 'Composable query builder — no raw SQL strings to mistype.',
  },
  {
    icon: Code2,
    title: 'Derive Macros',
    desc: '#[derive(Model)] generates all the boilerplate for you.',
  },
  {
    icon: Layers,
    title: 'Connection Pooling',
    desc: 'Automatic pool management for all supported backends.',
  },
  {
    icon: GitMerge,
    title: 'Auto Migration',
    desc: 'repo.migrate() creates and updates your tables automatically.',
  },
];

const DATABASES = [
  {
    name: 'PostgreSQL',
    feature: 'postgres',
    status: 'Available',
    install: 'rusticx = { version = "0.1", features = ["postgres"] }',
  },
  {
    name: 'MySQL / MariaDB',
    feature: 'mysql',
    status: 'Available',
    install: 'rusticx = { version = "0.1", features = ["mysql"] }',
  },
  {
    name: 'MongoDB',
    feature: 'mongo',
    status: 'Available',
    install: 'rusticx = { version = "0.1", features = ["mongo"] }',
  },
];

const COMING_SOON = ['CockroachDB', 'SQLite', 'Cassandra'];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ── Section 1: Hero ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Canvas code rain */}
        <CodeRain className="absolute inset-0 w-full h-full" />

        {/* Radial vignette keeps text readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, #0a0a0f 75%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl px-6">
          <p className="text-orange-500 text-xs font-mono tracking-[0.35em] uppercase mb-6">
            Blazingly Fast Rust ORM
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            Query any database.
            <br />
            <span className="text-orange-500">Zero compromise.</span>
          </h1>
          <p className="text-neutral-400 text-lg mb-10 font-mono">
            Async-first · Type-safe · Multi-database ORM for Rust
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CopyButton text="cargo add rusticx" />
            <Link
              href="/docs"
              className="flex items-center gap-2 border border-white/20 text-neutral-300 hover:text-white hover:border-white/40 font-semibold text-sm px-5 py-3 rounded-lg transition-colors duration-200"
            >
              Read Docs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: Tabbed Code Demo ──────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-mono tracking-[0.3em] uppercase mb-3">
            See It In Action
          </p>
          <h2 className="text-3xl md:text-4xl font-black">
            Clean API. Powerful queries.
          </h2>
          <p className="text-neutral-500 mt-3 text-sm">
            Real code from rusticx — define models, insert, query, update, delete.
          </p>
        </div>
        <CodeTabs tabs={CODE_TABS} />
      </section>

      {/* ── Section 3: Stats Bar ─────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#111116]">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3', label: 'Databases' },
            { value: 'Async', label: 'First' },
            { value: 'Derive', label: 'Macros' },
            { value: 'Zero', label: 'Boilerplate' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-orange-500 font-mono text-2xl font-black">
                {stat.value}
              </span>
              <span className="text-neutral-500 text-xs uppercase tracking-widest font-mono">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Feature Grid ──────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-xs font-mono tracking-[0.3em] uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-black">
              Everything you need
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group bg-[#111116] border border-white/5 hover:border-orange-500/30 rounded-xl p-6 transition-colors duration-200"
                >
                  <Icon
                    size={22}
                    className="text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-200"
                  />
                  <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Database Support ──────────────────────── */}
      <section className="py-24 px-6 bg-[#0d0d12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-xs font-mono tracking-[0.3em] uppercase mb-3">
              Compatibility
            </p>
            <h2 className="text-3xl md:text-4xl font-black">
              Works with your database
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {DATABASES.map((db) => (
              <div
                key={db.name}
                className="bg-[#111116] border border-white/5 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-black text-lg">{db.name}</h3>
                  <span className="text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                    {db.status}
                  </span>
                </div>
                <pre className="text-[10px] font-mono text-neutral-400 bg-black/30 rounded-lg p-3 overflow-x-auto">
                  {db.install}
                </pre>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-neutral-600 text-xs font-mono">
              Coming soon:{' '}
              {COMING_SOON.map((db, i) => (
                <span key={db}>
                  <span className="text-neutral-500">{db}</span>
                  {i < COMING_SOON.length - 1 && (
                    <span className="mx-2 text-neutral-700">·</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 6: CTA ───────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(249,115,22,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Start building in minutes
          </h2>
          <p className="text-neutral-500 mb-10 text-sm">
            Add rusticx to your Cargo.toml and query your first record in under 5 minutes.
          </p>
          <div className="bg-[#111116] border border-white/10 rounded-xl p-4 mb-8 font-mono text-sm text-neutral-300 text-left max-w-md mx-auto">
            <span className="text-neutral-600 select-none">$ </span>
            cargo add rusticx --features postgres
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/docs"
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Read the Docs →
            </Link>
            <a
              href="https://github.com/TarunVishwakarma1/rusticx-orm"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-neutral-300 hover:text-white hover:border-white/40 font-semibold text-sm px-6 py-3 rounded-lg transition-colors duration-200"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify full homepage in browser**

```bash
bun run dev
```

Open `http://localhost:3000`. Check:
- Code rain fills hero section with orange falling chars
- H1 reads "Query any database. Zero compromise."
- CopyButton copies `cargo add rusticx` to clipboard on click
- Code tabs switch between Define Model / Insert & Query / Update & Delete
- Stats bar shows 4 stats
- Feature grid shows 6 cards with icons
- DB support shows 3 cards with install snippets
- CTA section has orange glow

- [ ] **Step 3: Commit**

```bash
git add app/(home)/page.tsx
git commit -m "feat: build full 6-section homepage with code rain hero"
```

---

## Task 5: Docs Sidebar Structure (meta.json files)

**Files:**
- Create: `content/docs/meta.json`
- Create: `content/docs/guides/meta.json`
- Create: `content/docs/databases/meta.json`
- Create: `content/docs/advanced/meta.json`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p content/docs/guides content/docs/databases content/docs/advanced
```

- [ ] **Step 2: Create root meta.json**

Create `content/docs/meta.json`:

```json
{
  "title": "rusticx Docs",
  "pages": [
    "index",
    "getting-started",
    "guides",
    "databases",
    "advanced"
  ]
}
```

- [ ] **Step 3: Create guides meta.json**

Create `content/docs/guides/meta.json`:

```json
{
  "title": "Guides",
  "pages": [
    "core-concepts",
    "crud-operations",
    "query-builder",
    "migrations",
    "connection-pooling"
  ]
}
```

- [ ] **Step 4: Create databases meta.json**

Create `content/docs/databases/meta.json`:

```json
{
  "title": "Database Guides",
  "pages": ["postgres", "mysql", "mongodb"]
}
```

- [ ] **Step 5: Create advanced meta.json**

Create `content/docs/advanced/meta.json`:

```json
{
  "title": "Advanced",
  "pages": ["sync-adapter", "advanced", "api-reference"]
}
```

- [ ] **Step 6: Commit**

```bash
git add content/docs/meta.json content/docs/guides/meta.json content/docs/databases/meta.json content/docs/advanced/meta.json
git commit -m "feat: add fumadocs sidebar structure via meta.json files"
```

---

## Task 6: Introduction Docs

**Files:**
- Modify: `content/docs/index.mdx`
- Create: `content/docs/getting-started.mdx`

- [ ] **Step 1: Write Overview page**

Replace entire `content/docs/index.mdx`:

```mdx
---
title: Overview
description: rusticx is a blazingly fast, async-first, multi-database ORM for Rust.
---

**rusticx** is a Rust ORM that lets you define models with derive macros, auto-generate tables, and perform full CRUD operations — synchronously or asynchronously — across PostgreSQL, MySQL, and MongoDB from a single unified API.

## Why rusticx?

Most Rust database libraries require you to either write raw SQL by hand or commit to a single database vendor. rusticx gives you:

- **One API** — the same `repo.find()`, `repo.insert()`, `repo.update()` calls work across all supported backends.
- **Type safety** — the query builder uses enums (`CondOp`, `Direction`) instead of raw strings, catching mistakes at compile time.
- **Zero boilerplate** — `#[derive(Model)]` generates table mapping, CRUD methods, and schema migration code automatically.
- **Async-first** — built on Tokio and sqlx; no blocking calls unless you explicitly opt in via `SyncAdapter`.

## Quick Example

```rust
use rusticx::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Model, Serialize, Deserialize)]
#[rusticx(table = "users")]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,
    #[rusticx(unique)]
    pub email: String,
    pub name: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let repo = PostgresRepo::<User>::new("postgres://localhost/mydb").await?;
    repo.migrate().await?;

    let user = User { id: Uuid::new_v4(), email: "alice@example.com".into(), name: "Alice".into() };
    repo.insert(&user).await?;

    let found = repo.find_by_id(user.id).await?;
    println!("{:?}", found);
    Ok(())
}
```

## Supported Databases

| Database | Feature Flag | Status |
|---|---|---|
| PostgreSQL | `postgres` | Available |
| MySQL / MariaDB | `mysql` | Available |
| MongoDB | `mongo` | Available |
| CockroachDB | `cockroach` | Planned |
| SQLite | `sqlite` | Planned |
| Cassandra | `cassandra` | Planned |

## Next Steps

<Cards>
  <Card title="Getting Started" href="/docs/getting-started" description="Install rusticx and run your first query in 5 minutes." />
  <Card title="Core Concepts" href="/docs/guides/core-concepts" description="Understand Models, Repos, and the derive macro system." />
</Cards>
```

- [ ] **Step 2: Write Getting Started page**

Create `content/docs/getting-started.mdx`:

```mdx
---
title: Getting Started
description: Install rusticx and run your first query in under 5 minutes.
---

## Prerequisites

- Rust 1.75+ (stable)
- Tokio async runtime
- A running PostgreSQL, MySQL, or MongoDB instance

## Installation

Add rusticx to your `Cargo.toml`. Use the feature flag for your database:

```toml
[dependencies]
# PostgreSQL
rusticx = { version = "0.1", features = ["postgres"] }

# MySQL / MariaDB
# rusticx = { version = "0.1", features = ["mysql"] }

# MongoDB
# rusticx = { version = "0.1", features = ["mongo"] }

# All databases
# rusticx = { version = "0.1", features = ["full"] }

tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
uuid = { version = "1", features = ["v4", "serde"] }
anyhow = "1"
```

## Define Your First Model

Create `src/models.rs`:

```rust
use rusticx::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Model, Serialize, Deserialize, Debug, Clone)]
#[rusticx(table = "users")]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,

    #[rusticx(unique)]
    pub email: String,

    pub name: String,

    #[rusticx(nullable)]
    pub bio: Option<String>,
}
```

The `#[derive(Model)]` macro generates:
- SQL `CREATE TABLE` statement for `repo.migrate()`
- Field-to-column mapping for all CRUD operations
- Serde integration for JSON serialization

## Connect and Migrate

```rust
// src/main.rs
mod models;
use models::User;
use rusticx::prelude::*;
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://localhost/mydb".into());

    let repo = PostgresRepo::<User>::new(&database_url).await?;

    // Creates the `users` table if it doesn't exist
    repo.migrate().await?;

    println!("Connected and migrated successfully!");
    Ok(())
}
```

Set your `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgres://user:password@localhost/mydb"
cargo run
```

## Insert and Query

```rust
// Insert a record
let user = User {
    id: Uuid::new_v4(),
    email: "alice@example.com".into(),
    name: "Alice".into(),
    bio: Some("Rustacean".into()),
};
repo.insert(&user).await?;

// Find by primary key
let found = repo.find_by_id(user.id).await?;
println!("{:?}", found);

// Find all records
let all_users = repo.find_all().await?;
println!("Total users: {}", all_users.len());

// Filter query
let filtered = repo
    .find()
    .where_clause("name", CondOp::Eq, "Alice")
    .fetch_all()
    .await?;
```

## Next Steps

<Cards>
  <Card title="Core Concepts" href="/docs/guides/core-concepts" description="Deep dive into Models, Repos, and derive attributes." />
  <Card title="CRUD Operations" href="/docs/guides/crud-operations" description="Complete reference for all insert, find, update, delete methods." />
</Cards>
```

- [ ] **Step 3: Verify sidebar in browser**

```bash
bun run dev
```

Open `http://localhost:3000/docs`. Expected: Sidebar shows "Overview" and "Getting Started" at the top, followed by Guides / Database Guides / Advanced groups.

- [ ] **Step 4: Commit**

```bash
git add content/docs/index.mdx content/docs/getting-started.mdx
git commit -m "docs: add Overview and Getting Started pages"
```

---

## Task 7: Guides Documentation (5 pages)

**Files:**
- Create: `content/docs/guides/core-concepts.mdx`
- Create: `content/docs/guides/crud-operations.mdx`
- Create: `content/docs/guides/query-builder.mdx`
- Create: `content/docs/guides/migrations.mdx`
- Create: `content/docs/guides/connection-pooling.mdx`

- [ ] **Step 1: Write Core Concepts**

Create `content/docs/guides/core-concepts.mdx`:

```mdx
---
title: Core Concepts
description: Understand Models, Repos, and how the derive macro system works in rusticx.
---

## Models

A **Model** is a Rust struct that maps to a database table (SQL) or collection (MongoDB). You define it as a normal struct and apply `#[derive(Model)]`:

```rust
use rusticx::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Model, Serialize, Deserialize, Debug)]
#[rusticx(table = "products")]
pub struct Product {
    #[rusticx(primary_key)]
    pub id: Uuid,
    pub name: String,
    pub price: f64,
    #[rusticx(nullable)]
    pub description: Option<String>,
}
```

### Struct-level Attributes

| Attribute | Description |
|---|---|
| `#[rusticx(table = "name")]` | Override the table/collection name. Defaults to the struct name in snake_case. |
| `#[rusticx(primary_key = "field")]` | Override which field is the primary key. Defaults to `id`. |

### Field-level Attributes

| Attribute | Description |
|---|---|
| `#[rusticx(primary_key)]` | Marks this field as the primary key. |
| `#[rusticx(unique)]` | Adds a UNIQUE constraint on this column. |
| `#[rusticx(nullable)]` | Allows NULL — use with `Option<T>` fields. |
| `#[rusticx(default = "expr")]` | SQL DEFAULT expression (e.g. `default = "NOW()"``). |
| `#[rusticx(column = "name")]` | Override the column name for this field. |
| `#[rusticx(skip)]` | Exclude this field from persistence entirely. |

## Repos

A **Repo** is the entry point for all database operations on a given model. You create one per model per database connection:

```rust
// PostgreSQL
let repo = PostgresRepo::<User>::new(&database_url).await?;

// MySQL
let repo = MySqlRepo::<User>::new(&database_url).await?;

// MongoDB
let repo = MongoRepo::<User>::new(&database_url, "mydb").await?;
```

The repo holds a connection pool internally. Creating it is an async operation that establishes the pool. Reuse the same repo instance throughout your application — do not create a new one per request.

## The Derive Macro

`#[derive(Model)]` is a procedural macro that generates code at compile time. Given your struct, it produces:

1. **Schema definition** — a `CREATE TABLE IF NOT EXISTS` statement used by `repo.migrate()`
2. **Column mapping** — `INSERT`, `SELECT`, `UPDATE` statements with correct column names
3. **Primary key accessor** — used by `find_by_id` and `delete_by_id`

You never write this code manually. If you add a field to your struct, re-running the migration (calling `repo.migrate()`) updates the schema.

## Prelude

Import everything you need from `rusticx::prelude::*`:

```rust
use rusticx::prelude::*;
// Brings in: Model derive macro, CondOp, Direction, PostgresRepo,
// MySqlRepo, MongoRepo, SyncAdapter, and all trait bounds.
```
```

- [ ] **Step 2: Write CRUD Operations**

Create `content/docs/guides/crud-operations.mdx`:

```mdx
---
title: CRUD Operations
description: Complete reference for all insert, find, update, and delete operations in rusticx.
---

All examples below use `PostgresRepo` but the same API applies to `MySqlRepo` and `MongoRepo`.

## Insert

### Single record

```rust
let user = User {
    id: Uuid::new_v4(),
    email: "alice@example.com".into(),
    name: "Alice".into(),
    bio: None,
};
repo.insert(&user).await?;
```

### Multiple records

```rust
let users = vec![
    User { id: Uuid::new_v4(), email: "bob@example.com".into(), name: "Bob".into(), bio: None },
    User { id: Uuid::new_v4(), email: "carol@example.com".into(), name: "Carol".into(), bio: None },
];
repo.insert_many(&users).await?;
```

### Insert or update (upsert)

`save()` inserts the record if the primary key doesn't exist, or updates it if it does:

```rust
repo.save(&user).await?;
```

## Find

### By primary key

```rust
let user: Option<User> = repo.find_by_id(user_id).await?;
```

### All records

```rust
let users: Vec<User> = repo.find_all().await?;
```

### Single record matching a filter

```rust
let user: Option<User> = repo
    .find_one()
    .where_clause("email", CondOp::Eq, "alice@example.com")
    .fetch()
    .await?;
```

### Filtered list

```rust
let users: Vec<User> = repo
    .find()
    .where_clause("name", CondOp::Eq, "Alice")
    .order_by("created_at", Direction::Desc)
    .limit(20)
    .fetch_all()
    .await?;
```

### Paginate

```rust
let page = repo.paginate(1, 20).await?;
// page.items: Vec<User>
// page.total: u64
// page.total_pages: u64
// page.page: u64
```

### Count

```rust
// Total count
let total: u64 = repo.count().fetch().await?;

// Count with filter
let active: u64 = repo
    .count()
    .where_clause("bio", CondOp::IsNotNull, ())
    .fetch()
    .await?;
```

## Update

```rust
repo.update()
    .where_clause("id", CondOp::Eq, user.id)
    .set("name", "Alice Smith")
    .set("bio", "Senior Rustacean")
    .execute()
    .await?;
```

Multiple `.set()` calls are chained — all fields update in a single query.

## Delete

### By primary key

```rust
repo.delete_by_id(user.id).await?;
```

### By filter

```rust
repo.delete()
    .where_clause("email", CondOp::Eq, "alice@example.com")
    .execute()
    .await?;
```

## Raw SQL

For queries that the builder can't express, use the underlying adapter directly:

```rust
// Execute a statement (no return value)
repo.adapter().execute_raw("DELETE FROM users WHERE created_at < NOW() - INTERVAL '1 year'", &[]).await?;

// Query rows
let rows = repo.adapter().query_raw("SELECT id, name FROM users WHERE role = $1", &[&"admin"]).await?;
```

<Callout type="warn">
Raw SQL bypasses the type-safe query builder. Validate all user-supplied input before passing it to `execute_raw` or `query_raw`.
</Callout>
```

- [ ] **Step 3: Write Query Builder**

Create `content/docs/guides/query-builder.mdx`:

```mdx
---
title: Query Builder
description: Composable, type-safe queries using CondOp, Direction, and method chaining.
---

The rusticx query builder lets you construct `WHERE`, `ORDER BY`, and `LIMIT` clauses without writing raw SQL strings. All conditions use the `CondOp` enum so typos are caught at compile time.

## CondOp — Comparison Operators

| Variant | SQL equivalent | Example |
|---|---|---|
| `CondOp::Eq` | `= $1` | `.where_clause("id", CondOp::Eq, user_id)` |
| `CondOp::NotEq` | `<> $1` | `.where_clause("status", CondOp::NotEq, "banned")` |
| `CondOp::Gt` | `> $1` | `.where_clause("age", CondOp::Gt, 18)` |
| `CondOp::Gte` | `>= $1` | `.where_clause("score", CondOp::Gte, 100)` |
| `CondOp::Lt` | `< $1` | `.where_clause("price", CondOp::Lt, 50.0)` |
| `CondOp::Lte` | `<= $1` | `.where_clause("stock", CondOp::Lte, 0)` |
| `CondOp::Like` | `LIKE $1` | `.where_clause("name", CondOp::Like, "%alice%")` |
| `CondOp::IsNull` | `IS NULL` | `.where_clause("bio", CondOp::IsNull, ())` |
| `CondOp::IsNotNull` | `IS NOT NULL` | `.where_clause("bio", CondOp::IsNotNull, ())` |

## Direction — Sort Order

```rust
use rusticx::prelude::Direction;

// Ascending
.order_by("created_at", Direction::Asc)

// Descending
.order_by("score", Direction::Desc)
```

## Chaining

Multiple `.where_clause()` calls are combined with `AND`:

```rust
let results = repo
    .find()
    .where_clause("role", CondOp::Eq, "admin")
    .where_clause("score", CondOp::Gte, 500)
    .where_clause("bio", CondOp::IsNotNull, ())
    .order_by("score", Direction::Desc)
    .limit(10)
    .fetch_all()
    .await?;
// SQL: WHERE role = $1 AND score >= $2 AND bio IS NOT NULL ORDER BY score DESC LIMIT 10
```

## Available Builder Methods

| Method | Description |
|---|---|
| `.where_clause(col, op, val)` | Add a WHERE condition |
| `.order_by(col, direction)` | Add ORDER BY clause |
| `.limit(n)` | Limit result count |
| `.set(col, val)` | Set a column value (update builder only) |
| `.fetch_all()` | Execute and return `Vec<T>` |
| `.fetch()` | Execute and return `Option<T>` or scalar |
| `.execute()` | Execute with no return value (update/delete) |
```

- [ ] **Step 4: Write Migrations**

Create `content/docs/guides/migrations.mdx`:

```mdx
---
title: Migrations
description: Automatic schema creation and management with repo.migrate().
---

rusticx includes a built-in migration system driven by your model definitions. When you call `repo.migrate()`, rusticx generates and runs a `CREATE TABLE IF NOT EXISTS` statement for your model.

## Running Migrations

```rust
let repo = PostgresRepo::<User>::new(&database_url).await?;
repo.migrate().await?;
```

Call `migrate()` once at application startup, before any other database operations. It is safe to call on every startup — the `IF NOT EXISTS` guard means it is a no-op if the table already exists.

## What Gets Generated

Given this model:

```rust
#[derive(Model, Serialize, Deserialize)]
#[rusticx(table = "users")]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,
    #[rusticx(unique)]
    pub email: String,
    pub name: String,
    #[rusticx(nullable)]
    pub bio: Option<String>,
}
```

rusticx generates and executes:

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    bio VARCHAR
);
```

## Migrating Multiple Models

Call `migrate()` on each repo at startup:

```rust
let user_repo = PostgresRepo::<User>::new(&db_url).await?;
let post_repo = PostgresRepo::<Post>::new(&db_url).await?;

user_repo.migrate().await?;
post_repo.migrate().await?;
```

## Limitations

<Callout type="warn">
rusticx migration only handles `CREATE TABLE IF NOT EXISTS`. It does **not** handle `ALTER TABLE` for adding, removing, or renaming columns on existing tables. If you add a field to an existing model in a running production database, you must write and run that `ALTER TABLE` migration manually.
</Callout>

For production schema management, pair rusticx with a dedicated migration tool such as [sqlx migrate](https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md) or [refinery](https://github.com/rust-db/refinery).
```

- [ ] **Step 5: Write Connection Pooling**

Create `content/docs/guides/connection-pooling.mdx`:

```mdx
---
title: Connection Pooling
description: How rusticx manages database connection pools for SQL and MongoDB backends.
---

rusticx handles connection pooling automatically. When you call `PostgresRepo::new()` or `MySqlRepo::new()`, rusticx creates a sqlx connection pool under the hood and holds it for the lifetime of the repo.

## SQL Databases (PostgreSQL, MySQL)

rusticx uses [sqlx](https://github.com/launchbadge/sqlx) PgPool / MySqlPool internally.

```rust
let repo = PostgresRepo::<User>::new("postgres://user:pass@localhost/mydb").await?;
```

The connection string format follows standard URI syntax:

```
postgres://username:password@host:port/database
mysql://username:password@host:port/database
```

### Pool Configuration

By default, rusticx uses sqlx's default pool settings (max 10 connections). To customize, use the `DATABASE_URL` environment variable or pass a full connection string with query parameters:

```
postgres://user:pass@localhost/mydb?pool_max_connections=20&pool_min_connections=2
```

## MongoDB

For MongoDB, rusticx uses the official [mongodb](https://crates.io/crates/mongodb) async client, which maintains its own connection pool:

```rust
let repo = MongoRepo::<User>::new("mongodb://localhost:27017", "mydb").await?;
```

## Best Practice: Share the Repo

Create the repo once and share it across your application — do not create a new repo per request. With Axum:

```rust
use axum::{extract::State, routing::get, Router};
use std::sync::Arc;

#[derive(Clone)]
struct AppState {
    users: Arc<PostgresRepo<User>>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let repo = PostgresRepo::<User>::new(&std::env::var("DATABASE_URL")?).await?;
    repo.migrate().await?;

    let state = AppState { users: Arc::new(repo) };

    let app = Router::new()
        .route("/users", get(list_users))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn list_users(State(state): State<AppState>) -> String {
    let users = state.users.find_all().await.unwrap();
    format!("{} users", users.len())
}
```

## Environment Variables

Store connection strings in environment variables — never hardcode credentials:

```bash
# .env
DATABASE_URL=postgres://user:password@localhost:5432/mydb
```

```rust
let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
let repo = PostgresRepo::<User>::new(&db_url).await?;
```
```

- [ ] **Step 6: Verify guides appear in sidebar**

```bash
bun run dev
```

Open `http://localhost:3000/docs/guides/core-concepts`. Expected: Page renders with sidebar showing all 5 guides under a "Guides" section header.

- [ ] **Step 7: Commit**

```bash
git add content/docs/guides/
git commit -m "docs: add 5 guide pages (core concepts, CRUD, query builder, migrations, pooling)"
```

---

## Task 8: Database Guide Docs (3 pages)

**Files:**
- Create: `content/docs/databases/postgres.mdx`
- Create: `content/docs/databases/mysql.mdx`
- Create: `content/docs/databases/mongodb.mdx`

- [ ] **Step 1: Write PostgreSQL guide**

Create `content/docs/databases/postgres.mdx`:

```mdx
---
title: PostgreSQL
description: Setting up and using rusticx with PostgreSQL and the postgres feature flag.
---

## Setup

Add rusticx with the `postgres` feature to `Cargo.toml`:

```toml
[dependencies]
rusticx = { version = "0.1", features = ["postgres"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
uuid = { version = "1", features = ["v4", "serde"] }
```

## Connection String

```
postgres://username:password@host:port/database
```

Common formats:

```bash
# Local development (no password)
postgres://localhost/mydb

# Full credentials
postgres://alice:secret@localhost:5432/production

# With SSL
postgres://alice:secret@db.example.com:5432/production?sslmode=require
```

## Creating a Repo

```rust
use rusticx::prelude::*;

let repo = PostgresRepo::<User>::new("postgres://localhost/mydb").await?;
repo.migrate().await?;
```

## PostgreSQL-Specific Types

rusticx maps Rust types to PostgreSQL types as follows:

| Rust Type | PostgreSQL Type |
|---|---|
| `Uuid` | `UUID` |
| `String` | `VARCHAR` |
| `i32` | `INTEGER` |
| `i64` | `BIGINT` |
| `f32` | `REAL` |
| `f64` | `DOUBLE PRECISION` |
| `bool` | `BOOLEAN` |
| `Option<T>` | `T` (nullable) |

## Raw SQL with PostgreSQL

Use sqlx's `$1`, `$2` placeholder syntax for raw queries:

```rust
let rows = repo
    .adapter()
    .query_raw("SELECT id, name FROM users WHERE role = $1 AND score > $2", &[&"admin", &100])
    .await?;
```

## Running PostgreSQL Locally

Using Docker:

```bash
docker run --name rusticx-pg \
  -e POSTGRES_USER=rusticx \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=rusticxdb \
  -p 5432:5432 \
  -d postgres:16
```

```bash
export DATABASE_URL="postgres://rusticx:secret@localhost:5432/rusticxdb"
```
```

- [ ] **Step 2: Write MySQL guide**

Create `content/docs/databases/mysql.mdx`:

```mdx
---
title: MySQL / MariaDB
description: Setting up and using rusticx with MySQL or MariaDB and the mysql feature flag.
---

## Setup

```toml
[dependencies]
rusticx = { version = "0.1", features = ["mysql"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
uuid = { version = "1", features = ["v4", "serde"] }
```

## Connection String

```
mysql://username:password@host:port/database
```

```bash
# Local development
mysql://root:@localhost:3306/mydb

# With credentials
mysql://alice:secret@localhost:3306/production
```

## Creating a Repo

```rust
use rusticx::prelude::*;

let repo = MySqlRepo::<User>::new("mysql://root:@localhost:3306/mydb").await?;
repo.migrate().await?;
```

## MySQL-Specific Notes

### UUID Storage

MySQL does not have a native UUID type. rusticx stores UUIDs as `CHAR(36)` in MySQL:

```sql
-- Generated by repo.migrate() for a Uuid primary key
id CHAR(36) PRIMARY KEY
```

### Raw SQL Placeholders

MySQL uses `?` placeholders (not `$1` like PostgreSQL):

```rust
let rows = repo
    .adapter()
    .query_raw("SELECT id, name FROM users WHERE role = ? AND score > ?", &[&"admin", &100])
    .await?;
```

## Running MySQL Locally

```bash
docker run --name rusticx-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=rusticxdb \
  -p 3306:3306 \
  -d mysql:8
```

```bash
export DATABASE_URL="mysql://root:secret@localhost:3306/rusticxdb"
```

## MariaDB Compatibility

rusticx's MySQL adapter is fully compatible with MariaDB 10.5+. Use the same `mysql://` connection string format:

```bash
export DATABASE_URL="mysql://root:secret@localhost:3306/rusticxdb"
```
```

- [ ] **Step 3: Write MongoDB guide**

Create `content/docs/databases/mongodb.mdx`:

```mdx
---
title: MongoDB
description: Setting up and using rusticx with MongoDB and the mongo feature flag.
---

## Setup

```toml
[dependencies]
rusticx = { version = "0.1", features = ["mongo"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
uuid = { version = "1", features = ["v4", "serde"] }
```

## Creating a Repo

MongoDB requires a database name in addition to the connection string:

```rust
use rusticx::prelude::*;

let repo = MongoRepo::<User>::new("mongodb://localhost:27017", "mydb").await?;
repo.migrate().await?;
```

`migrate()` on MongoDB creates the collection if it does not exist and sets up any indexes defined by `#[rusticx(unique)]` attributes.

## Key Differences from SQL Backends

| Concept | SQL (Postgres/MySQL) | MongoDB |
|---|---|---|
| Storage | Table | Collection |
| Row | Row | Document (BSON) |
| Schema | Enforced | Flexible |
| Joins | `JOIN` | Embedded documents / `$lookup` |
| `migrate()` | `CREATE TABLE` | Create collection + indexes |
| Raw query | `execute_raw` / `query_raw` | Not yet supported — use `adapter().collection()` |

## Model Definition

MongoDB models use the same `#[derive(Model)]` syntax. The `table` attribute sets the collection name:

```rust
#[derive(Model, Serialize, Deserialize, Debug)]
#[rusticx(table = "users")]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,
    #[rusticx(unique)]
    pub email: String,
    pub name: String,
    #[rusticx(nullable)]
    pub bio: Option<String>,
}
```

## Querying

The same query builder API applies:

```rust
let users = repo
    .find()
    .where_clause("name", CondOp::Eq, "Alice")
    .limit(10)
    .fetch_all()
    .await?;
```

rusticx translates `CondOp` values to MongoDB filter documents automatically.

## Running MongoDB Locally

```bash
docker run --name rusticx-mongo \
  -p 27017:27017 \
  -d mongo:7
```

```bash
export DATABASE_URL="mongodb://localhost:27017"
```
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/docs/databases/postgres`. Expected: Page renders, sidebar shows "Database Guides" group with Postgres / MySQL / MongoDB.

- [ ] **Step 5: Commit**

```bash
git add content/docs/databases/
git commit -m "docs: add database guides for PostgreSQL, MySQL, and MongoDB"
```

---

## Task 9: Advanced Documentation (3 pages)

**Files:**
- Create: `content/docs/advanced/sync-adapter.mdx`
- Create: `content/docs/advanced/advanced.mdx`
- Create: `content/docs/advanced/api-reference.mdx`

- [ ] **Step 1: Write Sync Adapter**

Create `content/docs/advanced/sync-adapter.mdx`:

```mdx
---
title: Sync Adapter
description: Use rusticx in blocking contexts without async/await using SyncAdapter.
---

rusticx is async-first, but sometimes you need to use it in a synchronous context — a CLI tool, a Rayon parallel iterator, or code that can't use `.await`. The `SyncAdapter` wrapper handles this by internally running the async operations on a Tokio runtime.

## When to Use SyncAdapter

Use `SyncAdapter` when:
- You are writing a CLI binary where async adds unnecessary complexity
- You are inside a `std::thread` that can't use `.await`
- You are integrating with a synchronous library (e.g. a Diesel-style ORM wrapper)

Do **not** use `SyncAdapter` inside an existing Tokio async runtime (e.g. an Axum handler). Blocking inside an async runtime stalls the executor. Use the standard `.await` syntax there instead.

## Setup

```rust
use rusticx::prelude::*;
use rusticx::sync::SyncAdapter;

fn main() -> anyhow::Result<()> {
    let repo = SyncAdapter::new(
        PostgresRepo::<User>::new("postgres://localhost/mydb")
    )?;

    repo.migrate()?;

    let user = User {
        id: uuid::Uuid::new_v4(),
        email: "alice@example.com".into(),
        name: "Alice".into(),
        bio: None,
    };

    repo.insert(&user)?;

    let found = repo.find_by_id(user.id)?;
    println!("{:?}", found);

    Ok(())
}
```

## API

`SyncAdapter` exposes all the same methods as the async repo but without `.await`:

| Async | Sync via SyncAdapter |
|---|---|
| `repo.insert(&item).await?` | `repo.insert(&item)?` |
| `repo.find_by_id(id).await?` | `repo.find_by_id(id)?` |
| `repo.find_all().await?` | `repo.find_all()?` |
| `repo.find().where_clause(...).fetch_all().await?` | `repo.find().where_clause(...).fetch_all()?` |
| `repo.update().set(...).execute().await?` | `repo.update().set(...).execute()?` |
| `repo.delete_by_id(id).await?` | `repo.delete_by_id(id)?` |
| `repo.migrate().await?` | `repo.migrate()?` |
| `repo.paginate(p, s).await?` | `repo.paginate(p, s)?` |

## Cargo.toml

```toml
[dependencies]
rusticx = { version = "0.1", features = ["postgres", "sync"] }
```

The `sync` feature enables `SyncAdapter`. It is not included in `"full"` by default — you must explicitly opt in.
```

- [ ] **Step 2: Write Advanced Usage**

Create `content/docs/advanced/advanced.mdx`:

```mdx
---
title: Advanced Usage
description: Raw SQL execution, custom field types, the skip attribute, and other advanced patterns.
---

## Raw SQL

The query builder covers most common operations. For complex queries that need raw SQL, access the underlying adapter directly:

### execute_raw — No Return Value

Use for `INSERT`, `UPDATE`, `DELETE`, or DDL statements where you don't need results:

```rust
repo.adapter()
    .execute_raw(
        "DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '7 days'",
        &[],
    )
    .await?;
```

### query_raw — Return Rows

Use when you need to SELECT data that doesn't map to your model, or for complex JOINs:

```rust
let rows = repo
    .adapter()
    .query_raw(
        "SELECT u.id, u.name, COUNT(p.id) AS post_count
         FROM users u
         LEFT JOIN posts p ON p.user_id = u.id
         WHERE u.role = $1
         GROUP BY u.id, u.name",
        &[&"author"],
    )
    .await?;
```

<Callout type="warn">
Always use parameterized queries (`$1`, `$2` for Postgres; `?` for MySQL). Never concatenate user input into SQL strings — this prevents SQL injection.
</Callout>

## The skip Attribute

Use `#[rusticx(skip)]` to exclude a field from all database operations. The field is still part of your Rust struct but rusticx ignores it for INSERT, SELECT, and schema generation:

```rust
#[derive(Model, Serialize, Deserialize)]
pub struct User {
    #[rusticx(primary_key)]
    pub id: Uuid,
    pub name: String,
    #[rusticx(skip)]
    pub cached_display_name: String, // Not persisted — computed at runtime
}
```

## Custom Column Names

Override the database column name while keeping a different Rust field name:

```rust
#[derive(Model, Serialize, Deserialize)]
pub struct Post {
    #[rusticx(primary_key)]
    pub id: Uuid,
    #[rusticx(column = "body_text")]
    pub body: String, // Maps to `body_text` column in DB
}
```

## SQL DEFAULT Values

Set a SQL-level default expression that runs when a value is not provided:

```rust
#[derive(Model, Serialize, Deserialize)]
pub struct Event {
    #[rusticx(primary_key)]
    pub id: Uuid,
    pub name: String,
    #[rusticx(default = "NOW()")]
    pub created_at: String, // Defaults to current timestamp if not set
}
```

## Using Multiple Databases

You can have multiple repos pointing to different database backends in the same application:

```rust
let pg_repo = PostgresRepo::<User>::new(&postgres_url).await?;
let mongo_repo = MongoRepo::<EventLog>::new(&mongo_url, "logs").await?;

pg_repo.migrate().await?;
mongo_repo.migrate().await?;

// Use each independently
let users = pg_repo.find_all().await?;
let logs = mongo_repo.find_all().await?;
```
```

- [ ] **Step 3: Write API Reference**

Create `content/docs/advanced/api-reference.mdx`:

```mdx
---
title: API Reference
description: Complete reference for all public methods, attributes, enums, and types in rusticx.
---

## Repo Methods

All repo types (`PostgresRepo<T>`, `MySqlRepo<T>`, `MongoRepo<T>`) implement the same trait. Every method is async and returns `Result<_, _>`.

### Creation

| Method | Description |
|---|---|
| `PostgresRepo::<T>::new(url)` | Create a new Postgres repo with connection pool |
| `MySqlRepo::<T>::new(url)` | Create a new MySQL repo with connection pool |
| `MongoRepo::<T>::new(url, db)` | Create a new MongoDB repo |

### Schema

| Method | Returns | Description |
|---|---|---|
| `repo.migrate()` | `Result<()>` | Run `CREATE TABLE IF NOT EXISTS` for the model |

### Insert

| Method | Returns | Description |
|---|---|---|
| `repo.insert(&item)` | `Result<()>` | Insert a single record |
| `repo.insert_many(&items)` | `Result<()>` | Insert multiple records in one statement |
| `repo.save(&item)` | `Result<()>` | Insert or update (upsert on primary key) |

### Find

| Method | Returns | Description |
|---|---|---|
| `repo.find_by_id(id)` | `Result<Option<T>>` | Find by primary key |
| `repo.find_all()` | `Result<Vec<T>>` | Fetch all records |
| `repo.find()` | `FindBuilder<T>` | Start a filtered find query |
| `repo.find_one()` | `FindOneBuilder<T>` | Start a find-single-record query |
| `repo.paginate(page, size)` | `Result<Page<T>>` | Paginated results (1-indexed) |
| `repo.count()` | `CountBuilder` | Start a count query |

### Update / Delete

| Method | Returns | Description |
|---|---|---|
| `repo.update()` | `UpdateBuilder<T>` | Start an update query |
| `repo.delete()` | `DeleteBuilder<T>` | Start a filtered delete query |
| `repo.delete_by_id(id)` | `Result<()>` | Delete by primary key |

### Raw Access

| Method | Returns | Description |
|---|---|---|
| `repo.adapter()` | `&Adapter` | Access the underlying database adapter |
| `adapter.execute_raw(sql, params)` | `Result<()>` | Run raw SQL, no return value |
| `adapter.query_raw(sql, params)` | `Result<Vec<Row>>` | Run raw SQL, return rows |

---

## Builder Methods

### FindBuilder / FindOneBuilder

| Method | Description |
|---|---|
| `.where_clause(col, op, val)` | Add a WHERE condition (multiple = AND) |
| `.order_by(col, direction)` | Add ORDER BY |
| `.limit(n)` | Limit result count |
| `.fetch_all()` | Execute → `Result<Vec<T>>` |
| `.fetch()` | Execute → `Result<Option<T>>` |

### UpdateBuilder

| Method | Description |
|---|---|
| `.where_clause(col, op, val)` | Add a WHERE condition |
| `.set(col, val)` | Set a column value |
| `.execute()` | Execute → `Result<()>` |

### DeleteBuilder

| Method | Description |
|---|---|
| `.where_clause(col, op, val)` | Add a WHERE condition |
| `.execute()` | Execute → `Result<()>` |

### CountBuilder

| Method | Description |
|---|---|
| `.where_clause(col, op, val)` | Add a WHERE condition |
| `.fetch()` | Execute → `Result<u64>` |

---

## CondOp Enum

```rust
pub enum CondOp {
    Eq,       // =
    NotEq,    // <>
    Gt,       // >
    Gte,      // >=
    Lt,       // <
    Lte,      // <=
    Like,     // LIKE
    IsNull,   // IS NULL    (pass () as value)
    IsNotNull,// IS NOT NULL (pass () as value)
}
```

## Direction Enum

```rust
pub enum Direction {
    Asc,
    Desc,
}
```

## Page\<T\> Struct

Returned by `repo.paginate(page, size)`:

```rust
pub struct Page<T> {
    pub items: Vec<T>,
    pub total: u64,       // Total record count
    pub page: u64,        // Current page (1-indexed)
    pub size: u64,        // Page size requested
    pub total_pages: u64, // ceil(total / size)
}
```

---

## Model Attributes

### Struct-level

| Attribute | Description |
|---|---|
| `#[rusticx(table = "name")]` | Override table/collection name |
| `#[rusticx(primary_key = "field")]` | Override primary key field name |

### Field-level

| Attribute | Description |
|---|---|
| `#[rusticx(primary_key)]` | Mark as primary key |
| `#[rusticx(unique)]` | Add UNIQUE constraint |
| `#[rusticx(nullable)]` | Allow NULL — use with `Option<T>` |
| `#[rusticx(default = "expr")]` | SQL DEFAULT expression |
| `#[rusticx(column = "name")]` | Override column name |
| `#[rusticx(skip)]` | Exclude from persistence |
```

- [ ] **Step 4: Verify all docs in browser**

```bash
bun run dev
```

Open `http://localhost:3000/docs`. Verify:
- Sidebar shows all 4 groups: root items → Guides (5) → Database Guides (3) → Advanced (3)
- Navigate to each page and confirm content renders
- No 404s on any doc page

- [ ] **Step 5: Final commit**

```bash
git add content/docs/advanced/
git commit -m "docs: add advanced docs (sync adapter, advanced usage, API reference)"
```

---

## Task 10: Final Polish and Build Check

- [ ] **Step 1: Run production build**

```bash
bun run build 2>&1
```

Expected: Build completes with no errors. Note any TypeScript warnings and fix them.

- [ ] **Step 2: Fix any type errors**

Common issues to check:
- `app/layout.tsx` — if `LayoutProps` type errors, ensure `next` types are up to date
- `components/CodeRain.tsx` — `useRef<HTMLCanvasElement>` type should be fine with TS strict mode
- `app/(home)/page.tsx` — the `FEATURES` array `icon` field type should be `typeof Database` (lucide icon component)

If the FEATURES array shows type errors, update its type annotation:

```tsx
const FEATURES: { icon: React.FC<{ size?: number; className?: string }>; title: string; desc: string }[] = [
  // ...
];
```

- [ ] **Step 3: Check all pages load**

```bash
bun run start
```

Visit and verify each route:
- `http://localhost:3000` — homepage, all 6 sections visible
- `http://localhost:3000/docs` — overview page, sidebar with all groups
- `http://localhost:3000/docs/getting-started`
- `http://localhost:3000/docs/guides/core-concepts`
- `http://localhost:3000/docs/guides/crud-operations`
- `http://localhost:3000/docs/guides/query-builder`
- `http://localhost:3000/docs/guides/migrations`
- `http://localhost:3000/docs/guides/connection-pooling`
- `http://localhost:3000/docs/databases/postgres`
- `http://localhost:3000/docs/databases/mysql`
- `http://localhost:3000/docs/databases/mongodb`
- `http://localhost:3000/docs/advanced/sync-adapter`
- `http://localhost:3000/docs/advanced/advanced`
- `http://localhost:3000/docs/advanced/api-reference`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete rusticx documentation site with homepage and 13 doc pages"
```
