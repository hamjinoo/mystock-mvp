import { Account, Portfolio, Position } from "../types";
import { db } from "./db";

export class AccountService {
  static async getAll(): Promise<Account[]> {
    return await db.getAccounts();
  }

  static async getById(id: number): Promise<Account | undefined> {
    return await db.getAccountById(id);
  }

  static async create(data: Omit<Account, "id">): Promise<Account> {
    const id = await db.addAccount(data);
    const account = await this.getById(id);
    if (!account) throw new Error("계좌 생성에 실패했습니다.");
    return account;
  }

  static async update(id: number, data: Partial<Account>): Promise<void> {
    await db.updateAccount(id, data);
  }

  static async delete(id: number): Promise<void> {
    await db.deleteAccount(id);
  }

  static async getWithPortfolios(accountId: number): Promise<
    Account & { portfolios: (Portfolio & { positions: Position[] })[] }
  > {
    const account = await db.getAccountById(accountId);
    if (!account) throw new Error("계좌를 찾을 수 없습니다.");

    const portfolios = await db.portfolios
      .where("accountId")
      .equals(accountId)
      .toArray();

    // 모든 포트폴리오의 ID를 한 번에 가져옴
    const portfolioIds = portfolios.map((p) => p.id);

    // 모든 포지션을 한 번에 가져옴
    const positions = await db.positions
      .where("portfolioId")
      .anyOf(portfolioIds)
      .toArray();

    // 포트폴리오별로 포지션 매핑
    const portfoliosWithPositions = portfolios.map((portfolio) => ({
      ...portfolio,
      positions: positions.filter((pos) => pos.portfolioId === portfolio.id),
    }));

    return {
      ...account,
      portfolios: portfoliosWithPositions,
    };
  }

  static async getAccountSummary(accountId: number): Promise<{
    account: Account;
    portfolios: (Portfolio & { positions: Position[] })[];
    totalValue: number;
    totalCost: number;
    returnRate: number;
  }> {
    const accountWithPortfolios = await this.getWithPortfolios(accountId);

    const totalValue = accountWithPortfolios.portfolios.reduce(
      (sum, portfolio) =>
        sum +
        portfolio.positions.reduce(
          (posSum, pos) => posSum + pos.quantity * pos.currentPrice,
          0
        ),
      0
    );

    const totalCost = accountWithPortfolios.portfolios.reduce(
      (sum, portfolio) =>
        sum +
        portfolio.positions.reduce(
          (posSum, pos) => posSum + pos.quantity * pos.avgPrice,
          0
        ),
      0
    );

    const returnRate = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    return {
      account: accountWithPortfolios,
      portfolios: accountWithPortfolios.portfolios,
      totalValue,
      totalCost,
      returnRate,
    };
  }

  // 현금 관리 메서드들 추가
  static async updateAccountBalance(accountId: number, totalBalance: number): Promise<void> {
    await db.updateAccountBalance(accountId, totalBalance);
  }

  static async getCashBalance(accountId: number) {
    return await db.getAccountCashBalance(accountId);
  }

  static async getAccountWithCashBalance(accountId: number) {
    const account = await this.getWithPortfolios(accountId);
    const cashBalance = await this.getCashBalance(accountId);
    
    if (!cashBalance) {
      throw new Error("현금 잔고를 계산할 수 없습니다.");
    }

    return {
      ...account,
      cashBalance,
    };
  }

  // 자금 사용 가능 여부 체크
  static async canAffordInvestment(accountId: number, amount: number): Promise<boolean> {
    const cashBalance = await this.getCashBalance(accountId);
    if (!cashBalance) return false;
    
    return cashBalance.cashBalance >= amount;
  }

  // 투자 후 현금 차감 시뮬레이션
  static async simulateInvestment(accountId: number, amount: number) {
    const cashBalance = await this.getCashBalance(accountId);
    if (!cashBalance) return null;

    const newCashBalance = cashBalance.cashBalance - amount;
    const newUtilizationRate = cashBalance.totalBalance > 0 
      ? ((cashBalance.investedAmount + amount) / cashBalance.totalBalance) * 100 
      : 0;

    return {
      ...cashBalance,
      cashBalance: newCashBalance,
      investedAmount: cashBalance.investedAmount + amount,
      utilizationRate: newUtilizationRate,
      canAfford: newCashBalance >= 0,
    };
  }

  // 모든 계좌를 포트폴리오와 함께 가져오기
  static async getAllWithPortfolios(): Promise<Array<Account & { portfolios: (Portfolio & { positions: Position[] })[], totalValue: number }>> {
    const accounts = await this.getAll();
    
    return await Promise.all(
      accounts.map(async (account) => {
        const portfolios = await db.portfolios
          .where("accountId")
          .equals(account.id)
          .toArray();

        // 모든 포트폴리오의 ID를 한 번에 가져옴
        const portfolioIds = portfolios.map((p) => p.id);

        // 모든 포지션을 한 번에 가져옴
        const positions = await db.positions
          .where("portfolioId")
          .anyOf(portfolioIds)
          .toArray();

        // 포트폴리오별로 포지션 매핑
        const portfoliosWithPositions = portfolios.map((portfolio) => ({
          ...portfolio,
          positions: positions.filter((pos) => pos.portfolioId === portfolio.id),
        }));

        // 전체 계좌 가치 계산
        const totalValue = positions.reduce(
          (sum, pos) => sum + pos.quantity * pos.currentPrice,
          0
        );

        return {
          ...account,
          portfolios: portfoliosWithPositions,
          totalValue,
        };
      })
    );
  }
}
