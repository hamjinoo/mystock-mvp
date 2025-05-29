import { useEffect, useState } from 'react';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio, PortfolioCategory } from '../types';

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setError(null);
      const data = await PortfolioService.getAll();
      setPortfolios(data.map(p => ({
        id: p.id,
        groupId: p.groupId,
        name: p.name,
        broker: p.broker,
        accountNumber: p.accountNumber,
        accountName: p.accountName,
        currency: p.currency,
        config: p.config
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : '포트폴리오 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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