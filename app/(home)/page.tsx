import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
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

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
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
