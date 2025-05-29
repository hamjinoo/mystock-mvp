import { renderHook } from '@testing-library/react-hooks';
import { PortfolioCategory, PortfolioConfig, Position } from '../../types';
import { usePositionPlan } from '../usePositionPlan';

describe('usePositionPlan', () => {
  const mockPosition: Position = {
    id: 1,
    portfolioId: 1,
    symbol: 'AAPL',
    quantity: 10,
    avgPrice: 150,
    currentPrice: 160,
    tradeDate: Date.now(),
    category: PortfolioCategory.LONG_TERM,
    entryCount: 1,
    maxEntries: 3,
    targetQuantity: 30
  };

  const mockConfig: PortfolioConfig = {
    totalCapital: 10000000, // 1000만원
    categoryAllocations: {
      [PortfolioCategory.LONG_TERM]: {
        targetPercentage: 50,
        maxStockPercentage: 10,
        maxEntries: 3
      },
      [PortfolioCategory.GROWTH]: {
        targetPercentage: 30,
        maxStockPercentage: 7.5,
        maxEntries: 2
      },
      [PortfolioCategory.SHORT_TERM]: {
        targetPercentage: 5,
        maxStockPercentage: 5,
        maxEntries: 1
      },
      [PortfolioCategory.CASH]: {
        targetPercentage: 15,
        maxStockPercentage: 100,
        maxEntries: 1
      },
      [PortfolioCategory.UNCATEGORIZED]: {
        targetPercentage: 0,
        maxStockPercentage: 0,
        maxEntries: 1
      }
    }
  };

  it('should calculate correct investment amounts', () => {
    const { result } = renderHook(() => usePositionPlan(mockPosition, mockConfig));

    const plan = result.current;
    
    // 최대 투자금: 1000만원의 10% = 100만원
    expect(plan.maxInvestment).toBe(1000000);
    
    // 현재 투자금: 10주 * 150달러 = 1500달러
    expect(plan.investedAmount).toBe(1500);
    
    // 회차당 투자금: 100만원 ÷ 3회 ≈ 33.3만원
    expect(plan.perEntry).toBe(333333.3333333333);
    
    // 남은 투자금: 100만원 - 1500달러
    expect(plan.remainingInvestment).toBe(998500);
  });

  it('should handle remaining entries correctly', () => {
    const { result } = renderHook(() => usePositionPlan(mockPosition, mockConfig));

    const plan = result.current;
    
    // 총 3회 중 1회 완료, 2회 남음
    expect(plan.remainingEntries).toBe(2);
    
    // 다음 목표 수량: (30 - 10) ÷ 2 = 10
    expect(plan.nextTargetQuantity).toBe(10);
  });

  it('should detect over limit cases', () => {
    const overLimitPosition = {
      ...mockPosition,
      entryCount: 4 // 최대 3회를 초과
    };

    const { result } = renderHook(() => usePositionPlan(overLimitPosition, mockConfig));

    expect(result.current.isOverLimit).toBe(true);
    expect(result.current.remainingEntries).toBe(0);
    expect(result.current.nextEntryAmount).toBe(0);
  });

  it('should handle missing config or category', () => {
    const uncategorizedPosition = {
      ...mockPosition,
      category: undefined
    };

    const { result } = renderHook(() => usePositionPlan(uncategorizedPosition, mockConfig));

    // 설정이나 카테고리가 없으면 기본값 반환
    expect(result.current.maxInvestment).toBe(0);
    expect(result.current.perEntry).toBe(0);
    expect(result.current.investedAmount).toBe(1500); // 이것만 계산 가능
  });
}); 