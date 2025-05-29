import { NewPortfolio, NewPosition, Portfolio, Position } from '../types';
import { db } from './db';

export class PortfolioService {
  static async getAll(): Promise<Portfolio[]> {
    return await db.portfolios.toArray();
  }

  static async getById(id: number): Promise<Portfolio | undefined> {
    const portfolio = await db.portfolios.get(id);
    if (!portfolio) return undefined;

    const positions = await db.positions
      .where('portfolioId')
      .equals(id)
      .toArray();

    return {
      ...portfolio,
      positions
    };
  }

  static async getByGroupId(groupId: number): Promise<Portfolio[]> {
    return await db.portfolios.where('groupId').equals(groupId).toArray();
  }

  static async create(data: NewPortfolio): Promise<Portfolio> {
    const validatedData = {
      ...data,
      name: data.accountName
    };
    const id = await db.portfolios.add(validatedData as any);
    const portfolio = await this.getById(id);
    if (!portfolio) throw new Error('포트폴리오 생성에 실패했습니다.');
    return portfolio;
  }

  static async update(id: number, data: Portfolio): Promise<void> {
    await db.portfolios.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    await db.portfolios.delete(id);
    await db.positions.where('portfolioId').equals(id).delete();
  }

  static async getWithPositions(id: number) {
    const portfolio = await this.getById(id);
    if (!portfolio) return null;

    const positions = await db.positions.where('portfolioId').equals(id).toArray();
    return {
      ...portfolio,
      positions
    };
  }

  static async getAllByBroker(broker: string): Promise<Portfolio[]> {
    return await db.portfolios.where('broker').equals(broker).toArray();
  }

  static async getConsolidatedPositions(portfolioIds: number[]) {
    const positions = await db.positions
      .where('portfolioId')
      .anyOf(portfolioIds)
      .toArray();

    const consolidatedMap = new Map<string, any>();

    positions.forEach(position => {
      const key = position.symbol;
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, {
          symbol: position.symbol,
          name: position.name,
          totalQuantity: 0,
          weightedAvgPrice: 0,
          currentPrice: position.currentPrice,
          positions: []
        });
      }

      const consolidated = consolidatedMap.get(key);
      const prevTotal = consolidated.totalQuantity * consolidated.weightedAvgPrice;
      const newQuantity = consolidated.totalQuantity + position.quantity;

      consolidated.totalQuantity = newQuantity;
      consolidated.weightedAvgPrice = 
        (prevTotal + position.quantity * position.avgPrice) / newQuantity;
      consolidated.positions.push(position);
    });

    return Array.from(consolidatedMap.values());
  }

  static async createPosition(data: NewPosition): Promise<Position> {
    const id = await db.positions.add(data as any);
    const position = await db.positions.get(id);
    if (!position) throw new Error('포지션 생성에 실패했습니다.');
    return position;
  }

  static async updatePosition(id: number, data: Position): Promise<void> {
    const validatedData = {
      ...data,
      symbol: data.symbol.trim().toUpperCase(),
      name: data.name || data.symbol.trim().toUpperCase(),
      category: data.category || data.strategyCategory,
      strategy: data.strategy,
      entryCount: data.entryCount || 1,
      maxEntries: data.maxEntries || 1,
      targetQuantity: data.targetQuantity || data.quantity
    };
    await db.positions.update(id, validatedData);
  }

  static async deletePosition(portfolioId: number, positionId: number): Promise<void> {
    await db.positions.delete(positionId);
  }
} 