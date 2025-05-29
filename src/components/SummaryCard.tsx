import React from 'react';
import { Position } from '../types';

interface SummaryCardProps {
  positions: Position[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ positions }) => {
  const calculateSummary = () => {
    const totalInvested = positions.reduce(
      (sum, p) => sum + p.quantity * p.avgPrice,
      0
    );
    const totalCurrent = positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice,
      0
    );
    const profitPercent = totalInvested > 0
      ? ((totalCurrent - totalInvested) / totalInvested) * 100
      : 0;

    return {
      totalAssets: totalCurrent,
      profitPercent,
    };
  };

  const { totalAssets, profitPercent } = calculateSummary();

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">포트폴리오 요약</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">총자산</p>
          <p className="text-2xl font-bold text-white">
            {totalAssets.toLocaleString()} 원
          </p>
        </div>
        <div>
          <p className="text-gray-400">수익률</p>
          <p className={`text-2xl font-bold ${profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}; 