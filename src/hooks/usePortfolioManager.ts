import { useCallback } from 'react';
import { db } from '../services/db';
import { Portfolio, PortfolioCategory, Position } from '../types';

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
      ...portfolio,
      positions: undefined // positions는 별도로 저장되므로 제외
    });

    // 기존 포지션 삭제
    await db.positions.where('portfolioId').equals(portfolio.id).delete();

    // 새 포지션 추가
    if (portfolio.positions) {
      await Promise.all(portfolio.positions.map(position => 
        db.positions.add({
          ...position,
          portfolioId: portfolio.id,
          name: position.name || position.symbol,
          strategyCategory: position.category || PortfolioCategory.UNCATEGORIZED,
          strategyTags: position.strategyTags || []
        })
      ));
    }

    return portfolio;
  }, []);

  return {
    getPortfolio,
    updatePortfolio,
  };
}; 