import { PortfolioCategory, Position } from '../types';
import { db } from './db';

export class PositionService {
  static async getByPortfolioId(portfolioId: number): Promise<Position[]> {
    return await db.positions.where('portfolioId').equals(portfolioId).toArray();
  }

  static async getById(id: number): Promise<Position | undefined> {
    return await db.positions.get(id);
  }

  static async create(position: Omit<Position, 'id'>) {
    const validatedData = {
      ...position,
      symbol: position.symbol.trim().toUpperCase(),
      name: position.name || position.symbol.trim().toUpperCase(),
      category: position.category || PortfolioCategory.UNCATEGORIZED,
      tradeDate: new Date(position.tradeDate).getTime(),
    };
    const id = await db.positions.add(validatedData as any);
    return { ...validatedData, id } as Position;
  }

  static async update(position: Position) {
    const validatedData: Position = {
      ...position,
      symbol: position.symbol.trim().toUpperCase(),
      name: position.name || position.symbol.trim().toUpperCase(),
      category: position.category || PortfolioCategory.UNCATEGORIZED,
      tradeDate: new Date(position.tradeDate).getTime(),
    };
    await db.positions.update(position.id, validatedData);
    return validatedData;
  }

  static async delete(id: number) {
    await db.positions.delete(id);
  }

  static async getStrategyPerformance(portfolioId: number) {
    const positions = await this.getByPortfolioId(portfolioId);
    const strategyMap = new Map<string, {
      totalInvestment: number;
      currentValue: number;
      positionCount: number;
    }>();

    positions.forEach(position => {
      const strategy = position.strategy || '미분류';
      const investment = position.quantity * position.avgPrice;
      const currentValue = position.quantity * position.currentPrice;

      const existing = strategyMap.get(strategy) || {
        totalInvestment: 0,
        currentValue: 0,
        positionCount: 0,
      };

      strategyMap.set(strategy, {
        totalInvestment: existing.totalInvestment + investment,
        currentValue: existing.currentValue + currentValue,
        positionCount: existing.positionCount + 1,
      });
    });

    return Array.from(strategyMap.entries()).map(([strategy, data]) => ({
      strategy,
      ...data,
      profitPercent: ((data.currentValue - data.totalInvestment) / data.totalInvestment) * 100,
    }));
  }
} 