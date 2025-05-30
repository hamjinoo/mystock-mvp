# MyStock MVP 아키텍처 문서

## 1. 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── services/      # 비즈니스 로직 및 데이터 처리
├── hooks/         # 커스텀 훅
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
├── schemas/       # 데이터 스키마 정의
└── __tests__/     # 테스트 파일
```

## 2. 기술 스택

- React 18
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB)
- React Router v6
- Heroicons
- @hello-pangea/dnd (드래그 앤 드롭)
- Headless UI (모달, 드롭다운 등)

## 3. 주요 기능 구현

### 3.1 데이터 관리
- IndexedDB를 사용한 로컬 데이터 저장
- Dexie.js를 통한 데이터베이스 조작
- 트랜잭션 기반의 데이터 정합성 보장
- 자동 마이그레이션 지원

### 3.2 계좌 관리
- 계좌 CRUD 기능
- 계좌별 포트폴리오 및 포지션 관리
- 계좌 요약 정보 (총자산, 수익률 등)
- 다중 통화 지원 (KRW, USD)

### 3.3 포트폴리오 관리
- 포트폴리오 CRUD 기능
- 포트폴리오 설정 (목표 배분, 카테고리별 설정)
- 드래그 앤 드롭으로 포트폴리오 순서 변경
- 포트폴리오별 성과 분석

### 3.4 포지션 관리
- 포지션 CRUD 기능
- 포지션 계획 (목표 수량, 매수 계획)
- 카테고리별 포지션 관리
- 실시간 수익률 계산

### 3.5 메모 및 할 일
- 메모 CRUD 기능
- 할 일 목록 관리
- 포트폴리오 연동
- 완료 상태 추적

## 4. 컴포넌트 구조

### 4.1 레이아웃
- 하단 네비게이션 바
- Suspense를 사용한 로딩 처리
- 반응형 디자인
- 다크 테마

### 4.2 페이지 컴포넌트
- MainPage: 대시보드 형태의 메인 화면
- AccountList: 계좌 목록
- AccountDetail: 계좌 상세 정보
- PortfolioList: 포트폴리오 목록
- PortfolioDetail: 포트폴리오 상세 정보
- MemoList/Detail: 메모 관리
- Settings: 앱 설정

### 4.3 재사용 컴포넌트
- DraggablePortfolio: 드래그 가능한 포트폴리오 카드
- PositionForm: 포지션 입력/수정 폼
- PortfolioConfigEditor: 포트폴리오 설정 에디터
- NewPositionModal: 새 포지션 추가 모달

## 5. 데이터 모델

### 5.1 Account
```typescript
interface Account {
  id: number;
  broker: string;
  accountNumber: string;
  accountName: string;
  currency: "KRW" | "USD";
  createdAt: number;
}
```

### 5.2 Portfolio
```typescript
interface Portfolio {
  id: number;
  name: string;
  currency: "KRW" | "USD";
  accountId: number;
  config?: PortfolioConfig;
  positions?: Position[];
  order?: number;
}
```

### 5.3 Position
```typescript
interface Position {
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
}
```

## 6. 해결된 문제점

### 6.1 타입 관련 문제
- Account 타입의 id 필드 누락 → Omit<Account, 'id'> 사용으로 해결
- Portfolio와 Position 간의 관계 정의 불명확 → 명확한 타입 정의로 해결
- 컴포넌트 props 타입 불일치 → 인터페이스 정의 개선

### 6.2 데이터 정합성 문제
- 계좌 삭제 시 연관 데이터 미삭제 → 트랜잭션 처리로 해결
- 포트폴리오 순서 관리 문제 → order 필드 추가로 해결
- 포지션 수정 시 데이터 불일치 → 업데이트 로직 개선

### 6.3 성능 문제
- 불필요한 리렌더링 → React.memo 및 useMemo 사용
- 데이터 로딩 지연 → Suspense 및 로딩 상태 관리 개선
- IndexedDB 쿼리 최적화 → 일괄 처리 및 인덱스 활용

## 7. 향후 개선 사항

### 7.1 기능 개선
- 실시간 주가 연동
- 포트폴리오 성과 분석 강화
- 데이터 백업/복원 기능
- 다국어 지원

### 7.2 기술적 개선
- 상태 관리 라이브러리 도입 검토
- 테스트 커버리지 향상
- 성능 모니터링 도구 도입
- PWA 지원 