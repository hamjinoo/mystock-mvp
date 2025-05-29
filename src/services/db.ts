import Dexie, { Table } from 'dexie';
import {
    Memo,
    NewMemo,
    NewPortfolio,
    NewPortfolioGroup,
    NewPosition,
    NewTodo,
    Portfolio,
    PortfolioCategory,
    PortfolioGroup,
    Position,
    Todo
} from '../types';

export class MyStockDatabase extends Dexie {
  portfolioGroups!: Table<PortfolioGroup>;
  portfolios!: Table<Portfolio>;
  positions!: Table<Position>;
  todos!: Table<Todo>;
  memos!: Table<Memo>;

  constructor() {
    super('MyStockDatabase');
    
    this.version(1).stores({
      portfolioGroups: '++id',
      portfolios: '++id, groupId',
      positions: '++id, portfolioId',
      todos: '++id, portfolioGroupId'
    });
  }

  async addPortfolioGroup(group: NewPortfolioGroup): Promise<number> {
    return await this.portfolioGroups.add(group as PortfolioGroup);
  }

  async updatePortfolioGroup(id: number, group: Partial<PortfolioGroup>) {
    return await this.portfolioGroups.update(id, group);
  }

  async deletePortfolioGroup(id: number) {
    await this.transaction('rw', [this.portfolioGroups, this.portfolios, this.positions, this.todos], async () => {
      const portfolios = await this.portfolios.where('groupId').equals(id).toArray();
      const portfolioIds = portfolios.map(p => p.id);

      await Promise.all([
        this.portfolioGroups.delete(id),
        ...portfolioIds.map(pid => this.positions.where('portfolioId').equals(pid).delete()),
        this.portfolios.where('groupId').equals(id).delete(),
        this.todos.where('portfolioGroupId').equals(id).delete()
      ]);
    });
  }

  async addPortfolio(portfolio: NewPortfolio): Promise<number> {
    return await this.portfolios.add(portfolio as Portfolio);
  }

  async addPosition(position: NewPosition): Promise<number> {
    const positionWithDefaults = {
      ...position,
      strategyCategory: position.strategyCategory || PortfolioCategory.UNCATEGORIZED,
      strategyTags: position.strategyTags || [],
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
    const { id, ...updateData } = position;
    return await this.positions.update(id, updateData);
  }

  async updateTodo(todo: Todo) {
    return await this.todos.update(todo.id, todo);
  }

  async updateMemo(memo: Memo) {
    return await this.memos.update(memo.id, {
      ...memo,
      updatedAt: Date.now()
    });
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

  async exportData() {
    try {
      const [portfolioGroups, portfolios, positions, todos, memos] = await Promise.all([
        this.portfolioGroups.toArray(),
        this.portfolios.toArray(),
        this.positions.toArray(),
        this.todos.toArray(),
        this.memos.toArray()
      ]);

      return {
        version: 4,
        timestamp: Date.now(),
        data: {
          portfolioGroups,
          portfolios,
          positions,
          todos,
          memos
        }
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(importData: any) {
    try {
      if (!importData.data || !importData.version) {
        throw new Error('Invalid backup data format');
      }

      await this.transaction('rw', 
        [this.portfolioGroups, this.portfolios, this.positions, this.todos, this.memos], 
        async () => {
          await Promise.all([
            this.portfolioGroups.clear(),
            this.portfolios.clear(),
            this.positions.clear(),
            this.todos.clear(),
            this.memos.clear()
          ]);

          await Promise.all([
            this.portfolioGroups.bulkAdd(importData.data.portfolioGroups || []),
            this.portfolios.bulkAdd(importData.data.portfolios),
            this.positions.bulkAdd(importData.data.positions),
            this.todos.bulkAdd(importData.data.todos),
            this.memos.bulkAdd(importData.data.memos)
          ]);
        }
      );

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async initializeFromServer() {
    try {
      const response = await fetch('/backup/mystock-data.json');
      if (response.ok) {
        const serverData = await response.json();
        await this.importData(serverData);
        console.log('서버 데이터 복원 완료');
        return true;
      }
    } catch (error) {
      console.warn('서버 데이터 복원 실패:', error);
    }
    return false;
  }
}

export const db = new MyStockDatabase();

// 데이터베이스 연결 상태 확인
db.on('ready', () => console.log('데이터베이스가 준비되었습니다.'));
db.on('versionchange', () => {
  console.log('데이터베이스 버전이 변경되었습니다.');
  window.location.reload();
});

// 오류 처리
db.open().catch((err: Error) => {
  console.error('데이터베이스 오류:', err);
});

db.initializeFromServer().catch(console.error); 