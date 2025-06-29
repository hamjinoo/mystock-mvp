import Dexie, { Table, Transaction } from "dexie";
import {
    Account,
    CashBalance,
    InvestmentApproval,
    InvestmentEntry,
    InvestmentPlan,
    InvestmentRules,
    Memo,
    NewInvestmentPlan,
    NewInvestmentRules,
    NewMemo,
    NewPortfolio,
    NewPosition,
    NewTodo,
    Portfolio,
    Position,
    Todo,
} from "../types";

interface BackupData {
  timestamp: number;
  name: string;
  dbVersion: number;
  data: {
    portfolios: Portfolio[];
    positions: Position[];
    todos: Todo[];
    memos: Memo[];
    accounts: Account[];
  };
}

export class MyStockDatabase extends Dexie {
  portfolios!: Table<Portfolio>;
  positions!: Table<Position>;
  todos!: Table<Todo>;
  memos!: Table<Memo>;
  accounts!: Table<Account>;
  investmentPlans!: Table<InvestmentPlan>;
  investmentEntries!: Table<InvestmentEntry>;
  cashBalances!: Table<CashBalance>;
  investmentRules!: Table<InvestmentRules>;
  investmentApprovals!: Table<InvestmentApproval>;

  constructor() {
    super("MyStockDB");

    this.version(1).stores({
      accounts: "++id, broker, accountNumber, currency",
      portfolios: "++id, accountId, name, currency",
      positions: "++id, portfolioId, symbol, strategyCategory",
      todos: "++id, portfolioId, completed, createdAt",
    });

    this.version(7).upgrade((tx: Transaction) => {
      return tx
        .table("todos")
        .toCollection()
        .modify((todo: Todo) => {
          if ("portfolioGroupId" in todo) {
            (todo as any).portfolioId = (todo as any).portfolioGroupId;
            delete (todo as any).portfolioGroupId;
          }
        });
    });

    // 메모 테이블 추가
    this.version(8).stores({
      accounts: "++id, broker, accountNumber, currency",
      portfolios: "++id, accountId, name, currency",
      positions: "++id, portfolioId, symbol, strategyCategory",
      todos: "++id, portfolioId, completed, createdAt",
      memos: "++id, title, content, createdAt, updatedAt",
    });

    // 현금 관리와 투자 계획 테이블 추가
    this.version(9).stores({
      accounts: "++id, broker, accountNumber, currency, totalBalance",
      portfolios: "++id, accountId, name, currency",
      positions: "++id, portfolioId, symbol, strategyCategory",
      todos: "++id, portfolioId, completed, createdAt",
      memos: "++id, title, content, createdAt, updatedAt",
      investmentPlans: "++id, portfolioId, symbol, status, createdAt",
      investmentEntries: "++id, planId, entryNumber, status, executedAt",
      cashBalances: "++id, accountId, portfolioId, cashBalance, investedAmount, totalBalance, utilizationRate, lastUpdated",
    });

    this.version(10).stores({
      accounts: "++id, name, currency, totalBalance, createdAt",
      portfolios: "++id, accountId, name, currency, createdAt",
      positions: "++id, portfolioId, symbol, name, quantity, avgPrice, currentPrice, tradeDate, strategyCategory",
      todos: "++id, title, completed, createdAt, portfolioId",
      cashBalances: "++id, accountId, portfolioId, cashBalance, investedAmount, totalBalance, utilizationRate, lastUpdated",
      investmentPlans: "++id, portfolioId, symbol, name, totalBudget, remainingBudget, plannedEntries, executedEntries, status, createdAt",
      investmentEntries: "++id, planId, entryNumber, plannedAmount, status, quantity, executedPrice, executedAmount, executedAt, positionId",
      investmentRules: "++id, portfolioId, maxPositionSize, maxPositionAmount, enableWarnings, createdAt",
      investmentApprovals: "++id, portfolioId, symbol, plannedAmount, status, approvedAt, executedAt"
    });
  }

  async getAccounts(): Promise<Account[]> {
    return await this.accounts.toArray();
  }

  async getAccountById(id: number): Promise<Account | undefined> {
    return await this.accounts.get(id);
  }

  async addAccount(account: Omit<Account, "id">): Promise<number> {
    const accountData = {
      ...account,
      createdAt: Date.now(),
    } as Account;
    return await this.accounts.add(accountData);
  }

  async updateAccount(id: number, account: Partial<Account>): Promise<void> {
    await this.accounts.update(id, account);
  }

  async deleteAccount(id: number): Promise<void> {
    // 계좌에 속한 포트폴리오와 포지션도 함께 삭제
    const portfolios = await this.portfolios
      .where("accountId")
      .equals(id)
      .toArray();
    const portfolioIds = portfolios.map((p) => p.id);

    // 포지션 삭제
    await this.positions.where("portfolioId").anyOf(portfolioIds).delete();
    // 포트폴리오 삭제
    await this.portfolios.where("accountId").equals(id).delete();
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
      .where("portfolioId")
      .equals(position.portfolioId)
      .toArray();

    const positionWithDefaults = {
      ...position,
      strategyCategory: position.strategyCategory || "UNCATEGORIZED",
      strategyTags: position.strategyTags || [],
      entryCount: position.entryCount || 1,
      maxEntries: position.maxEntries || 1,
      targetQuantity: position.targetQuantity || position.quantity,
      order: positionsInPortfolio.length,
    } as Position;

    return await this.positions.add(positionWithDefaults);
  }

  async addTodo(todo: NewTodo): Promise<number> {
    return await this.todos.add(todo as Todo);
  }

  async addMemo(memo: NewMemo): Promise<number> {
    const memoData = {
      ...memo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Memo;
    return await this.memos.add(memoData);
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
      updatedAt: Date.now(),
    });
  }

  async getPortfolioWithPositions(portfolioId: number) {
    const portfolio = await this.portfolios.get(portfolioId);
    if (!portfolio) return null;

    const positions = await this.positions
      .where("portfolioId")
      .equals(portfolioId)
      .toArray();

    return {
      ...portfolio,
      positions,
    };
  }

  async exportData() {
    try {
      const [portfolios, positions, todos, memos, accounts] = await Promise.all(
        [
          this.portfolios.toArray(),
          this.positions.toArray(),
          this.todos.toArray(),
          this.memos.toArray(),
          this.accounts.toArray(),
        ]
      );

      return {
        version: 7,
        timestamp: Date.now(),
        data: {
          portfolios,
          positions,
          todos,
          memos,
          accounts,
        },
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  async importData(importData: BackupData) {
    try {
      if (!importData.data || !importData.dbVersion) {
        throw new Error("Invalid backup data format");
      }

      await this.transaction(
        "rw",
        [
          this.portfolios,
          this.positions,
          this.todos,
          this.memos,
          this.accounts,
        ],
        async () => {
          await Promise.all([
            this.portfolios.clear(),
            this.positions.clear(),
            this.todos.clear(),
            this.memos.clear(),
            this.accounts.clear(),
          ]);

          await Promise.all([
            this.portfolios.bulkAdd(importData.data.portfolios),
            this.positions.bulkAdd(importData.data.positions),
            this.todos.bulkAdd(importData.data.todos),
            this.memos.bulkAdd(importData.data.memos),
            this.accounts.bulkAdd(importData.data.accounts || []),
          ]);
        }
      );

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }

  async getMemos(): Promise<Memo[]> {
    return await this.memos.orderBy("updatedAt").reverse().toArray();
  }

  async getMemoById(id: number): Promise<Memo | undefined> {
    return await this.memos.get(id);
  }

  async deleteMemo(id: number): Promise<void> {
    await this.memos.delete(id);
  }

  // 현금 관리 메서드들
  async updateAccountBalance(accountId: number, totalBalance: number): Promise<void> {
    await this.accounts.update(accountId, { totalBalance });
  }

  async getCashBalance(accountId: number): Promise<number> {
    // 계좌의 총 잔고에서 투자된 금액을 빼서 현금 잔고 계산
    const account = await this.accounts.get(accountId);
    if (!account?.totalBalance) return 0;

    const portfolios = await this.portfolios.where("accountId").equals(accountId).toArray();
    const portfolioIds = portfolios.map(p => p.id);

    const positions = await this.positions.where("portfolioId").anyOf(portfolioIds).toArray();
    const investedAmount = positions.reduce((sum, pos) => sum + (pos.quantity * pos.avgPrice), 0);

    return account.totalBalance - investedAmount;
  }

  async getAccountCashBalance(accountId: number) {
    const account = await this.accounts.get(accountId);
    if (!account) return null;

    const portfolios = await this.portfolios.where("accountId").equals(accountId).toArray();
    const portfolioIds = portfolios.map(p => p.id);

    const positions = await this.positions.where("portfolioId").anyOf(portfolioIds).toArray();
    const investedAmount = positions.reduce((sum, pos) => sum + (pos.quantity * pos.avgPrice), 0);
    const currentValue = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);

    const totalBalance = account.totalBalance || 0;
    const cashBalance = totalBalance - investedAmount;
    const utilizationRate = totalBalance > 0 ? (investedAmount / totalBalance) * 100 : 0;

    return {
      totalBalance,
      cashBalance,
      investedAmount,
      currentValue,
      utilizationRate,
      profitLoss: currentValue - investedAmount,
      profitLossRate: investedAmount > 0 ? ((currentValue - investedAmount) / investedAmount) * 100 : 0,
    };
  }

  // 투자 계획 메서드들
  async addInvestmentPlan(plan: NewInvestmentPlan): Promise<number> {
    const planData: Omit<InvestmentPlan, 'id' | 'entries'> = {
      ...plan,
      executedEntries: 0,
      remainingBudget: plan.totalBudget,
      status: 'PLANNED' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const planId = await this.investmentPlans.add(planData as any);

    // 계획된 매수 회차들을 생성
    const entries: Omit<InvestmentEntry, 'id'>[] = [];
    const amountPerEntry = plan.totalBudget / plan.plannedEntries;

    for (let i = 1; i <= plan.plannedEntries; i++) {
      entries.push({
        planId: planId as number,
        entryNumber: i,
        plannedAmount: i === plan.plannedEntries 
          ? plan.totalBudget - (amountPerEntry * (plan.plannedEntries - 1)) // 마지막 회차에서 반올림 오차 조정
          : amountPerEntry,
        status: 'PLANNED',
      });
    }

    await this.investmentEntries.bulkAdd(entries as any);
    return planId as number;
  }

  async getInvestmentPlans(portfolioId?: number): Promise<InvestmentPlan[]> {
    const plans = portfolioId 
      ? await this.investmentPlans.where("portfolioId").equals(portfolioId).toArray()
      : await this.investmentPlans.toArray();

    // 각 계획에 대한 entries 로드
    for (const plan of plans) {
      plan.entries = await this.investmentEntries.where("planId").equals(plan.id).toArray();
    }

    return plans;
  }

  async executeInvestmentEntry(
    entryId: number, 
    executionData: {
      quantity: number;
      price: number;
      positionId?: number;
    }
  ): Promise<void> {
    const entry = await this.investmentEntries.get(entryId);
    if (!entry || entry.status !== 'PLANNED') {
      throw new Error('실행할 수 없는 투자 계획입니다.');
    }

    const executedAmount = executionData.quantity * executionData.price;

    // 투자 계획 실행 기록 업데이트
    await this.investmentEntries.update(entryId, {
      executedAmount,
      executedAt: Date.now(),
      quantity: executionData.quantity,
      price: executionData.price,
      status: 'EXECUTED',
      positionId: executionData.positionId,
    });

    // 투자 계획 상태 업데이트
    const plan = await this.investmentPlans.get(entry.planId);
    if (plan) {
      const executedEntries = plan.executedEntries + 1;
      const remainingBudget = Math.max(0, plan.remainingBudget - executedAmount);
      const status = executedEntries >= plan.plannedEntries ? 'COMPLETED' : 'IN_PROGRESS';

      await this.investmentPlans.update(entry.planId, {
        executedEntries,
        remainingBudget,
        status,
        updatedAt: Date.now(),
      });
    }
  }

  // 투자 규칙 관리
  async addInvestmentRules(rules: NewInvestmentRules): Promise<number> {
    const now = Date.now();
    return await this.investmentRules.add({
      ...rules,
      id: 0, // Dexie가 자동 할당
      createdAt: now,
      updatedAt: now,
    });
  }

  async getInvestmentRules(portfolioId: number): Promise<InvestmentRules | undefined> {
    return await this.investmentRules.where("portfolioId").equals(portfolioId).first();
  }

  async updateInvestmentRules(id: number, updates: Partial<InvestmentRules>): Promise<void> {
    await this.investmentRules.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  // 기본 투자 규칙 생성
  async createDefaultInvestmentRules(portfolioId: number): Promise<InvestmentRules> {
    const defaultRules: NewInvestmentRules = {
      portfolioId,
      // 포지션 규칙 (보수적 기본값)
      maxPositionSize: 20, // 단일 종목 최대 20%
      maxPositionAmount: 1000000, // 단일 종목 최대 100만원
      maxDailyInvestment: 500000, // 일일 최대 50만원
      maxMonthlyInvestment: 2000000, // 월간 최대 200만원
      
      // 포트폴리오 규칙
      minCashReserve: 10, // 최소 현금 10% 보유
      maxPortfolioRisk: 6, // 중간 위험도
      maxSectorConcentration: 40, // 섹터별 최대 40%
      
      // 매수 규칙
      requireConfirmationAbove: 300000, // 30만원 이상 매수 시 확인
      cooldownPeriod: 24, // 24시간 대기
      maxConsecutiveLosses: 3, // 연속 3회 손실 후 중단
      
      // 손절/익절 규칙
      autoStopLoss: false, // 자동 손절 비활성화 (수동 관리)
      stopLossPercentage: 10, // 10% 손절
      autoTakeProfit: false, // 자동 익절 비활성화
      takeProfitPercentage: 20, // 20% 익절
      
      // 경고 설정
      enableWarnings: true, // 경고 시스템 활성화
      warningThreshold: 15, // 15% 임계값
    };

    const rulesId = await this.addInvestmentRules(defaultRules);
    const createdRules = await this.investmentRules.get(rulesId);
    if (!createdRules) {
      throw new Error("투자 규칙 생성에 실패했습니다.");
    }
    return createdRules;
  }

  // 투자 승인 관리
  async addInvestmentApproval(approval: Omit<InvestmentApproval, 'id'>): Promise<number> {
    return await this.investmentApprovals.add({
      ...approval,
      id: 0, // Dexie가 자동 할당
    });
  }

  async getInvestmentApproval(id: number): Promise<InvestmentApproval | undefined> {
    return await this.investmentApprovals.get(id);
  }

  async updateInvestmentApproval(id: number, updates: Partial<InvestmentApproval>): Promise<void> {
    await this.investmentApprovals.update(id, updates);
  }

  async getPendingApprovals(portfolioId: number): Promise<InvestmentApproval[]> {
    return await this.investmentApprovals
      .where("portfolioId").equals(portfolioId)
      .and(approval => approval.status === 'PENDING')
      .toArray();
  }
}

export const db = new MyStockDatabase();

// 데이터베이스 연결 상태 확인
db.on("ready", () => console.log("데이터베이스가 준비되었습니다."));

// 오류 처리
db.open().catch(async (err: Error) => {
  console.error("데이터베이스 오류:", err);

  if (err.name === "SchemaError") {
    console.log("스키마 오류로 인해 데이터베이스를 재설정합니다...");
    await db.delete();
    window.location.reload();
  }
});

// 서버 초기화 시도를 제거하고 로컬 데이터베이스만 사용
// db.initializeFromServer().catch(console.error);
