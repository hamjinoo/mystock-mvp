import { useEffect, useState } from 'react';
import { Portfolio, Position } from '../types';

interface PositionPlan {
  maxQuantity: number;
  maxInvestment: number;
  currentInvestment: number;
  remainingInvestment: number;
  targetQuantity: number;
  nextEntryQuantity: number;
}

export function usePositionPlan(portfolio: Portfolio, position: Position): PositionPlan {
  const [plan, setPlan] = useState<PositionPlan>({
    maxQuantity: 0,
    maxInvestment: 0,
    currentInvestment: 0,
    remainingInvestment: 0,
    targetQuantity: 0,
    nextEntryQuantity: 0
  });

  useEffect(() => {
    if (!portfolio.config?.categoryAllocations) return;

    const categoryConfig = portfolio.config.categoryAllocations[position.strategyCategory];
    if (!categoryConfig) return;

    const currentInvestment = position.quantity * position.avgPrice;
    const maxInvestment = (portfolio.config.targetAllocation * categoryConfig.maxStockPercentage) / 100;
    const remainingInvestment = Math.max(0, maxInvestment - currentInvestment);
    const maxQuantity = Math.floor(maxInvestment / position.currentPrice);
    const targetQuantity = Math.min(
      maxQuantity,
      Math.floor(maxInvestment / position.avgPrice)
    );
    const nextEntryQuantity = Math.floor(remainingInvestment / position.currentPrice);

    setPlan({
      maxQuantity,
      maxInvestment,
      currentInvestment,
      remainingInvestment,
      targetQuantity,
      nextEntryQuantity
    });
  }, [portfolio, position]);

  return plan;
} 