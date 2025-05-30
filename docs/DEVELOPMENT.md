# 개발 문서

## 프로젝트 구조

```
mystock-mvp/
  ├── src/
  │   ├── components/     # 재사용 가능한 컴포넌트
  │   ├── pages/         # 페이지 컴포넌트
  │   ├── services/      # 비즈니스 로직 및 데이터 처리
  │   ├── hooks/         # 커스텀 훅
  │   ├── types/         # TypeScript 타입 정의
  │   └── utils/         # 유틸리티 함수
  ├── docs/             # 프로젝트 문서
  └── public/           # 정적 파일
```

## 데이터 구조

### 계좌 (Account)
- 기본 정보: id, broker, accountNumber, accountName, currency
- 관계: 하나의 계좌는 여러 포트폴리오를 가질 수 있음

### 포트폴리오 그룹 (PortfolioGroup)
- 투자 전략별 포트폴리오 그룹화
- 목표 비중, 위험도, 카테고리별 설정 포함

### 포트폴리오 (Portfolio)
- 기본 정보: id, name, currency
- 필수 필드: accountId (연결된 계좌의 ID)
- 설정: config (투자 기간, 목표 배분 등)
- 관계: 하나의 포트폴리오는 여러 포지션을 가질 수 있음

### 포지션 (Position)
- 기본 정보: id, symbol, name, quantity, avgPrice, currentPrice
- 필수 필드: portfolioId (연결된 포트폴리오의 ID)
- 전략 정보: strategyCategory, strategyTags

## 주요 기능

### 계좌 관리
- 계좌 생성, 수정, 삭제
- 계좌별 자산 현황 조회
- 계좌별 포트폴리오 관리

### 포트폴리오 관리
- 포트폴리오 그룹 생성 및 관리
- 포트폴리오 생성 및 설정
- 종목 추가/수정/삭제
- 자산 배분 현황 시각화

### 성과 분석
- 계좌별/그룹별 수익률 계산
- 종목별 비중 및 수익률 분석
- 차트를 통한 시각화

## 개발 가이드라인

### 코드 스타일
- TypeScript 사용
- 함수형 컴포넌트 사용
- 재사용 가능한 컴포넌트 분리
- 명확한 타입 정의

### 상태 관리
- React Hooks 사용
- 컴포넌트별 상태 관리
- 전역 상태는 필요한 경우에만 사용

### 데이터베이스
- IndexedDB (Dexie.js) 사용
- 트랜잭션 처리
- 마이그레이션 관리

### UI/UX
- Tailwind CSS 사용
- 반응형 디자인
- 다크 모드 지원
- 사용자 친화적 인터페이스

## 배포

### 개발 환경
```bash
npm install    # 의존성 설치
npm run dev    # 개발 서버 실행
```

### 프로덕션 빌드
```bash
npm run build  # 프로덕션 빌드
npm run serve  # 빌드된 파일 로컬 서버로 실행
```

## 문서화

### 문서 작성 규칙
1. 모든 주요 변경사항은 CHANGELOG.md에 기록
2. 코드 변경 시 관련 문서 업데이트
3. 주요 기능은 사용 예제 포함
4. API 및 타입 정의 문서화

### 문서 구조
- CHANGELOG.md: 버전별 변경사항
- DEVELOPMENT.md: 개발 가이드
- README.md: 프로젝트 개요
- API.md: API 문서 (필요시)

## 서비스 로직

### AccountService
- 계좌 CRUD 작업 처리
- 계좌별 포트폴리오 관리
- 계좌 요약 정보 계산 (총 자산, 수익률 등)

### PortfolioService
- 포트폴리오 CRUD 작업 처리
- 포지션 관리
- 데이터 정합성 검증 및 복구
  - `fixPortfolioData`: accountId가 없는 포트폴리오 자동 수정
  - 포트폴리오-계좌 연결 관계 유지

## 데이터 정합성

### 자동 복구 프로세스
1. 앱 시작 시 또는 필요한 시점에 데이터 검증
2. 문제가 있는 데이터 식별 (예: accountId가 없는 포트폴리오)
3. 가능한 경우 자동 복구 수행
4. 복구 불가능한 경우 사용자에게 알림

### 데이터 관계 유지
- 계좌 삭제 시 연결된 포트폴리오도 함께 삭제
- 포트폴리오 삭제 시 연결된 포지션도 함께 삭제
- 모든 포트폴리오는 반드시 계좌와 연결되어야 함 