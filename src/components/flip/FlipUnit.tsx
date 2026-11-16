import React from 'react';
import { FlipCard } from './FlipCard';

interface FlipUnitProps {
  value: number | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  enableSound?: boolean;
}

export const FlipUnit: React.FC<FlipUnitProps> = ({
  value,
  label,
  size = 'lg',
  enableSound = true,
}) => {
  const formatted = String(value).padStart(2, '0');
  const d1 = formatted[0];
  const d2 = formatted[1];

  return (
    <div className="flip-unit">
      <div className="flip-unit-digits">
        <FlipCard digit={d1} size={size} enableSound={enableSound} />
        <FlipCard digit={d2} size={size} enableSound={enableSound} />
      </div>
      {label && <span className="flip-unit-label">{label}</span>}
    </div>
  );
};

