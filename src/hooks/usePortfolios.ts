import { useEffect, useState } from 'react';
import { Portfolio } from '../schemas';
import { PortfolioService } from '../services/portfolioService';

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PortfolioService.getAll();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '포트폴리오 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (name: string) => {
    try {
      await PortfolioService.create({ name });
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