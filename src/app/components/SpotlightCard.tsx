import React, { useRef, useState, MouseEvent } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SpotlightCard({ children, className = '', onClick }: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onClick={onClick}
      className={`relative overflow-hidden bg-zinc-900 border border-white/5 p-6 rounded-xl group transition-all duration-300 ${className}`}
      style={{
        ['--mouse-x' as any]: `${coords.x}px`,
        ['--mouse-y' as any]: `${coords.y}px`,
      }}
    >
      {/* Background Spotlight Glow */}
      {isFocused && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.06), transparent 80%)`,
          }}
        />
      )}

      {/* Border Spotlight Glow */}
      {isFocused && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(150px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.35), transparent 100%)`,
            maskImage: `linear-gradient(black, black) content-box, linear-gradient(black, black)`,
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}

      <div className="relative z-20 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
