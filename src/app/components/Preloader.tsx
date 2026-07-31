import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animation
      const obj = { val: 0 };
      gsap.to(obj, {
        val: 100,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => {
          setPercent(Math.floor(obj.val));
        },
        onComplete: () => {
          // Slide up and fade out the container
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.85,
            ease: 'power4.inOut',
            onComplete: onComplete,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  // Pad the percent with leading zero
  const paddedPercent = String(percent).padStart(3, '0');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black text-stone-200 flex flex-col justify-between p-8 md:p-16 select-none font-mono"
    >
      {/* Top bar */}
      <div className="flex justify-between items-center text-xs tracking-widest text-stone-500 uppercase">
        <div>AI Study Hub — Intelligence System</div>
        <div>EST. 2026</div>
      </div>

      {/* Main counter */}
      <div className="flex flex-col items-start justify-center flex-1 py-10">
        <div className="text-stone-600 text-xs uppercase tracking-widest mb-4">Initializing modules...</div>
        <div ref={percentRef} className="text-[12vw] md:text-[8vw] font-black leading-none tracking-tighter text-white font-sans tabular-nums">
          {paddedPercent}%
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 text-xs text-stone-500 uppercase tracking-widest">
        <div>Một cách tiếp cận học tập hoàn toàn mới</div>
        <div className="flex gap-8">
          <div>Loading assets</div>
          <div>Vạn vật hội tụ</div>
        </div>
      </div>
    </div>
  );
}
