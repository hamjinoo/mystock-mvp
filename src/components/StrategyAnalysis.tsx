import React from 'react';
import { Position } from '../types';

interface StrategyAnalysisProps {
  positions: Position[];
}

interface StrategyStats {
  investment: number;
  currentValue: number;
  returnAmount: number;
  returnRate: number;
}

export const StrategyAnalysis: React.FC<StrategyAnalysisProps> = ({ positions }) => {
  const strategyStats = React.useMemo(() => {
    const stats = new Map<string, StrategyStats>();

    positions.forEach(position => {
      const strategy = position.strategyTags.join(', ') || '미분류';
      const investment = position.quantity * position.avgPrice;
      const currentValue = position.quantity * position.currentPrice;
      const returnAmount = currentValue - investment;
      const returnRate = (returnAmount / investment) * 100;

      const existing = stats.get(strategy) || {
        investment: 0,
        currentValue: 0,
        returnAmount: 0,
        returnRate: 0
      };

      stats.set(strategy, {
        investment: existing.investment + investment,
        currentValue: existing.currentValue + currentValue,
        returnAmount: existing.returnAmount + returnAmount,
        returnRate: ((existing.currentValue + currentValue) / (existing.investment + investment) - 1) * 100
      });
    });

    return Array.from(stats.entries()).map(([strategy, stats]) => ({
      strategy,
      ...stats
    }));
  }, [positions]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">전략별 분석</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategyStats.map(({ strategy, investment, currentValue, returnAmount, returnRate }) => (
          <div key={strategy} className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">{strategy}</h3>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-400">투자금</span>
                <span>
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(investment)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">현재가치</span>
                <span>
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(currentValue)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">수익금</span>
                <span className={returnAmount >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(returnAmount)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">수익률</span>
                <span className={returnRate >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {returnRate.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 