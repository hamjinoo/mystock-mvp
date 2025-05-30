import { NewPortfolio, NewPosition, Portfolio, Position } from '../types';
import { db } from './db';

export class PortfolioService {
  static async getAll(): Promise<Portfolio[]> {
    const portfolios = await db.portfolios.toArray();
    console.log('DB의 모든 포트폴리오 데이터 (상세):', portfolios.map(p => ({
      id: p.id,
      name: p.name,
      accountId: p.accountId,
      config: p.config
    })));
    return portfolios;
  }

  static async getById(id: number): Promise<Portfolio | undefined> {
    return await db.portfolios.get(id);
  }

  static async create(data: NewPortfolio): Promise<Portfolio> {
    const id = await db.addPortfolio(data);
    const portfolio = await this.getById(id);
    if (!portfolio) throw new Error('포트폴리오 생성에 실패했습니다.');
    return portfolio;
  }

  static async update(id: number, data: Partial<Portfolio>): Promise<void> {
    await db.portfolios.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    await db.transaction('rw', [db.portfolios, db.positions, db.todos], async () => {
      await db.positions.where('portfolioId').equals(id).delete();
      await db.todos.where('portfolioId').equals(id).delete();
      await db.portfolios.delete(id);
    });
  }

  static async getWithPositions(id: number): Promise<Portfolio & { positions: Position[] }> {
    const portfolio = await this.getById(id);
    if (!portfolio) throw new Error('포트폴리오를 찾을 수 없습니다.');

    const positions = await db.positions
      .where('portfolioId')
      .equals(id)
      .toArray();

    return {
      ...portfolio,
      positions
    };
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

  static async updatePosition(positionId: number, data: Partial<Position>): Promise<void> {
    const position = await db.positions.get(positionId);
    if (!position) {
      throw new Error('포지션을 찾을 수 없습니다.');
    }

    const validatedData = {
      ...position,
      ...data,
      symbol: data.symbol?.trim().toUpperCase() || position.symbol,
      name: data.name || data.symbol?.trim().toUpperCase() || position.name,
      strategyCategory: data.strategyCategory || position.strategyCategory
    };

    await db.positions.update(positionId, validatedData);
  }

  static async deletePosition(positionId: number): Promise<void> {
    await db.positions.delete(positionId);
  }

  static async updatePositionOrder(id: number, positions: Position[]): Promise<void> {
    await db.transaction('rw', [db.positions], async () => {
      await Promise.all(
        positions.map((position, index) =>
          db.positions.update(position.id, { order: index })
        )
      );
    });
  }

  static async getPortfolioSummary(id: number): Promise<{
    totalValue: number;
    totalCost: number;
    returnRate: number;
    positions: Position[];
  }> {
    const portfolio = await this.getById(id);
    if (!portfolio) throw new Error('포트폴리오를 찾을 수 없습니다.');

    const positions = await db.positions
      .where('portfolioId')
      .equals(id)
      .toArray();

    const totalValue = positions.reduce(
      (sum, pos) => sum + pos.quantity * pos.currentPrice,
      0
    );

    const totalCost = positions.reduce(
      (sum, pos) => sum + pos.quantity * pos.avgPrice,
      0
    );

    const returnRate = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      returnRate,
      positions
    };
  }

  static async getPositionById(positionId: number): Promise<Position | undefined> {
    return await db.positions.get(positionId);
  }

  static async fixPortfolioData(): Promise<void> {
    const portfolios = await db.portfolios.toArray();
    
    // accountId가 없는 포트폴리오 찾기
    const invalidPortfolios = portfolios.filter(p => !p.accountId);
    
    if (invalidPortfolios.length > 0) {
      console.log('accountId가 없는 포트폴리오:', invalidPortfolios);
      
      // 계좌 목록 가져오기
      const accounts = await db.accounts.toArray();
      if (accounts.length === 0) {
        console.error('사용 가능한 계좌가 없습니다.');
        return;
      }
      
      // 첫 번째 계좌의 ID를 사용하여 포트폴리오 업데이트
      const defaultAccountId = accounts[0].id;
      
      await db.transaction('rw', [db.portfolios], async () => {
        for (const portfolio of invalidPortfolios) {
          await db.portfolios.update(portfolio.id, {
            accountId: defaultAccountId
          });
        }
      });
      
      console.log('포트폴리오 데이터가 수정되었습니다.');
    } else {
      console.log('모든 포트폴리오가 유효합니다.');
    }
  }
} 