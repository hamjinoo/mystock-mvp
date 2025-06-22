import { Account, AccountWithPortfolios, Portfolio, Position } from "../types";
import { db } from "./db";

export class AccountService {
  static async getAll(): Promise<Account[]> {
    return await db.getAccounts();
  }

  static async getById(id: number): Promise<Account | undefined> {
    return await db.getAccountById(id);
  }

  static async create(account: Omit<Account, "id">): Promise<number> {
    return await db.addAccount(account);
  }

  static async update(id: number, account: Partial<Account>): Promise<void> {
    await db.updateAccount(id, account);
  }

  static async delete(id: number): Promise<void> {
    await db.deleteAccount(id);
  }

  static async getPortfolios(accountId: number): Promise<Portfolio[]> {
    console.log(
      "getPortfolios called with accountId:",
      accountId,
      typeof accountId
    );

    // 전체 포트폴리오 데이터 확인
    const allPortfolios = await db.portfolios.toArray();
    console.log(
      "전체 포트폴리오 데이터:",
      allPortfolios.map((p) => ({
        id: p.id,
        name: p.name,
        accountId: p.accountId,
        type: typeof p.accountId,
      }))
    );

    const portfolios = await db.portfolios
      .where("accountId")
      .equals(accountId)
      .toArray();

    console.log("Found portfolios:", portfolios);
    return portfolios;
  }

  static async getWithPortfolios(
    id: number
  ): Promise<
    Account & { portfolios: (Portfolio & { positions: Position[] })[] }
  > {
    const account = await this.getById(id);
    if (!account) throw new Error("계좌를 찾을 수 없습니다.");

    const portfolios = await db.portfolios
      .where("accountId")
      .equals(id)
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

  static async getAllWithPortfolios(): Promise<AccountWithPortfolios[]> {
    const accounts = await this.getAll();

    return await Promise.all(
      accounts.map(async (account) => {
        const portfolios = await this.getPortfolios(account.id);

        // 각 포트폴리오의 포지션 로드
        const portfolioIds = portfolios.map((p) => p.id);
        const positions = await db.positions
          .where("portfolioId")
          .anyOf(portfolioIds)
          .toArray();

        // 포트폴리오별 포지션 매핑
        const portfoliosWithPositions = portfolios.map((portfolio) => ({
          ...portfolio,
          positions: positions.filter(
            (pos) => pos.portfolioId === portfolio.id
          ),
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

  static async getAccountSummary(id: number): Promise<{
    account: Account;
    portfolios: (Portfolio & { positions: Position[] })[];
    totalValue: number;
    totalCost: number;
    returnRate: number;
  }> {
    const account = await this.getById(id);
    if (!account) throw new Error("계좌를 찾을 수 없습니다.");

    const portfolios = await db.portfolios
      .where("accountId")
      .equals(id)
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

    // 전체 계좌 가치와 비용 계산
    const totalValue = positions.reduce(
      (sum, pos) => sum + pos.quantity * pos.currentPrice,
      0
    );

    const totalCost = positions.reduce(
      (sum, pos) => sum + pos.quantity * pos.avgPrice,
      0
    );

    const returnRate =
      totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    return {
      account,
      portfolios: portfoliosWithPositions,
      totalValue,
      totalCost,
      returnRate,
    };
  }
}
