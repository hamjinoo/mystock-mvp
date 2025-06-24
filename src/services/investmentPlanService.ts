import {
    InvestmentEntry,
    InvestmentPlan,
    NewInvestmentPlan,
    NewPosition
} from "../types";
import { db } from "./db";
import { PortfolioService } from "./portfolioService";

export class InvestmentPlanService {
  // 투자 계획 생성
  static async create(plan: NewInvestmentPlan): Promise<InvestmentPlan> {
    const planId = await db.addInvestmentPlan(plan);
    const createdPlan = await this.getById(planId);
    if (!createdPlan) throw new Error("투자 계획 생성에 실패했습니다.");
    return createdPlan;
  }

  // 투자 계획 조회 (ID로)
  static async getById(id: number): Promise<InvestmentPlan | undefined> {
    const plan = await db.investmentPlans.get(id);
    if (!plan) return undefined;

    // entries 로드
    plan.entries = await db.investmentEntries.where("planId").equals(id).toArray();
    return plan;
  }

  // 포트폴리오별 투자 계획 목록
  static async getByPortfolioId(portfolioId: number): Promise<InvestmentPlan[]> {
    return await db.getInvestmentPlans(portfolioId);
  }

  // 모든 투자 계획 조회
  static async getAll(): Promise<InvestmentPlan[]> {
    return await db.getInvestmentPlans();
  }

  // 투자 계획 업데이트
  static async update(id: number, data: Partial<InvestmentPlan>): Promise<void> {
    await db.investmentPlans.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  // 투자 계획 삭제
  static async delete(id: number): Promise<void> {
    await db.transaction("rw", [db.investmentPlans, db.investmentEntries], async () => {
      // 관련된 entries 삭제
      await db.investmentEntries.where("planId").equals(id).delete();
      // 계획 삭제
      await db.investmentPlans.delete(id);
    });
  }

  // 투자 회차 실행 (실제 매수)
  static async executeEntry(
    entryId: number,
    executionData: {
      quantity: number;
      price: number;
    }
  ): Promise<void> {
    const entry = await db.investmentEntries.get(entryId);
    if (!entry || entry.status !== 'PLANNED') {
      throw new Error('실행할 수 없는 투자 계획입니다.');
    }

    const plan = await this.getById(entry.planId);
    if (!plan) {
      throw new Error('투자 계획을 찾을 수 없습니다.');
    }

    // 실제 포지션 생성
    const newPosition: NewPosition = {
      portfolioId: plan.portfolioId,
      symbol: plan.symbol,
      name: plan.name,
      quantity: executionData.quantity,
      avgPrice: executionData.price,
      currentPrice: executionData.price,
      tradeDate: Date.now(),
      strategyCategory: 'UNCATEGORIZED',
      strategyTags: [`투자계획-${plan.id}`, `${entry.entryNumber}회차`],
    };

    const positionId = await PortfolioService.createPosition(newPosition);

    // 투자 계획 실행 기록
    await db.executeInvestmentEntry(entryId, {
      quantity: executionData.quantity,
      price: executionData.price,
      positionId: positionId.id,
    });
  }

  // 투자 계획 취소
  static async cancelPlan(id: number): Promise<void> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('투자 계획을 찾을 수 없습니다.');
    }

    if (plan.executedEntries > 0) {
      throw new Error('이미 실행된 회차가 있는 계획은 취소할 수 없습니다.');
    }

    await this.update(id, { status: 'CANCELLED' });
  }

  // 투자 계획 통계
  static async getPlanStats(portfolioId?: number) {
    const plans = portfolioId 
      ? await this.getByPortfolioId(portfolioId)
      : await this.getAll();

    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'PLANNED' || p.status === 'IN_PROGRESS').length,
      completedPlans: plans.filter(p => p.status === 'COMPLETED').length,
      cancelledPlans: plans.filter(p => p.status === 'CANCELLED').length,
      totalBudget: plans.reduce((sum, p) => sum + p.totalBudget, 0),
      executedBudget: plans.reduce((sum, p) => sum + (p.totalBudget - p.remainingBudget), 0),
      remainingBudget: plans.reduce((sum, p) => sum + p.remainingBudget, 0),
    };

    return stats;
  }

  // 다음 실행 가능한 회차 조회
  static async getNextExecutableEntry(planId: number): Promise<InvestmentEntry | null> {
    const plan = await this.getById(planId);
    if (!plan || plan.status === 'COMPLETED' || plan.status === 'CANCELLED') {
      return null;
    }

    const nextEntry = plan.entries
      .filter(entry => entry.status === 'PLANNED')
      .sort((a, b) => a.entryNumber - b.entryNumber)[0];

    return nextEntry || null;
  }

  // 투자 계획 요약 정보
  static async getPlanSummary(planId: number) {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const executedEntries = plan.entries.filter(e => e.status === 'EXECUTED');
    const executedAmount = executedEntries.reduce((sum, e) => sum + (e.executedAmount || 0), 0);
    const totalQuantity = executedEntries.reduce((sum, e) => sum + (e.quantity || 0), 0);
    const averagePrice = totalQuantity > 0 ? executedAmount / totalQuantity : 0;

    return {
      plan,
      executedAmount,
      totalQuantity,
      averagePrice,
      progressRate: (plan.executedEntries / plan.plannedEntries) * 100,
      nextEntry: await this.getNextExecutableEntry(planId),
    };
  }
} 