import { NewPosition, Position } from '../types';
import { db } from './db';

export class PositionService {
  static async getByPortfolioId(portfolioId: number): Promise<Position[]> {
    return db.positions
      .where('portfolioId')
      .equals(portfolioId)
      .toArray();
  }

  static async getById(id: number): Promise<Position | undefined> {
    return await db.positions.get(id);
  }

  static async create(data: NewPosition): Promise<Position> {
    const validatedData = {
      ...data,
      symbol: data.symbol.trim().toUpperCase(),
      name: data.name || data.symbol.trim().toUpperCase()
    };
    const id = await db.positions.add(validatedData as any);
    const position = await db.positions.get(id);
    if (!position) throw new Error('포지션 생성에 실패했습니다.');
    return position;
  }

  static async update(id: number, data: Partial<Position>): Promise<void> {
    const validatedData = {
      ...data,
      symbol: data.symbol?.trim().toUpperCase(),
      name: data.name || data.symbol?.trim().toUpperCase(),
      category: data.category || data.strategyCategory,
      strategy: data.strategy,
      entryCount: data.entryCount || 1,
      maxEntries: data.maxEntries || 1,
      targetQuantity: data.targetQuantity || data.quantity
    };
    await db.positions.update(id, validatedData);
  }

  static async delete(id: number): Promise<void> {
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
      const strategy = position.strategyCategory.toString();
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