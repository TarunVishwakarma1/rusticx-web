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
