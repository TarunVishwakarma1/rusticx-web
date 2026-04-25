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
