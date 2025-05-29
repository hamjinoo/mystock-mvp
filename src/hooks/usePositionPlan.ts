import { useMemo } from 'react';
import { PortfolioConfig, Position } from '../types';

export interface PositionPlan {
  maxInvestment: number;         // 최대 투자 가능 금액
  perEntry: number;             // 회차당 투자 금액
  investedAmount: number;       // 현재 투자 금액
  remainingInvestment: number;  // 남은 투자 가능 금액
  nextEntryAmount: number;      // 다음 회차 투자 금액
  remainingEntries: number;     // 남은 매수 횟수
  nextTargetQuantity: number;   // 다음 회차 목표 수량
  isOverLimit: boolean;         // 매수 횟수 초과 여부
  progress: number;             // 투자 진행률 (%)
}

export function usePositionPlan(
  position: Position,
  portfolioConfig?: PortfolioConfig
): PositionPlan {
  return useMemo(() => {
    // 기본값 설정
    const defaultPlan: PositionPlan = {
      maxInvestment: 0,
      perEntry: 0,
      investedAmount: position.quantity * position.avgPrice,
      remainingInvestment: 0,
      nextEntryAmount: 0,
      remainingEntries: 0,
      nextTargetQuantity: 0,
      isOverLimit: false,
      progress: 0
    };

    // 설정이나 카테고리가 없으면 기본값 반환
    if (!portfolioConfig || !position.category) {
      return defaultPlan;
    }

    const categoryConfig = portfolioConfig.categoryAllocations[position.category];
    if (!categoryConfig) {
      return defaultPlan;
    }

    // 투자 금액 계산
    const maxInvestment = (portfolioConfig.totalCapital * categoryConfig.maxStockPercentage) / 100;
    const investedAmount = position.quantity * position.avgPrice;
    const remainingInvestment = Math.max(0, maxInvestment - investedAmount);
    
    // 매수 횟수 계산
    const entryCount = position.entryCount || 1;
    const maxEntries = position.maxEntries || categoryConfig.maxEntries;
    const remainingEntries = Math.max(0, maxEntries - entryCount);
    
    // 회차당 금액 계산
    const perEntry = maxInvestment / maxEntries;
    const nextEntryAmount = remainingEntries > 0 ? Math.min(perEntry, remainingInvestment) : 0;
    
    // 다음 목표 수량 계산
    let nextTargetQuantity = 0;
    if (position.targetQuantity) {
      // 목표 수량이 설정된 경우
      const remainingQuantity = position.targetQuantity - position.quantity;
      nextTargetQuantity = Math.floor(remainingQuantity / (remainingEntries || 1));
    } else {
      // 금액 기준으로 목표 수량 계산
      nextTargetQuantity = Math.floor(nextEntryAmount / position.currentPrice);
    }

    // 진행률 계산
    const progress = (investedAmount / maxInvestment) * 100;

    return {
      maxInvestment,
      perEntry,
      investedAmount,
      remainingInvestment,
      nextEntryAmount,
      remainingEntries,
      nextTargetQuantity,
      isOverLimit: entryCount > maxEntries,
      progress
    };
  }, [position, portfolioConfig]);
} 