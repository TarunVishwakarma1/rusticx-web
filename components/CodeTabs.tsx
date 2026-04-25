'use client';
import { useState, useRef } from 'react';

interface Tab {
  label: string;
  code: string;
  language?: string; // reserved for future syntax highlighting
}

interface CodeTabsProps {
  tabs: Tab[];
}

export default function CodeTabs({ tabs }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!tabs.length) return null;

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight') {
      const next = (i + 1) % tabs.length;
      setActive(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (i - 1 + tabs.length) % tabs.length;
      setActive(prev);
      tabRefs.current[prev]?.focus();
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-[#111116]">
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-white/10 bg-[#0d0d12]">
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={i === active}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            onClick={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
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
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="p-6 overflow-x-auto"
      >
        <pre className="text-sm font-mono leading-relaxed text-neutral-300 whitespace-pre">
          <code>{tabs[active].code}</code>
        </pre>
      </div>
    </div>
  );
}
