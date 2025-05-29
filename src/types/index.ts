// 기본 타입 정의
export interface BasePortfolioGroup {
  name: string;
}

export interface BasePortfolio {
  groupId: number;
  broker: string;
  accountNumber: string;
  accountName: string;
  currency: "KRW" | "USD";
}

export interface BasePosition {
  portfolioId: number;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  tradeDate: string;
  strategyCategory: PortfolioCategory;
  strategyTags?: string[];
}

export interface BaseTodo {
  portfolioId: number | null;
  content: string;
  done: boolean;
  createdAt: string;
}

// DB에 저장된 엔티티 타입
export interface PortfolioGroup {
  id: number;
  name: string;
  config?: PortfolioGroupConfig;
}

export interface Portfolio {
  id: number;
  groupId: number;
  name?: string;
  broker: string;
  accountNumber: string;
  accountName: string;
  currency: "KRW" | "USD";
  config?: PortfolioConfig;
  positions?: Position[];
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
}

export interface Todo {
  id: number;
  portfolioGroupId: number;
  text: string;
  content?: string;
  completed: boolean;
  done?: boolean;
  createdAt: number;
  completedAt?: number | null;
}

// 설정 관련 타입
export interface StrategyConfig {
  targetAllocation: number;      // 전체 자산 중 목표 비중 (%)
  riskLevel: number;            // 위험도 (1-5)
  rebalancingPeriod?: string;   // 리밸런싱 주기
  categoryAllocations: {
    [key in PortfolioCategory]: CategoryConfig;
  };
}

export interface CategoryConfig {
  targetPercentage: number;      // 목표 비중 (%)
  maxStockPercentage: number;    // 종목당 최대 비중 (%)
  maxEntries: number;            // 최대 분할 매수 횟수
}

export interface PortfolioConfig {
  totalCapital: number;
  categoryAllocations: Record<PortfolioCategory, CategoryAllocation>;
}

export interface PortfolioGroupConfig {
  targetAllocation: number;
  riskLevel: number;
  categoryAllocations: Record<PortfolioCategory, CategoryAllocation>;
}

// 카테고리 열거형
export enum PortfolioCategory {
  LONG_TERM = 'LONG_TERM',
  GROWTH = 'GROWTH',
  SHORT_TERM = 'SHORT_TERM',
  CASH = 'CASH',
  UNCATEGORIZED = 'UNCATEGORIZED'
}

export interface CategoryAllocation {
  targetPercentage: number;
  maxStockPercentage: number;
  maxEntries: number;
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
  groupId: number;
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

// 새로운 엔티티 생성을 위한 타입
export type NewPortfolioGroup = Omit<PortfolioGroup, 'id'>;
export type NewPortfolio = Omit<Portfolio, 'id'>;
export type NewPosition = Omit<Position, 'id'>;

// 기존 메모 관련 타입 유지
export interface Memo {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type NewMemo = Omit<Memo, 'id'>;

// Todo 관련 타입 수정
export type NewTodo = Omit<Todo, 'id'>; 