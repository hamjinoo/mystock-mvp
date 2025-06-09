import { renderHook } from '@testing-library/react-hooks';
import { Portfolio, Position } from '../../types';
import { usePositionPlan } from '../usePositionPlan';

const mockPortfolio: Portfolio = {
  id: 1,
  name: 'Test Portfolio',
  currency: 'KRW',
  accountId: 1,
  config: {
    targetAllocation: 10000000,
    totalCapital: 10000000,
    categoryAllocations: {
      LONG_TERM: {
        targetPercentage: 50,
        maxStockPercentage: 10,
        maxEntries: 3
      }
    }
  }
};

const mockPosition: Position = {
  id: 1,
  portfolioId: 1,
  symbol: 'AAPL',
  name: 'Apple',
  quantity: 10,
  avgPrice: 150,
  currentPrice: 160,
  tradeDate: Date.now(),
  strategyCategory: 'LONG_TERM',
  strategyTags: []
};

describe('usePositionPlan', () => {
  it('calculates plan based on portfolio config', () => {
    const { result } = renderHook(() => usePositionPlan(mockPortfolio, mockPosition));

    expect(result.current.maxInvestment).toBe(1000000);
    expect(result.current.currentInvestment).toBe(1500);
    expect(result.current.remainingInvestment).toBe(998500);
    expect(result.current.maxQuantity).toBe(6250);
    expect(result.current.targetQuantity).toBe(6250);
    expect(result.current.nextEntryQuantity).toBe(6240);
  });

  it('returns zeros when portfolio has no config', () => {
    const portfolio = { ...mockPortfolio, config: undefined };
    const { result } = renderHook(() => usePositionPlan(portfolio, mockPosition));

    expect(result.current.maxInvestment).toBe(0);
    expect(result.current.currentInvestment).toBe(0);
    expect(result.current.remainingInvestment).toBe(0);
    expect(result.current.maxQuantity).toBe(0);
    expect(result.current.targetQuantity).toBe(0);
    expect(result.current.nextEntryQuantity).toBe(0);
  });
});
