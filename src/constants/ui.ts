/**
 * UI 관련 상수 정의
 */

// 색상 팔레트
export const CHART_COLORS = [
  "#00C49F",
  "#0088FE",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
] as const;

// 로딩 스피너 크기
export const SPINNER_SIZES = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

// 투자 전략 카테고리
export const STRATEGY_CATEGORIES = {
  LONG_TERM: "장기투자",
  MID_TERM: "중기투자",
  SHORT_TERM: "단기투자",
  UNCATEGORIZED: "미분류",
} as const;

// 통화 기호
export const CURRENCY_SYMBOLS = {
  KRW: "₩",
  USD: "$",
} as const;

// 기본 애니메이션 클래스
export const ANIMATIONS = {
  SPINNER: "animate-spin rounded-full border-b-2 border-gray-300",
  FADE_IN: "transition-opacity duration-200",
  SLIDE_IN: "transition-transform duration-200",
} as const;
