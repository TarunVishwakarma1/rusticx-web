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
