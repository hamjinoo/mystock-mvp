/**
 * 투자 관련 상수 정의
 */

// 기본 투자 규칙 상수
export const DEFAULT_INVESTMENT_RULES = {
  // 포지션 규칙 (보수적 기본값)
  MAX_POSITION_SIZE: 20, // 단일 종목 최대 20%
  MAX_POSITION_AMOUNT: 1000000, // 단일 종목 최대 100만원
  MAX_DAILY_INVESTMENT: 500000, // 일일 최대 50만원
  MAX_MONTHLY_INVESTMENT: 2000000, // 월간 최대 200만원
  
  // 포트폴리오 규칙
  MIN_CASH_RESERVE: 10, // 최소 현금 10% 보유
  MAX_PORTFOLIO_RISK: 6, // 중간 위험도
  MAX_SECTOR_CONCENTRATION: 40, // 섹터별 최대 40%
  
  // 매수 규칙
  REQUIRE_CONFIRMATION_ABOVE: 300000, // 30만원 이상 매수 시 확인
  COOLDOWN_PERIOD: 24, // 24시간 대기
  MAX_CONSECUTIVE_LOSSES: 3, // 연속 3회 손실 후 중단
  
  // 손절/익절 규칙
  AUTO_STOP_LOSS: false, // 자동 손절 비활성화 (수동 관리)
  STOP_LOSS_PERCENTAGE: 10, // 10% 손절
  AUTO_TAKE_PROFIT: false, // 자동 익절 비활성화
  TAKE_PROFIT_PERCENTAGE: 20, // 20% 익절
  
  // 경고 설정
  ENABLE_WARNINGS: true, // 경고 시스템 활성화
  WARNING_THRESHOLD: 15, // 15% 임계값
} as const;

// 투자 계획 기본값
export const DEFAULT_INVESTMENT_PLAN = {
  PLANNED_ENTRIES: 3, // 기본 3회 분할 매수
  MIN_ENTRIES: 1,
  MAX_ENTRIES: 10,
} as const;

// 위험도 레벨
export const RISK_LEVELS = {
  LOW: { min: 1, max: 3, label: '낮음', color: 'green' },
  MEDIUM: { min: 4, max: 6, label: '보통', color: 'yellow' },
  HIGH: { min: 7, max: 10, label: '높음', color: 'red' },
} as const;

// 상태 색상 매핑
export const STATUS_COLORS = {
  PLANNED: 'blue',
  IN_PROGRESS: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red',
  EXECUTED: 'green',
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
} as const;

// 체크리스트 상태 색상
export const CHECK_STATUS_COLORS = {
  PASS: 'green',
  WARNING: 'yellow',
  FAIL: 'red',
} as const; 