import Dexie, { Table, Transaction } from 'dexie';
import {
    Memo,
    NewMemo,
    NewPortfolio,
    NewPosition,
    NewTodo,
    Portfolio,
    PortfolioCategory,
    Position,
    Todo
} from '../types';

class MyStockDB extends Dexie {
  portfolios!: Table<Portfolio>;
  positions!: Table<Position>;
  todos!: Table<Todo>;
  memos!: Table<Memo>;

  constructor() {
    super('MyStockDB');
    
    // 버전 1: 초기 스키마
    this.version(1).stores({
      portfolios: '++id, name',
      positions: '++id, portfolioId, symbol',
      todos: '++id, portfolioId, done',
      memos: '++id, createdAt',
    });

    // 버전 2: Position 테이블에 분할매수 관련 필드 추가
    this.version(2)
      .stores({
        portfolios: '++id, name',
        positions: '++id, portfolioId, symbol',
        todos: '++id, portfolioId, done',
        memos: '++id, createdAt',
      })
      .upgrade(async (trans: Transaction) => {
        const positions = await this.positions.toArray();
        await Promise.all(
          positions.map(async (position: Position) => {
            await this.positions.update(position.id, {
              category: PortfolioCategory.UNCATEGORIZED,
              entryCount: 1,
              maxEntries: 1,
              targetQuantity: position.quantity
            });
          })
        );
      });
  }

  // 포트폴리오 설정 업데이트 메서드 추가
  async updatePortfolioConfig(id: number, config: Portfolio['config']) {
    return await this.portfolios.update(id, { config });
  }

  async addPortfolio(portfolio: NewPortfolio): Promise<number> {
    return await this.portfolios.add(portfolio as Portfolio);
  }

  async addPosition(position: NewPosition): Promise<number> {
    // 새 포지션 추가 시 기본값 설정
    const positionWithDefaults = {
      ...position,
      category: position.category || PortfolioCategory.UNCATEGORIZED,
      entryCount: position.entryCount || 1,
      maxEntries: position.maxEntries || 1,
      targetQuantity: position.targetQuantity || position.quantity,
    } as Position;
    
    return await this.positions.add(positionWithDefaults);
  }

  async addTodo(todo: NewTodo): Promise<number> {
    return await this.todos.add(todo as Todo);
  }

  async addMemo(memo: NewMemo): Promise<number> {
    return await this.memos.add(memo as Memo);
  }

  async updatePortfolio(portfolio: Portfolio) {
    return await this.portfolios.update(portfolio.id, portfolio);
  }

  async updatePosition(position: Position) {
    return await this.positions.update(position.id, position);
  }

  async updateTodo(todo: Todo) {
    return await this.todos.update(todo.id, todo);
  }

  async getPortfolioWithPositions(portfolioId: number) {
    const portfolio = await this.portfolios.get(portfolioId);
    if (!portfolio) return null;

    const positions = await this.positions
      .where('portfolioId')
      .equals(portfolioId)
      .toArray();

    return {
      ...portfolio,
      positions,
    };
  }
}

export const db = new MyStockDB(); 