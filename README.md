# MyStock MVP

주식 포트폴리오 관리를 위한 웹 애플리케이션입니다.

## 📋 프로젝트 개요

**MyStock MVP**는 개인 투자자를 위한 포트폴리오 관리 도구로, React + TypeScript + Vite + Tailwind CSS + IndexedDB(Dexie.js)를 사용하여 구축된 현대적인 웹 애플리케이션입니다.

## 🏗️ 기술 스택

### 프론트엔드

- **React 18** + **TypeScript** - 타입 안전성과 최신 React 기능
- **Vite** - 빠른 빌드 및 개발 서버
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **React Router DOM** - 클라이언트 사이드 라우팅
- **Heroicons** - 일관된 아이콘 시스템

### 데이터 저장소

- **IndexedDB** - 브라우저 내장 NoSQL 데이터베이스
- **Dexie.js** - IndexedDB 래퍼 라이브러리

### 성능 최적화

- **React.lazy** - 코드 분할 및 지연 로딩
- **Suspense** - 로딩 상태 관리
- **Terser** - 코드 압축 및 최적화
- 청크 분리 (vendor, react, dexie, chart 등)

## 🎯 주요 기능

### 📊 포트폴리오 관리

- 포트폴리오 생성 및 설정
- 종목별 포지션 관리
- 투자 전략 카테고리별 분류 (장기/중기/단기/미분류)
- 자산 배분 현황 시각화 (도넛 차트)
- 목표 자본금 및 카테고리별 배분 설정

### 🏦 계좌 관리

- 여러 증권사 계좌 등록 및 관리
- KRW/USD 통화 지원
- 계좌별 자산 현황 조회
- 계좌별 포트폴리오 그룹화

### 📈 성과 분석

- 계좌별/포트폴리오별 수익률 계산
- 종목별 비중 및 수익률 분석
- Chart.js를 통한 시각화
- 실시간 손익 계산

### 💾 백업/복원 시스템

- **수동 백업**: 사용자가 직접 생성 및 관리
- **자동 백업**: 24시간마다 자동 생성
- **백업 관리**: 최대 5개의 자동 백업 유지
- **데이터 검증**: 백업/복원 시 무결성 검사
- **롤백 기능**: 복원 실패 시 이전 상태로 복구

### 📝 메모 및 할 일 관리

- 투자 관련 메모 작성 및 관리
- 포트폴리오별 할 일 목록
- 마크다운 지원

## 📊 데이터 구조

### 핵심 엔티티

```typescript
Account {
  id: number
  broker: string
  accountNumber: string
  accountName: string
  currency: "KRW" | "USD"
  createdAt: number
}

Portfolio {
  id: number
  name: string
  currency: "KRW" | "USD"
  accountId: number
  config: PortfolioConfig
  positions?: Position[]
}

Position {
  id: number
  portfolioId: number
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  strategyCategory: PortfolioCategory
  strategyTags: string[]
}
```

### 관계 구조

```
Account (1) → (N) Portfolio (1) → (N) Position
                     ↓
                   Todo, Memo
```

## 🎨 UI/UX 설계

### 특징

- **모바일 우선** 반응형 디자인
- **다크 테마** 기본 적용
- **하단 네비게이션 바** (홈, 포트폴리오, 계좌, 설정)
- **직관적인 사용자 인터페이스**

### 라우팅 구조

```
/ (메인 대시보드)
├── /portfolios (포트폴리오 목록)
│   ├── /new (새 포트폴리오)
│   ├── /:id (포트폴리오 상세)
│   └── /:id/config (포트폴리오 설정)
├── /accounts (계좌 목록)
│   ├── /new (새 계좌)
│   ├── /:id (계좌 상세)
│   ├── /:id/edit (계좌 수정)
│   └── /:id/positions/... (포지션 관리)
├── /memos (메모 관리)
├── /todo (할 일 관리)
└── /settings (설정 및 백업)
```

## 🚀 개발 환경 설정

### 필수 요구사항

- Node.js 18 이상
- npm 8 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd mystock-mvp

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 🚀 배포

### 배포 환경

- **호스팅**: iwinv.net
- **도메인**: hjw3012.iwinv.net
- **배포 경로**: `/public_html/jinwoo`

### CI/CD

- **GitHub Actions**를 통한 자동 배포
- `main` 브랜치에 push하면 자동으로 빌드 및 배포
- **FTP-Deploy-Action**을 사용한 파일 배포

### 수동 배포

```bash
npm run build
# dist 폴더의 내용을 서버에 업로드
```

## 📁 프로젝트 구조

```
mystock-mvp/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── Layout.tsx
│   │   ├── PortfolioList.tsx
│   │   ├── PositionTable.tsx
│   │   └── ...
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── MainPage.tsx
│   │   ├── PortfolioList.tsx
│   │   ├── AccountList.tsx
│   │   └── ...
│   ├── services/      # 비즈니스 로직 및 데이터 처리
│   │   ├── db.ts
│   │   ├── accountService.ts
│   │   ├── portfolioService.ts
│   │   └── ...
│   ├── hooks/         # 커스텀 훅
│   │   ├── usePortfolios.ts
│   │   ├── useAccounts.ts
│   │   └── ...
│   ├── types/         # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/         # 유틸리티 함수
│   │   ├── backup.ts
│   │   └── categoryUtils.ts
│   └── schemas/       # 데이터 검증 스키마
├── docs/             # 프로젝트 문서
│   ├── PROJECT_STRUCTURE.md
│   ├── DEVELOPMENT.md
│   ├── CHANGELOG.md
│   └── ...
├── public/           # 정적 파일
└── .github/          # GitHub Actions 워크플로우
    └── workflows/
        └── deploy.yml
```

## 🔧 주요 서비스

### AccountService

- 계좌 CRUD 및 비즈니스 로직
- 계좌별 포트폴리오 관리
- 자산 요약 정보 계산

### PortfolioService

- 포트폴리오 관리 및 데이터 정합성 검증
- `fixPortfolioData` 메서드를 통한 데이터 자동 복구
- 포트폴리오-계좌 연결 관계 유지

### BackupService

- 자동/수동 백업 생성
- 백업 목록 관리
- 데이터 유효성 검사 및 복원

## 📈 성능 최적화

### 번들 최적화

- 라이브러리별 청크 분리로 캐싱 효율성 향상
- 지연 로딩으로 초기 로딩 시간 단축 (약 60% 개선)
- 코드 압축으로 번들 크기 최소화

### 데이터베이스 최적화

- 인덱스 기반 쿼리 최적화
- 트랜잭션을 통한 데이터 일관성 보장
- 백업/복원 시 데이터 유효성 검사

## 🔒 데이터 안전성

### 백업 시스템

- **자동 백업**: 24시간마다 자동 생성
- **백업 관리**: 최대 5개의 자동 백업 유지
- **데이터 검증**: 백업/복원 시 무결성 검사
- **롤백 기능**: 복원 실패 시 이전 상태로 복구

### 데이터 정합성

- 계좌 삭제 시 연관 포트폴리오 및 포지션 자동 삭제
- 포트폴리오 삭제 시 연관 포지션 자동 삭제
- 자동 데이터 복구 시스템

## 📚 문서

자세한 내용은 `docs` 디렉토리의 문서를 참고하세요:

- [프로젝트 구조](docs/PROJECT_STRUCTURE.md) - 상세한 아키텍처 설명
- [개발 가이드](docs/DEVELOPMENT.md) - 개발 가이드라인 및 코딩 규칙
- [배포 가이드](docs/DEPLOYMENT.md) - 배포 프로세스 및 설정
- [변경 이력](docs/CHANGELOG.md) - 버전별 변경 사항
- [아키텍처](docs/ARCHITECTURE.md) - 설계 원칙 및 구조
- [문제 해결](docs/TROUBLESHOOTING.md) - 일반적인 문제 및 해결책

## 🛠️ 개발 가이드라인

### 코드 스타일

- TypeScript 사용 (타입 안전성)
- 함수형 컴포넌트 사용
- 재사용 가능한 컴포넌트 분리
- 명확한 타입 정의

### 상태 관리

- React Hooks 사용
- 커스텀 훅을 통한 로직 분리
- 컴포넌트별 상태 관리

### 데이터베이스

- IndexedDB (Dexie.js) 사용
- 트랜잭션 처리
- 마이그레이션 관리

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 비공개 소프트웨어입니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.

---

**MyStock MVP** - 스마트한 포트폴리오 관리의 시작
