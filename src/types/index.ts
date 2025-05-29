// 기본 타입 정의
export interface BasePortfolio {
  name: string;
}

export interface BasePosition {
  portfolioId: number;
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currency: "KRW" | "USD";
  fee: number;
  tradeDate: string;
  strategy?: string;
}

export interface BaseTodo {
  portfolioId: number | null;
  content: string;
  done: boolean;
  createdAt: string;
}

// DB에 저장된 엔티티 타입
export interface Portfolio {
  id: number;
  name: string;
  config?: PortfolioConfig;     // 포트폴리오별 설정
  positionOrder?: number[];
  order?: number;               // 포트폴리오 순서
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
  category: PortfolioCategory;
  strategy?: string;
  
  // 분할매수 관련 필드들 (옵셔널)
  entryCount?: number;          // 현재 매수 횟수
  maxEntries?: number;          // 최대 매수 횟수
  targetQuantity?: number;      // 목표 수량
}

export interface Todo {
  id: number;
  portfolioId: number | null;
  content: string;
  done: boolean;
  createdAt: number;
}

// 새로운 엔티티 생성을 위한 타입
export type NewPortfolio = Omit<Portfolio, 'id'>;
export type NewPosition = Omit<Position, 'id'>;
export type NewTodo = Omit<Todo, 'id'>;

export interface Memo {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type NewMemo = Omit<Memo, 'id'>;

export enum PortfolioCategory {
  UNCATEGORIZED = 'UNCATEGORIZED', // 기존 데이터용 기본값
  LONG_TERM = 'LONG_TERM',        // 장기 Core
  GROWTH = 'GROWTH',              // 성장 Satellite
  SHORT_TERM = 'SHORT_TERM',      // 단기 기회
  CASH = 'CASH'                   // 안전자산 + 유동성
}

export interface CategoryConfig {
  targetPercentage: number;      // 목표 비중 (%)
  maxStockPercentage: number;    // 종목당 최대 비중 (%)
  maxEntries: number;            // 최대 분할 매수 횟수
}

export interface PortfolioConfig {
  totalCapital: number;          // 총 자산 규모
  categoryAllocations: {
    [key in PortfolioCategory]: CategoryConfig;
  };
} 