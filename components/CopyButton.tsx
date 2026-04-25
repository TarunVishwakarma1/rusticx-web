'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed (e.g. permissions denied) — silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200"
    >
      {copied ? (
        <Check size={14} aria-hidden="true" />
      ) : (
        <Copy size={14} aria-hidden="true" className="opacity-70 group-hover:opacity-100" />
      )}
      {label ?? text}
    </button>
  );
}
