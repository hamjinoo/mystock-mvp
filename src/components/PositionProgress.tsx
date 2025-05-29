import React from 'react';
import { Position } from '../types';

interface PositionProgressProps {
  position: Position;
}

export const PositionProgress: React.FC<PositionProgressProps> = ({ position }) => {
  const progress = (position.entryCount || 0) / (position.maxEntries || 1) * 100;
  const remainingEntries = (position.maxEntries || 1) - (position.entryCount || 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{position.entryCount || 0}/{position.maxEntries || 1} 회차</span>
        <span>{progress.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {remainingEntries > 0 && (
        <div className="text-xs text-gray-400">
          남은 매수: {remainingEntries}회
        </div>
      )}
    </div>
  );
}; 