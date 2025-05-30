# 변경 이력

## [0.5.0] - 2024-03-XX

### 구현된 기능
- 새로운 레이아웃 구현
  - 하단 네비게이션 바 (홈, 포트폴리오, 계좌, 설정)
  - Suspense를 사용한 로딩 처리
- 계좌 관리 기능
  - 계좌 목록 (AccountList)
  - 계좌 생성 (NewAccount)
  - 계좌 수정 (EditAccount)
  - 계좌 상세 정보 (AccountDetail)
- 포트폴리오 관리 기능
  - 포트폴리오 목록 (PortfolioList)
  - 새 포트폴리오 생성 (NewPortfolio)
  - 포트폴리오 상세 정보 (PortfolioDetail)
  - 포트폴리오 설정 (PortfolioConfig)
- 포지션 관리 기능
  - 새 포지션 추가 (NewPosition)
  - 포지션 수정 (EditPosition)
- 메모 기능
  - 메모 목록 (MemoList)
  - 메모 상세 보기 (MemoDetail)
- 할 일 관리 (Todo)
- 설정 페이지 (Settings)

### 데이터베이스 구조
- Account (계좌)
  - 기본 정보: id, broker, accountNumber, accountName, currency
  - 생성일: createdAt
- Portfolio (포트폴리오)
  - 기본 정보: id, name, currency, accountId
  - 설정: config (투자 기간, 목표 배분 등)
- Position (포지션)
  - 기본 정보: id, symbol, name, quantity, avgPrice, currentPrice
  - 전략 정보: strategyCategory, strategyTags
- Memo (메모)
  - 기본 정보: id, title, content
  - 생성/수정일: createdAt, updatedAt
- Todo (할 일)
  - 기본 정보: id, content, completed
  - 생성일: createdAt

### UI/UX 개선
- Heroicons 아이콘 사용
- 반응형 디자인 적용
- 다크 테마 기본 적용
- 하단 네비게이션으로 주요 기능 접근성 향상

### 라우팅 구조
- 메인: /
- 포트폴리오
  - 목록: /portfolios
  - 생성: /portfolios/new
  - 상세: /portfolios/:portfolioId
  - 설정: /portfolios/:portfolioId/config
- 계좌
  - 목록: /accounts
  - 생성: /accounts/new
  - 상세: /accounts/:accountId
  - 수정: /accounts/:accountId/edit
  - 포지션 추가: /accounts/:accountId/positions/new
  - 포지션 수정: /accounts/:accountId/positions/:positionId/edit
- 메모
  - 목록: /memos
  - 상세: /memos/:id
- 설정: /settings
- 할 일: /todo

## [0.5.1] - 2024-03-XX

### 추가
- 포트폴리오 상세 페이지에 도넛 차트 추가
  - 종목별 비중을 시각적으로 표현
  - 차트 호버 시 상세 정보 표시
  - 종목별 비중 패널 추가
- 포트폴리오 그룹 페이지에서 포트폴리오 링크 추가

### 변경
- UI/UX 개선
  - 포트폴리오 상세 페이지 하단 여백 추가
  - 네비게이션에서 그룹 개수 표시 제거
  - 테이블에 비중 컬럼 추가
  - 통화 표시 형식 통일

## [0.4.0] - 2024-03-XX

### 버그 수정
- 포트폴리오 그룹 기능 제거 후 발생한 문제들 해결
  - 포트폴리오의 accountId가 undefined인 문제 수정
  - 계좌 상세 페이지에서 종목 목록이 표시되지 않는 문제 해결
  - 새 종목 추가 시 포트폴리오 목록이 로드되지 않는 문제 해결

### 개선사항
- AccountService와 PortfolioService의 데이터 로딩 로직 개선
  - 포트폴리오와 포지션 데이터 로딩 최적화
  - 디버깅을 위한 로깅 추가
  - 데이터 정합성 검증 로직 추가

### 기술적 변경사항
- `PortfolioService`에 `fixPortfolioData` 메서드 추가
  - accountId가 없는 포트폴리오 자동 수정 기능
  - 데이터 정합성 검증 및 복구
- 포트폴리오 관련 타입 정의 업데이트
  - Portfolio 인터페이스의 accountId 필수화
  - 관련 서비스 로직 수정 