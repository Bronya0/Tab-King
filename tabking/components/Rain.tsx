import React, { useMemo } from 'react';

interface Raindrop {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  height: number;
  opacity: number;
}

interface RainProps {
  enabled: boolean;
  intensity?: number;
}

const Rain: React.FC<RainProps> = ({ enabled, intensity = 100 }) => {
  const count = Math.floor(intensity / 2);

  const raindrops: Raindrop[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2,
      animationDelay: Math.random() * 2,
      height: 15 + Math.random() * 20,
      opacity: 0.3 + Math.random() * 0.3,
    }));
  }, [count]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-1">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute bg-gradient-to-b from-gray-300/60 to-gray-500/40 rounded-full animate-rain"
          style={{
            left: `${drop.left}%`,
            top: '-20px',
            width: '3px',
            height: `${drop.height}px`,
            '--opacity': drop.opacity,
            animationDuration: `${drop.animationDuration}s`,
            animationDelay: `${drop.animationDelay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default Rain;
