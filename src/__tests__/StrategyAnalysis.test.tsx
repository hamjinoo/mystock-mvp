import { render, screen } from '@testing-library/react';
import { StrategyAnalysis } from '../components/StrategyAnalysis';
import { Position } from '../types';

const mockPositions: Position[] = [
  {
    id: 1,
    portfolioId: 1,
    ticker: 'AAPL',
    quantity: 10,
    avgPrice: 150,
    currentPrice: 170,
    currency: 'USD',
    fee: 0.5,
    tradeDate: '2024-03-20',
    strategy: '장기 투자',
  },
  {
    id: 2,
    portfolioId: 1,
    ticker: 'GOOGL',
    quantity: 5,
    avgPrice: 2800,
    currentPrice: 3000,
    currency: 'USD',
    fee: 0.5,
    tradeDate: '2024-03-20',
    strategy: '장기 투자',
  },
  {
    id: 3,
    portfolioId: 1,
    ticker: 'TSLA',
    quantity: 20,
    avgPrice: 200,
    currentPrice: 180,
    currency: 'USD',
    fee: 0.5,
    tradeDate: '2024-03-20',
    strategy: '단기 매매',
  },
];

describe('StrategyAnalysis Component', () => {
  test('전략별 포지션 수 표시', () => {
    render(<StrategyAnalysis positions={mockPositions} />);
    
    expect(screen.getByTestId('position-count-장기 투자').textContent).toBe('2');
    expect(screen.getByTestId('position-count-단기 매매').textContent).toBe('1');
  });

  test('전략별 투자금 및 현재 가치 계산', () => {
    render(<StrategyAnalysis positions={mockPositions} />);
    
    // 장기 투자 전략 (AAPL + GOOGL)
    // 총 투자금: (10 * 150) + (5 * 2800) = 15,500
    // 현재 가치: (10 * 170) + (5 * 3000) = 16,700
    const longTermInvestment = screen.getByTestId('total-investment-장기 투자');
    const longTermValue = screen.getByTestId('current-value-장기 투자');
    
    expect(longTermInvestment.textContent).toBe('15,500');
    expect(longTermValue.textContent).toBe('16,700');
  });

  test('전략별 수익률 계산', () => {
    render(<StrategyAnalysis positions={mockPositions} />);
    
    // 장기 투자 수익률: ((16,700 - 15,500) / 15,500) * 100 ≈ 7.74%
    // 단기 매매 수익률: ((3,600 - 4,000) / 4,000) * 100 = -10.00%
    const longTermProfit = screen.getByTestId('profit-percent-장기 투자');
    const shortTermProfit = screen.getByTestId('profit-percent-단기 매매');
    
    expect(longTermProfit.textContent).toBe('7.74%');
    expect(shortTermProfit.textContent).toBe('-10.00%');
  });

  test('수익률에 따른 색상 표시', () => {
    render(<StrategyAnalysis positions={mockPositions} />);
    
    const longTermProfit = screen.getByTestId('profit-percent-장기 투자');
    const shortTermProfit = screen.getByTestId('profit-percent-단기 매매');
    
    expect(longTermProfit).toHaveClass('text-green-500');
    expect(shortTermProfit).toHaveClass('text-red-500');
  });

  test('전략이 없는 포지션 처리', () => {
    const positionsWithNoStrategy = [
      {
        ...mockPositions[0],
        strategy: undefined
      }
    ];
    
    render(<StrategyAnalysis positions={positionsWithNoStrategy} />);
    
    expect(screen.getByTestId('strategy-name-미분류')).toBeInTheDocument();
  });
}); 