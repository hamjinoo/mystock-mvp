# 개발 가이드

## 1. 개발 환경 설정

### 1.1 필수 요구사항
- Node.js 18 이상
- npm 9 이상
- Git

### 1.2 프로젝트 설정
```bash
# 저장소 클론
git clone <repository-url>

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 2. 프로젝트 구조

### 2.1 디렉토리 구조
```
mystock-mvp/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── services/      # 비즈니스 로직
│   ├── hooks/         # 커스텀 훅
│   ├── types/         # 타입 정의
│   └── utils/         # 유틸리티 함수
├── docs/             # 문서
└── public/           # 정적 파일
```

### 2.2 주요 파일
- `src/App.tsx`: 메인 라우팅 및 레이아웃
- `src/services/db.ts`: 데이터베이스 설정
- `src/types/index.ts`: 공통 타입 정의

## 3. 코딩 컨벤션

### 3.1 TypeScript
- 명시적 타입 선언 사용
- 인터페이스 우선 (타입 별칭보다)
- 엄격한 null 체크 적용

### 3.2 React
- 함수형 컴포넌트 사용
- 커스텀 훅으로 로직 분리
- Props 인터페이스 정의

### 3.3 스타일링
- Tailwind CSS 클래스 사용
- 컴포넌트별 스타일 구성
- 반응형 디자인 적용

## 4. 데이터베이스 가이드

### 4.1 스키마 정의
```typescript
// src/services/db.ts
this.version(1).stores({
  accounts: '++id, broker, accountNumber, currency',
  portfolios: '++id, accountId, name, currency',
  positions: '++id, portfolioId, symbol, strategyCategory',
  todos: '++id, portfolioId, completed, createdAt'
});
```

### 4.2 데이터 접근
```typescript
// 데이터 조회
const accounts = await db.accounts.toArray();

// 데이터 생성
const id = await db.accounts.add(newAccount);

// 데이터 수정
await db.accounts.update(id, updatedData);

// 데이터 삭제
await db.accounts.delete(id);
```

## 5. 컴포넌트 개발 가이드

### 5.1 새 컴포넌트 생성
```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface Props {
  // props 정의
}

export const MyComponent: React.FC<Props> = ({ /* props */ }) => {
  return (
    // JSX
  );
};
```

### 5.2 커스텀 훅 생성
```typescript
// src/hooks/useMyHook.ts
import { useState, useEffect } from 'react';

export function useMyHook() {
  // 훅 로직
  return {
    // 반환값
  };
}
```

## 6. 에러 처리

### 6.1 데이터베이스 에러
```typescript
try {
  await db.accounts.add(newAccount);
} catch (err) {
  console.error('계좌 생성 중 오류:', err);
  throw err instanceof Error ? err : new Error('계좌 생성에 실패했습니다.');
}
```

### 6.2 사용자 입력 검증
```typescript
const validateAccount = (data: unknown): Account => {
  // 검증 로직
};
```

## 7. 성능 최적화

### 7.1 메모이제이션
```typescript
// 컴포넌트 메모이제이션
const MemoizedComponent = React.memo(MyComponent);

// 값 메모이제이션
const memoizedValue = useMemo(() => computeValue(deps), [deps]);

// 콜백 메모이제이션
const memoizedCallback = useCallback(() => {
  // 콜백 로직
}, [deps]);
```

### 7.2 데이터 로딩 최적화
```typescript
// 일괄 처리
const [accounts, portfolios] = await Promise.all([
  db.accounts.toArray(),
  db.portfolios.toArray()
]);

// 인덱스 사용
const accountPortfolios = await db.portfolios
  .where('accountId')
  .equals(accountId)
  .toArray();
```

## 8. 테스트

### 8.1 단위 테스트
```typescript
describe('MyComponent', () => {
  it('renders correctly', () => {
    // 테스트 코드
  });
});
```

### 8.2 통합 테스트
```typescript
describe('Account Management', () => {
  it('creates and manages accounts', async () => {
    // 테스트 코드
  });
});
```

## 9. 배포

### 9.1 빌드
```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 9.2 환경 설정
- `.env`: 환경 변수
- `vite.config.ts`: Vite 설정
- `tailwind.config.js`: Tailwind 설정 