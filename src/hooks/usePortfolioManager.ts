import { useCallback } from 'react';
import { db } from '../services/db';
import { Portfolio, Position } from '../types';

interface PortfolioWithPositions extends Portfolio {
  positions: Position[];
}

export const usePortfolioManager = () => {
  const getPortfolio = useCallback(async (id: number): Promise<PortfolioWithPositions> => {
    const portfolio = await db.portfolios.get(id);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    const positions = await db.positions.where('portfolioId').equals(id).toArray();
    return {
      ...portfolio,
      positions,
    };
  }, []);

  const updatePortfolio = useCallback(async (portfolio: PortfolioWithPositions): Promise<PortfolioWithPositions> => {
    await db.portfolios.put({
      id: portfolio.id,
      name: portfolio.name,
    });

    // 기존 포지션 삭제
    await db.positions.where('portfolioId').equals(portfolio.id).delete();

    // 새 포지션 추가
    await db.positions.bulkPut(
      portfolio.positions.map((position: Position) => ({
        ...position,
        portfolioId: portfolio.id,
      }))
    );

    return portfolio;
  }, []);

  return {
    getPortfolio,
    updatePortfolio,
  };
}; 