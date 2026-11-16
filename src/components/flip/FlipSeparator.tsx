import React from 'react';

export const FlipSeparator: React.FC = () => {
  return (
    <div className="flip-separator" aria-hidden="true">
      <div className="flip-separator-dot" />
      <div className="flip-separator-dot" />
    </div>
  );
};

