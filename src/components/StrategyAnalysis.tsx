import React from 'react';
import { Position } from '../types';

interface StrategyAnalysis {
  strategy: string;
  totalInvestment: number;
  currentValue: number;
  positionCount: number;
  profitPercent: number;
}

interface StrategyAnalysisProps {
  positions: Position[];
}

export const StrategyAnalysis: React.FC<StrategyAnalysisProps> = ({ positions }) => {
  const strategyMap = new Map<string, {
    totalInvestment: number;
    currentValue: number;
    positionCount: number;
  }>();

  positions.forEach(position => {
    const strategy = position.strategy || '미분류';
    const investment = position.quantity * position.avgPrice;
    const currentValue = position.quantity * position.currentPrice;

    const existing = strategyMap.get(strategy) || {
      totalInvestment: 0,
      currentValue: 0,
      positionCount: 0,
    };

    strategyMap.set(strategy, {
      totalInvestment: existing.totalInvestment + investment,
      currentValue: existing.currentValue + currentValue,
      positionCount: existing.positionCount + 1,
    });
  });

  const strategies = Array.from(strategyMap.entries()).map(([strategy, data]) => ({
    strategy,
    ...data,
    profitPercent: ((data.currentValue - data.totalInvestment) / data.totalInvestment) * 100,
  }));

  if (strategies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        전략 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {strategies.map((strategy) => (
        <div
          key={strategy.strategy}
          className="bg-gray-800 rounded-lg p-4 flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">{strategy.strategy}</h3>
              <div className="text-sm text-gray-400">
                {strategy.positionCount}개 포지션
              </div>
            </div>
            <div className={`text-lg font-semibold ${
              strategy.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {strategy.profitPercent.toFixed(2)}%
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">투자금</span>
              <span>₩{strategy.totalInvestment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">평가금</span>
              <span>₩{strategy.currentValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">평가손익</span>
              <span className={strategy.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                ₩{(strategy.currentValue - strategy.totalInvestment).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${
                  strategy.profitPercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.abs(strategy.profitPercent))}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 