import Dexie, { Table, Transaction } from 'dexie';
import {
    Account,
    Memo,
    NewMemo,
    NewPortfolio,
    NewPosition,
    NewTodo,
    Portfolio,
    Position,
    Todo
} from '../types';

export class MyStockDatabase extends Dexie {
  portfolios!: Table<Portfolio>;
  positions!: Table<Position>;
  todos!: Table<Todo>;
  memos!: Table<Memo>;
  accounts!: Table<Account>;

  constructor() {
    super('MyStockDB');
    
    this.version(1).stores({
      accounts: '++id, broker, accountNumber, currency',
      portfolios: '++id, accountId, name, currency',
      positions: '++id, portfolioId, symbol, strategyCategory',
      todos: '++id, portfolioId, completed, createdAt'
    });

    this.version(7).upgrade((tx: Transaction) => {
      return tx.table('todos').toCollection().modify((todo: any) => {
        if ('portfolioGroupId' in todo) {
          todo.portfolioId = todo.portfolioGroupId;
          delete todo.portfolioGroupId;
        }
      });
    });
  }

  async getAccounts(): Promise<Account[]> {
    return await this.accounts.toArray();
  }

  async getAccountById(id: number): Promise<Account | undefined> {
    return await this.accounts.get(id);
  }

  async addAccount(account: Omit<Account, 'id'>): Promise<number> {
    const accountData = {
      ...account,
      createdAt: Date.now()
    } as Account;
    return await this.accounts.add(accountData);
  }

  async updateAccount(id: number, account: Partial<Account>): Promise<void> {
    await this.accounts.update(id, account);
  }

  async deleteAccount(id: number): Promise<void> {
    // 계좌에 속한 포트폴리오와 포지션도 함께 삭제
    const portfolios = await this.portfolios.where('accountId').equals(id).toArray();
    const portfolioIds = portfolios.map(p => p.id);
    
    // 포지션 삭제
    await this.positions.where('portfolioId').anyOf(portfolioIds).delete();
    // 포트폴리오 삭제
    await this.portfolios.where('accountId').equals(id).delete();
    // 계좌 삭제
    await this.accounts.delete(id);
  }

  async addPortfolio(portfolio: NewPortfolio): Promise<number> {
    const portfolios = await this.portfolios.toArray();
    const order = portfolios.length;
    return await this.portfolios.add({ ...portfolio, order } as Portfolio);
  }

  async addPosition(position: NewPosition): Promise<number> {
    const positionsInPortfolio = await this.positions
      .where('portfolioId')
      .equals(position.portfolioId)
      .toArray();

    const positionWithDefaults = {
      ...position,
      strategyCategory: position.strategyCategory || 'UNCATEGORIZED',
      strategyTags: position.strategyTags || [],
      entryCount: position.entryCount || 1,
      maxEntries: position.maxEntries || 1,
      targetQuantity: position.targetQuantity || position.quantity,
      order: positionsInPortfolio.length
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
      const [portfolios, positions, todos, memos, accounts] = await Promise.all([
        this.portfolios.toArray(),
        this.positions.toArray(),
        this.todos.toArray(),
        this.memos.toArray(),
        this.accounts.toArray()
      ]);

      return {
        version: 7,
        timestamp: Date.now(),
        data: {
          portfolios,
          positions,
          todos,
          memos,
          accounts
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
        [this.portfolios, this.positions, this.todos, this.memos, this.accounts], 
        async () => {
          await Promise.all([
            this.portfolios.clear(),
            this.positions.clear(),
            this.todos.clear(),
            this.memos.clear(),
            this.accounts.clear()
          ]);

          await Promise.all([
            this.portfolios.bulkAdd(importData.data.portfolios),
            this.positions.bulkAdd(importData.data.positions),
            this.todos.bulkAdd(importData.data.todos),
            this.memos.bulkAdd(importData.data.memos),
            this.accounts.bulkAdd(importData.data.accounts || [])
          ]);
        }
      );

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export const db = new MyStockDatabase();

// 데이터베이스 연결 상태 확인
db.on('ready', () => console.log('데이터베이스가 준비되었습니다.'));

// 오류 처리
db.open().catch(async (err: Error) => {
  console.error('데이터베이스 오류:', err);
  
  if (err.name === 'SchemaError') {
    console.log('스키마 오류로 인해 데이터베이스를 재설정합니다...');
    await db.delete();
    window.location.reload();
  }
});

// 서버 초기화 시도를 제거하고 로컬 데이터베이스만 사용
// db.initializeFromServer().catch(console.error); 