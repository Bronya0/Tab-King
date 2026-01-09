import React, { useMemo } from 'react';

interface Snowflake {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  drift: number;
}

interface SnowflakesProps {
  enabled: boolean;
  count?: number;
}

const Snowflakes: React.FC<SnowflakesProps> = ({ enabled, count = 80 }) => {
  const snowflakes: Snowflake[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 120 - 10,
      duration: 15 + Math.random() * 15,
      delay: -(Math.random() * 20),
      size: 10 + Math.random() * 14,
      opacity: 0.3 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 40,
    }));
  }, [count]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-1">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white animate-snowfall"
          style={{
            left: `${flake.left}%`,
            top: `${flake.top}%`,
            fontSize: `${flake.size}px`,
            '--opacity': flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            '--drift': `${flake.drift}px`,
          } as React.CSSProperties}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowflakes;
