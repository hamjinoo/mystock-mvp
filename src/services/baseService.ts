import { db } from './db';

/**
 * 공통 서비스 로직을 제공하는 기본 서비스 클래스
 */
export abstract class BaseService {
  /**
   * 포트폴리오별 포지션을 효율적으로 조회
   */
  protected static async getPositionsByPortfolioIds(portfolioIds: number[]) {
    if (portfolioIds.length === 0) return [];
    
    return await db.positions
      .where("portfolioId")
      .anyOf(portfolioIds)
      .toArray();
  }

  /**
   * 포트폴리오별로 포지션을 그룹화
   */
  protected static groupPositionsByPortfolio(positions: any[], portfolios: any[]) {
    return portfolios.map((portfolio) => ({
      ...portfolio,
      positions: positions.filter((pos) => pos.portfolioId === portfolio.id),
    }));
  }

  /**
   * 포트폴리오 가치 계산
   */
  protected static calculatePortfolioValue(positions: any[]) {
    return {
      totalValue: positions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0),
      totalCost: positions.reduce((sum, pos) => sum + pos.quantity * pos.avgPrice, 0),
    };
  }

  /**
   * 수익률 계산
   */
  protected static calculateReturnRate(totalValue: number, totalCost: number) {
    return totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  }
} 