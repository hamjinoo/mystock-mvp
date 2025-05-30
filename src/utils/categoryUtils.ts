import { PortfolioCategory } from '../types';

export const getCategoryLabel = (category: PortfolioCategory): string => {
  switch (category) {
    case 'LONG_TERM':
      return '장기 투자';
    case 'MID_TERM':
      return '중기 투자';
    case 'SHORT_TERM':
      return '단기 투자';
    case 'UNCATEGORIZED':
    default:
      return '미분류';
  }
};

export const DEFAULT_CATEGORY_ALLOCATIONS: Record<PortfolioCategory, { targetPercentage: number }> = {
  'LONG_TERM': {
    targetPercentage: 50
  },
  'MID_TERM': {
    targetPercentage: 30
  },
  'SHORT_TERM': {
    targetPercentage: 15
  },
  'UNCATEGORIZED': {
    targetPercentage: 5
  }
}; 