import { useEffect, useState } from 'react';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio } from '../types';

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await PortfolioService.getAll();
      setPortfolios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('포트폴리오 로딩 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  const createPortfolio = async (name: string) => {
    try {
      await PortfolioService.create({
        groupId: 0, // 기본 그룹
        broker: '',
        accountNumber: '',
        accountName: name,
        currency: 'KRW',
        config: {
          totalCapital: 0,
          categoryAllocations: {
            'LONG_TERM': {
              targetPercentage: 50,
              maxStockPercentage: 10,
              maxEntries: 3
            },
            'MID_TERM': {
              targetPercentage: 30,
              maxStockPercentage: 7.5,
              maxEntries: 2
            },
            'SHORT_TERM': {
              targetPercentage: 5,
              maxStockPercentage: 5,
              maxEntries: 1
            },
            'UNCATEGORIZED': {
              targetPercentage: 15,
              maxStockPercentage: 100,
              maxEntries: 1
            }
          }
        }
      });
      await loadPortfolios();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포트폴리오 생성 중 오류가 발생했습니다.');
    }
  };

  const deletePortfolio = async (id: number) => {
    try {
      await PortfolioService.delete(id);
      await loadPortfolios();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포트폴리오 삭제 중 오류가 발생했습니다.');
    }
  };

  return {
    portfolios,
    loading,
    error,
    createPortfolio,
    deletePortfolio,
    refresh: loadPortfolios,
  };
} 