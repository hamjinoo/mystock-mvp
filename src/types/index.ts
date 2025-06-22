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
