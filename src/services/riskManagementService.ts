import {
    CashBalance,
    CashRisk,
    ChecklistItem,
    ConcentrationRisk,
    InvestmentChecklist,
    InvestmentRules,
    NewInvestmentRules,
    Portfolio,
    Position,
    PositionRisk,
    RiskAnalysis,
    RiskWarning
} from "../types";
import { AccountService } from "./accountService";
import { db } from "./db";
import { PortfolioService } from "./portfolioService";

export class RiskManagementService {
  // 투자 규칙 관리
  static async getOrCreateRules(portfolioId: number): Promise<InvestmentRules> {
    let rules = await db.getInvestmentRules(portfolioId);
    
    if (!rules) {
      // 기본 규칙 생성
      rules = await db.createDefaultInvestmentRules(portfolioId);
    }
    
    return rules;
  }

  static async updateRules(portfolioId: number, updates: Partial<NewInvestmentRules>): Promise<void> {
    const rules = await this.getOrCreateRules(portfolioId);
    await db.updateInvestmentRules(rules.id, updates);
  }

  // 포트폴리오 위험 분석
  static async analyzePortfolioRisk(portfolioId: number): Promise<RiskAnalysis> {
    const [portfolio, positions, rules, cashBalance] = await Promise.all([
      PortfolioService.getById(portfolioId),
      PortfolioService.getWithPositions(portfolioId).then(p => p.positions),
      this.getOrCreateRules(portfolioId),
      this.getCashBalance(portfolioId),
    ]);

    if (!portfolio) {
      throw new Error('포트폴리오를 찾을 수 없습니다.');
    }

    const warnings: RiskWarning[] = [];
    const recommendations: string[] = [];

    // 집중도 위험 분석
    const concentrationRisk = this.analyzeConcentrationRisk(positions, portfolio, rules);
    warnings.push(...this.generateConcentrationWarnings(concentrationRisk, rules));

    // 현금 위험 분석
    const cashRisk = this.analyzeCashRisk(cashBalance, rules);
    warnings.push(...this.generateCashWarnings(cashRisk, rules));

    // 포지션별 위험 분석
    const positionRisks = this.analyzePositionRisks(positions, rules);
    warnings.push(...this.generatePositionWarnings(positionRisks, rules));

    // 전체 위험 점수 계산 (1-10)
    const riskScore = this.calculateOverallRiskScore(concentrationRisk, cashRisk, positionRisks);

    // 추천사항 생성
    recommendations.push(...this.generateRecommendations(riskScore, concentrationRisk, cashRisk));

    return {
      portfolioId,
      riskScore,
      warnings: warnings.sort((a, b) => this.getWarningPriority(a.type) - this.getWarningPriority(b.type)),
      recommendations,
      concentrationRisk,
      cashRisk,
      positionRisks,
      analysisDate: Date.now(),
    };
  }

  // 투자 전 체크리스트 생성
  static async createInvestmentChecklist(
    portfolioId: number, 
    symbol: string, 
    plannedAmount: number
  ): Promise<InvestmentChecklist> {
    const [portfolio, positions, rules, cashBalance, riskAnalysis] = await Promise.all([
      PortfolioService.getById(portfolioId),
      PortfolioService.getWithPositions(portfolioId).then(p => p.positions),
      this.getOrCreateRules(portfolioId),
      this.getCashBalance(portfolioId),
      this.analyzePortfolioRisk(portfolioId),
    ]);

    if (!portfolio) {
      throw new Error('포트폴리오를 찾을 수 없습니다.');
    }

    const checks: ChecklistItem[] = [];
    const warnings: RiskWarning[] = [];

    // 1. 현금 잔고 체크
    const cashCheck = this.checkCashAvailability(cashBalance, plannedAmount, rules);
    checks.push(cashCheck);
    if (cashCheck.status === 'WARNING' || cashCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(cashCheck));
    }

    // 2. 포지션 크기 체크
    const positionSizeCheck = this.checkPositionSize(positions, symbol, plannedAmount, portfolio, rules);
    checks.push(positionSizeCheck);
    if (positionSizeCheck.status === 'WARNING' || positionSizeCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(positionSizeCheck));
    }

    // 3. 일일/월간 투자 한도 체크
    const investmentLimitCheck = await this.checkInvestmentLimits(portfolioId, plannedAmount, rules);
    checks.push(investmentLimitCheck);
    if (investmentLimitCheck.status === 'WARNING' || investmentLimitCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(investmentLimitCheck));
    }

    // 4. 쿨다운 기간 체크
    const cooldownCheck = this.checkCooldownPeriod(positions, symbol, rules);
    checks.push(cooldownCheck);
    if (cooldownCheck.status === 'WARNING' || cooldownCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(cooldownCheck));
    }

    // 5. 연속 손실 체크
    const lossStreakCheck = this.checkConsecutiveLosses(positions, symbol, rules);
    checks.push(lossStreakCheck);
    if (lossStreakCheck.status === 'WARNING' || lossStreakCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(lossStreakCheck));
    }

    // 6. 포트폴리오 위험도 체크
    const riskCheck = this.checkPortfolioRisk(riskAnalysis, rules);
    checks.push(riskCheck);
    if (riskCheck.status === 'WARNING' || riskCheck.status === 'FAIL') {
      warnings.push(this.createWarningFromCheck(riskCheck));
    }

    // 전체 위험도 및 진행 가능 여부 결정
    const failedChecks = checks.filter(check => check.status === 'FAIL' && check.isBlocking);
    const warningChecks = checks.filter(check => check.status === 'WARNING');
    
    const overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 
      failedChecks.length > 0 ? 'HIGH' :
      warningChecks.length > 2 ? 'HIGH' :
      warningChecks.length > 0 ? 'MEDIUM' : 'LOW';

    const canProceed = failedChecks.length === 0;

    return {
      portfolioId,
      symbol,
      plannedAmount,
      checks,
      overallRisk,
      canProceed,
      warnings,
    };
  }

  // 집중도 위험 분석
  private static analyzeConcentrationRisk(
    positions: Position[], 
    portfolio: Portfolio, 
    rules: InvestmentRules
  ): ConcentrationRisk {
    const totalValue = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
    
    // 상위 포지션 분석
    const topPositions = positions
      .map(pos => {
        const value = pos.quantity * pos.currentPrice;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        return {
          symbol: pos.symbol,
          name: pos.name,
          percentage,
          risk: percentage > rules.maxPositionSize ? 'HIGH' as const :
                percentage > rules.maxPositionSize * 0.8 ? 'MEDIUM' as const : 'LOW' as const
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // 섹터 집중도 분석 (간단한 구현)
    const sectorConcentration = this.analyzeSectorConcentration(positions, totalValue);

    // 다각화 점수 계산 (1-10, 10이 가장 다각화됨)
    const diversificationScore = this.calculateDiversificationScore(positions);

    return {
      topPositions,
      sectorConcentration,
      diversificationScore,
    };
  }

  // 현금 위험 분석
  private static analyzeCashRisk(cashBalance: CashBalance | null, rules: InvestmentRules): CashRisk {
    if (!cashBalance) {
      return {
        currentCashRatio: 0,
        recommendedCashRatio: rules.minCashReserve,
        utilizationRate: 100,
        risk: 'HIGH',
        daysUntilCashOut: 0,
      };
    }

    const currentCashRatio = (cashBalance.cashBalance / cashBalance.totalBalance) * 100;
    const risk: 'HIGH' | 'MEDIUM' | 'LOW' = 
      currentCashRatio < rules.minCashReserve ? 'HIGH' :
      currentCashRatio < rules.minCashReserve * 1.5 ? 'MEDIUM' : 'LOW';

    // 현재 투자 속도로 현금 소진까지 남은 일수 (간단한 추정)
    const dailyInvestmentRate = rules.maxDailyInvestment || 100000;
    const daysUntilCashOut = Math.floor(cashBalance.cashBalance / dailyInvestmentRate);

    return {
      currentCashRatio,
      recommendedCashRatio: rules.minCashReserve,
      utilizationRate: cashBalance.utilizationRate,
      risk,
      daysUntilCashOut,
    };
  }

  // 포지션 위험 분석
  private static analyzePositionRisks(positions: Position[], rules: InvestmentRules): PositionRisk[] {
    return positions.map(pos => {
      const currentReturn = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
      const violatesRules: string[] = [];

      // 규칙 위반 체크
      const positionValue = pos.quantity * pos.currentPrice;
      if (positionValue > rules.maxPositionAmount) {
        violatesRules.push(`최대 포지션 금액 초과 (${rules.maxPositionAmount.toLocaleString()}원)`);
      }

      // 위험 점수 계산 (1-10)
      let riskScore = 5; // 기본 점수
      if (currentReturn < -rules.stopLossPercentage) riskScore += 2;
      if (currentReturn < -20) riskScore += 2;
      if (violatesRules.length > 0) riskScore += 1;

      return {
        positionId: pos.id,
        symbol: pos.symbol,
        name: pos.name,
        currentReturn,
        riskScore: Math.min(10, Math.max(1, riskScore)),
        consecutiveLosses: 0, // TODO: 실제 계산 구현
        lastTradeDate: pos.tradeDate,
        violatesRules,
      };
    });
  }

  // 현금 잔고 조회 (중복 제거)
  private static async getCashBalance(portfolioId: number): Promise<CashBalance | null> {
    const portfolio = await PortfolioService.getById(portfolioId);
    return portfolio ? await AccountService.getCashBalance(portfolio.accountId) : null;
  }

  // 체크리스트 항목들
  private static checkCashAvailability(
    cashBalance: CashBalance | null, 
    plannedAmount: number, 
    rules: InvestmentRules
  ): ChecklistItem {
    if (!cashBalance) {
      return {
        id: 'cash-availability',
        category: 'CASH',
        title: '현금 잔고 확인',
        status: 'FAIL',
        message: '현금 잔고 정보를 찾을 수 없습니다.',
        isBlocking: true,
      };
    }

    if (plannedAmount > cashBalance.cashBalance) {
      return {
        id: 'cash-availability',
        category: 'CASH',
        title: '현금 잔고 확인',
        status: 'FAIL',
        message: `현금 잔고(${cashBalance.cashBalance.toLocaleString()}원)가 부족합니다.`,
        recommendation: '투자 금액을 줄이거나 현금을 추가 입금하세요.',
        isBlocking: true,
      };
    }

    const afterInvestmentRatio = ((cashBalance.cashBalance - plannedAmount) / cashBalance.totalBalance) * 100;
    
    if (afterInvestmentRatio < rules.minCashReserve) {
      return {
        id: 'cash-availability',
        category: 'CASH',
        title: '현금 잔고 확인',
        status: 'WARNING',
        message: `투자 후 현금 비율이 ${afterInvestmentRatio.toFixed(1)}%로 권장 비율(${rules.minCashReserve}%) 미만입니다.`,
        recommendation: '비상 자금 확보를 위해 현금 비율을 유지하는 것이 좋습니다.',
        isBlocking: false,
      };
    }

    return {
      id: 'cash-availability',
      category: 'CASH',
      title: '현금 잔고 확인',
      status: 'PASS',
      message: '충분한 현금 잔고가 확보되어 있습니다.',
      isBlocking: false,
    };
  }

  private static checkPositionSize(
    positions: Position[], 
    symbol: string, 
    plannedAmount: number, 
    portfolio: Portfolio, 
    rules: InvestmentRules
  ): ChecklistItem {
    const existingPosition = positions.find(pos => pos.symbol === symbol);
    const totalPortfolioValue = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0) + plannedAmount;
    
    const currentPositionValue = existingPosition ? existingPosition.quantity * existingPosition.currentPrice : 0;
    const newPositionValue = currentPositionValue + plannedAmount;
    const newPositionRatio = (newPositionValue / totalPortfolioValue) * 100;

    if (newPositionValue > rules.maxPositionAmount) {
      return {
        id: 'position-size',
        category: 'POSITION',
        title: '포지션 크기 확인',
        status: 'FAIL',
        message: `단일 종목 최대 금액(${rules.maxPositionAmount.toLocaleString()}원)을 초과합니다.`,
        recommendation: '투자 금액을 줄이거나 포지션 한도를 조정하세요.',
        isBlocking: true,
      };
    }

    if (newPositionRatio > rules.maxPositionSize) {
      return {
        id: 'position-size',
        category: 'POSITION',
        title: '포지션 크기 확인',
        status: 'WARNING',
        message: `단일 종목 최대 비중(${rules.maxPositionSize}%)을 초과할 수 있습니다.`,
        recommendation: '포트폴리오 집중도를 낮추기 위해 투자 금액을 조정하세요.',
        isBlocking: false,
      };
    }

    return {
      id: 'position-size',
      category: 'POSITION',
      title: '포지션 크기 확인',
      status: 'PASS',
      message: '적절한 포지션 크기입니다.',
      isBlocking: false,
    };
  }

  private static async checkInvestmentLimits(
    portfolioId: number, 
    plannedAmount: number, 
    rules: InvestmentRules
  ): Promise<ChecklistItem> {
    // TODO: 실제 일일/월간 투자 금액 추적 구현
    // 현재는 단순히 한도와 비교
    
    if (plannedAmount > rules.maxDailyInvestment) {
      return {
        id: 'investment-limits',
        category: 'RULES',
        title: '투자 한도 확인',
        status: 'WARNING',
        message: `일일 투자 한도(${rules.maxDailyInvestment.toLocaleString()}원)를 초과합니다.`,
        recommendation: '투자 금액을 분할하여 여러 날에 걸쳐 진행하세요.',
        isBlocking: false,
      };
    }

    return {
      id: 'investment-limits',
      category: 'RULES',
      title: '투자 한도 확인',
      status: 'PASS',
      message: '투자 한도 내에서 진행됩니다.',
      isBlocking: false,
    };
  }

  private static checkCooldownPeriod(
    positions: Position[], 
    symbol: string, 
    rules: InvestmentRules
  ): ChecklistItem {
    const existingPosition = positions.find(pos => pos.symbol === symbol);
    
    if (existingPosition) {
      const hoursSinceLastTrade = (Date.now() - existingPosition.tradeDate) / (1000 * 60 * 60);
      
      if (hoursSinceLastTrade < rules.cooldownPeriod) {
        const remainingHours = Math.ceil(rules.cooldownPeriod - hoursSinceLastTrade);
        return {
          id: 'cooldown-period',
          category: 'RULES',
          title: '재매수 대기 시간',
          status: 'WARNING',
          message: `동일 종목 재매수까지 ${remainingHours}시간 남았습니다.`,
          recommendation: '충분한 시간을 두고 재매수를 진행하세요.',
          isBlocking: false,
        };
      }
    }

    return {
      id: 'cooldown-period',
      category: 'RULES',
      title: '재매수 대기 시간',
      status: 'PASS',
      message: '재매수 대기 시간이 충족되었습니다.',
      isBlocking: false,
    };
  }

  private static checkConsecutiveLosses(
    positions: Position[], 
    symbol: string, 
    rules: InvestmentRules
  ): ChecklistItem {
    // TODO: 실제 연속 손실 추적 구현
    // 현재는 단순히 현재 손실률만 체크
    const existingPosition = positions.find(pos => pos.symbol === symbol);
    
    if (existingPosition) {
      const currentReturn = ((existingPosition.currentPrice - existingPosition.avgPrice) / existingPosition.avgPrice) * 100;
      
      if (currentReturn < -rules.stopLossPercentage) {
        return {
          id: 'consecutive-losses',
          category: 'POSITION',
          title: '손실 상황 확인',
          status: 'WARNING',
          message: `현재 ${Math.abs(currentReturn).toFixed(1)}% 손실 상태입니다.`,
          recommendation: '손절 기준을 검토하고 추가 매수를 신중히 결정하세요.',
          isBlocking: false,
        };
      }
    }

    return {
      id: 'consecutive-losses',
      category: 'POSITION',
      title: '손실 상황 확인',
      status: 'PASS',
      message: '손실 기준 내에서 관리되고 있습니다.',
      isBlocking: false,
    };
  }

  private static checkPortfolioRisk(riskAnalysis: RiskAnalysis, rules: InvestmentRules): ChecklistItem {
    if (riskAnalysis.riskScore > rules.maxPortfolioRisk) {
      return {
        id: 'portfolio-risk',
        category: 'PORTFOLIO',
        title: '포트폴리오 위험도',
        status: 'WARNING',
        message: `포트폴리오 위험도(${riskAnalysis.riskScore})가 허용 기준(${rules.maxPortfolioRisk})을 초과합니다.`,
        recommendation: '위험도를 낮추기 위해 포지션을 조정하거나 분산 투자를 고려하세요.',
        isBlocking: false,
      };
    }

    return {
      id: 'portfolio-risk',
      category: 'PORTFOLIO',
      title: '포트폴리오 위험도',
      status: 'PASS',
      message: '포트폴리오 위험도가 적절합니다.',
      isBlocking: false,
    };
  }

  // 유틸리티 메서드들
  private static generateConcentrationWarnings(risk: ConcentrationRisk, rules: InvestmentRules): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    
    risk.topPositions.forEach(pos => {
      if (pos.risk === 'HIGH') {
        warnings.push({
          id: `concentration-${pos.symbol}`,
          type: 'HIGH',
          category: 'CONCENTRATION',
          title: '포지션 집중도 위험',
          message: `${pos.symbol}이 포트폴리오의 ${pos.percentage.toFixed(1)}%를 차지합니다.`,
          recommendation: '포지션 크기를 줄이거나 다른 종목으로 분산하세요.',
          canProceed: true,
        });
      }
    });

    return warnings;
  }

  private static generateCashWarnings(cashRisk: CashRisk, rules: InvestmentRules): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    
    if (cashRisk.risk === 'HIGH') {
      warnings.push({
        id: 'cash-risk',
        type: 'HIGH',
        category: 'CASH',
        title: '현금 부족 위험',
        message: `현금 비율이 ${cashRisk.currentCashRatio.toFixed(1)}%로 매우 낮습니다.`,
        recommendation: `최소 ${cashRisk.recommendedCashRatio}%의 현금을 유지하세요.`,
        canProceed: true,
      });
    }

    return warnings;
  }

  private static generatePositionWarnings(positionRisks: PositionRisk[], rules: InvestmentRules): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    
    positionRisks.forEach(pos => {
      if (pos.riskScore >= 8) {
        warnings.push({
          id: `position-risk-${pos.symbol}`,
          type: 'HIGH',
          category: 'POSITION',
          title: '포지션 위험',
          message: `${pos.symbol}의 위험도가 높습니다 (${pos.riskScore}/10).`,
          recommendation: '포지션 크기를 줄이거나 손절을 고려하세요.',
          canProceed: true,
        });
      }
    });

    return warnings;
  }

  private static generateRecommendations(
    riskScore: number, 
    concentrationRisk: ConcentrationRisk, 
    cashRisk: CashRisk
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskScore >= 7) {
      recommendations.push('포트폴리오 위험도가 높습니다. 전체적인 리밸런싱을 고려하세요.');
    }
    
    if (concentrationRisk.diversificationScore < 5) {
      recommendations.push('포트폴리오 분산도가 낮습니다. 다양한 종목/섹터에 투자하세요.');
    }
    
    if (cashRisk.risk === 'HIGH') {
      recommendations.push('현금 비율을 높여 안전성을 확보하세요.');
    }

    return recommendations;
  }

  private static calculateOverallRiskScore(
    concentrationRisk: ConcentrationRisk,
    cashRisk: CashRisk,
    positionRisks: PositionRisk[]
  ): number {
    let score = 5; // 기본 점수

    // 집중도 위험
    if (concentrationRisk.diversificationScore < 3) score += 2;
    else if (concentrationRisk.diversificationScore < 5) score += 1;

    // 현금 위험
    if (cashRisk.risk === 'HIGH') score += 2;
    else if (cashRisk.risk === 'MEDIUM') score += 1;

    // 포지션 위험
    const highRiskPositions = positionRisks.filter(pos => pos.riskScore >= 7).length;
    score += Math.min(2, highRiskPositions);

    return Math.min(10, Math.max(1, score));
  }

  private static calculateDiversificationScore(positions: Position[]): number {
    if (positions.length === 0) return 1;
    if (positions.length >= 10) return 10;
    
    // 간단한 다각화 점수: 종목 수에 기반
    return Math.min(10, positions.length);
  }

  private static analyzeSectorConcentration(positions: Position[], totalValue: number) {
    // 간단한 섹터 분석 (실제로는 외부 API나 데이터베이스에서 섹터 정보를 가져와야 함)
    return [
      {
        sector: '기술',
        percentage: 40,
        risk: 'MEDIUM' as const,
      },
      {
        sector: '금융',
        percentage: 30,
        risk: 'LOW' as const,
      },
    ];
  }

  private static getWarningPriority(type: 'HIGH' | 'MEDIUM' | 'LOW'): number {
    switch (type) {
      case 'HIGH': return 1;
      case 'MEDIUM': return 2;
      case 'LOW': return 3;
      default: return 4;
    }
  }

  private static createWarningFromCheck(check: ChecklistItem): RiskWarning {
    return {
      id: check.id,
      type: check.status === 'FAIL' ? 'HIGH' : 'MEDIUM',
      category: check.category === 'CASH' ? 'CASH' : 
                check.category === 'POSITION' ? 'POSITION' :
                check.category === 'PORTFOLIO' ? 'CONCENTRATION' : 'RULE_VIOLATION',
      title: check.title,
      message: check.message,
      recommendation: check.recommendation || '',
      canProceed: !check.isBlocking,
    };
  }
} 