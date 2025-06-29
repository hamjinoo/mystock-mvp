// 기본 타입 정의
export interface BasePortfolio {
  name: string;
  currency: "KRW" | "USD";
  accountId: number;
}

export interface BasePosition {
  portfolioId: number;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  tradeDate: string;
  strategyCategory: "LONG_TERM" | "MID_TERM" | "SHORT_TERM" | "UNCATEGORIZED";
  strategyTags?: string[];
}

export interface BaseTodo {
  portfolioId: number | null;
  content: string;
  done: boolean;
  createdAt: string;
}

// DB에 저장된 엔티티 타입
export interface Account {
  id: number;
  broker: string;
  accountNumber: string;
  accountName: string;
  currency: "KRW" | "USD";
  createdAt: number;
  totalBalance?: number;       // 총 계좌 잔고 (현금 + 투자금)
}

export interface Portfolio {
  id: number;
  name: string;
  currency: "KRW" | "USD";
  accountId: number;
  config?: PortfolioConfig;
  positions?: Position[];
  order?: number;
  accountName?: string;
  broker?: string;
  accountNumber?: string;
}

export interface Position {
  id: number;
  portfolioId: number;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  tradeDate: number;
  strategyCategory: PortfolioCategory;
  strategyTags: string[];
  category?: PortfolioCategory;
  strategy?: string;
  entryCount?: number;
  maxEntries?: number;
  targetQuantity?: number;
  order?: number;
}

export interface Todo {
  id: number;
  portfolioId: number;
  text: string;
  content?: string;
  completed: boolean;
  done?: boolean;
  createdAt: number;
  completedAt?: number | null;
}

export interface Memo {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// 설정 관련 타입
export interface StrategyConfig {
  targetAllocation: number; // 전체 자산 중 목표 비중 (%)
  riskLevel: number; // 위험도 (1-5)
  rebalancingPeriod?: string; // 리밸런싱 주기
  categoryAllocations: {
    [key in PortfolioCategory]: CategoryConfig;
  };
}

export interface CategoryConfig {
  targetPercentage: number;
  maxStockPercentage: number;
  maxEntries: number;
}

export interface PortfolioConfig {
  period?: PortfolioCategory;
  description?: string;
  targetAllocation: number;
  totalCapital: number;
  categoryAllocations?: {
    [key in PortfolioCategory]?: CategoryConfig;
  };
}

// 카테고리 열거형
export type PortfolioCategory =
  | "LONG_TERM"
  | "MID_TERM"
  | "SHORT_TERM"
  | "UNCATEGORIZED";

export interface InvestmentCategory {
  name: string;
  targetAllocation: number;
  maxStocks: number;
  maxStockPercentage: number;
}

export interface CategoryAllocation {
  targetPercentage: number;
}

// 통합 뷰를 위한 인터페이스
export interface ConsolidatedPosition {
  symbol: string;
  name: string;
  totalQuantity: number;
  weightedAvgPrice: number;
  currentPrice: number;
  positions: Position[];
}

export interface StrategySnapshot {
  name: string;
  totalValue: number;
  targetValue: number;
  deviation: number;
  positions: ConsolidatedPosition[];
}

export interface BrokerSnapshot {
  broker: string;
  totalValue: number;
  portfolios: Portfolio[];
  positions: Position[];
}

// 계좌 관련 확장 타입
export interface AccountWithPortfolios extends Account {
  portfolios: (Portfolio & { positions: Position[] })[];
  totalValue: number;
}

// 새로운 엔티티 생성을 위한 타입
export type NewPortfolio = Omit<Portfolio, "id">;
export type NewPosition = Omit<Position, "id">;
export type NewAccount = Omit<Account, "id">;
export type NewMemo = Omit<Memo, "id">;
export type NewTodo = Omit<Todo, "id">;

// 현금 관리를 위한 새로운 타입들
export interface CashBalance {
  totalBalance: number;        // 총 계좌 잔고
  cashBalance: number;         // 현금 잔고
  investedAmount: number;      // 투자 중인 금액
  utilizationRate: number;     // 자금 활용률 (%)
}

export interface AccountBalance extends Account {
  cashBalance: CashBalance;
  portfolios: (Portfolio & { positions: Position[] })[];
  totalValue: number;
}

// 투자 계획을 위한 타입들
export interface InvestmentPlan {
  id: number;
  portfolioId: number;
  symbol: string;
  name: string;
  totalBudget: number;         // 총 투자 예정 금액
  plannedEntries: number;      // 계획된 매수 횟수 (기본 3회)
  executedEntries: number;     // 실행된 매수 횟수
  remainingBudget: number;     // 남은 투자 금액
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  updatedAt: number;
  entries: InvestmentEntry[];
}

export interface InvestmentEntry {
  id: number;
  planId: number;
  entryNumber: number;         // 1회차, 2회차, 3회차
  plannedAmount: number;       // 계획된 투자 금액
  executedAmount?: number;     // 실제 투자된 금액
  executedAt?: number;         // 실행 시점
  quantity?: number;           // 매수 수량
  price?: number;             // 매수 가격
  status: 'PLANNED' | 'EXECUTED' | 'CANCELLED';
  positionId?: number;         // 연결된 포지션 ID
}

// 새로운 생성 타입들
export type NewInvestmentPlan = Omit<InvestmentPlan, "id" | "createdAt" | "updatedAt" | "entries">;
export type NewInvestmentEntry = Omit<InvestmentEntry, "id">;

// 투자 규칙 설정
export interface InvestmentRules {
  id: number;
  portfolioId: number;
  // 포지션 규칙
  maxPositionSize: number; // 단일 종목 최대 비중 (%)
  maxPositionAmount: number; // 단일 종목 최대 금액
  maxDailyInvestment: number; // 일일 최대 투자 금액
  maxMonthlyInvestment: number; // 월간 최대 투자 금액
  
  // 포트폴리오 규칙
  minCashReserve: number; // 최소 현금 보유율 (%)
  maxPortfolioRisk: number; // 최대 포트폴리오 위험도 (1-10)
  maxSectorConcentration: number; // 섹터별 최대 집중도 (%)
  
  // 매수 규칙
  requireConfirmationAbove: number; // 이 금액 이상 매수 시 확인 필요
  cooldownPeriod: number; // 동일 종목 재매수 대기 시간 (시간)
  maxConsecutiveLosses: number; // 연속 손실 후 매수 중단
  
  // 손절/익절 규칙
  autoStopLoss: boolean; // 자동 손절 활성화
  stopLossPercentage: number; // 손절 기준 (%)
  autoTakeProfit: boolean; // 자동 익절 활성화
  takeProfitPercentage: number; // 익절 기준 (%)
  
  // 경고 설정
  enableWarnings: boolean; // 경고 시스템 활성화
  warningThreshold: number; // 경고 임계값 (%)
  
  createdAt: number;
  updatedAt: number;
}

export interface NewInvestmentRules {
  portfolioId: number;
  maxPositionSize: number;
  maxPositionAmount: number;
  maxDailyInvestment: number;
  maxMonthlyInvestment: number;
  minCashReserve: number;
  maxPortfolioRisk: number;
  maxSectorConcentration: number;
  requireConfirmationAbove: number;
  cooldownPeriod: number;
  maxConsecutiveLosses: number;
  autoStopLoss: boolean;
  stopLossPercentage: number;
  autoTakeProfit: boolean;
  takeProfitPercentage: number;
  enableWarnings: boolean;
  warningThreshold: number;
}

// 위험 분석 결과
export interface RiskAnalysis {
  portfolioId: number;
  riskScore: number; // 1-10 (1: 안전, 10: 매우 위험)
  warnings: RiskWarning[];
  recommendations: string[];
  concentrationRisk: ConcentrationRisk;
  cashRisk: CashRisk;
  positionRisks: PositionRisk[];
  analysisDate: number;
}

export interface RiskWarning {
  id: string;
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CONCENTRATION' | 'CASH' | 'POSITION' | 'MARKET' | 'RULE_VIOLATION';
  title: string;
  message: string;
  recommendation: string;
  canProceed: boolean; // 경고에도 불구하고 진행 가능한지
}

export interface ConcentrationRisk {
  topPositions: Array<{
    symbol: string;
    name: string;
    percentage: number;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  sectorConcentration: Array<{
    sector: string;
    percentage: number;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  diversificationScore: number; // 1-10
}

export interface CashRisk {
  currentCashRatio: number;
  recommendedCashRatio: number;
  utilizationRate: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  daysUntilCashOut: number; // 현재 투자 속도로 현금 소진까지 남은 일수
}

export interface PositionRisk {
  positionId: number;
  symbol: string;
  name: string;
  currentReturn: number;
  riskScore: number;
  consecutiveLosses: number;
  lastTradeDate: number;
  violatesRules: string[]; // 위반하는 규칙들
}

// 투자 전 체크리스트
export interface InvestmentChecklist {
  portfolioId: number;
  symbol: string;
  plannedAmount: number;
  checks: ChecklistItem[];
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  canProceed: boolean;
  warnings: RiskWarning[];
}

export interface ChecklistItem {
  id: string;
  category: 'CASH' | 'POSITION' | 'PORTFOLIO' | 'RULES' | 'MARKET';
  title: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  message: string;
  recommendation?: string;
  isBlocking: boolean; // 이 항목이 FAIL이면 투자 불가
}

// 투자 실행 승인
export interface InvestmentApproval {
  id: number;
  portfolioId: number;
  symbol: string;
  plannedAmount: number;
  riskAnalysis: RiskAnalysis;
  checklist: InvestmentChecklist;
  userConfirmed: boolean;
  overrideReason?: string; // 위험에도 불구하고 진행하는 이유
  approvedAt?: number;
  executedAt?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
}
