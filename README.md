# MyStock MVP

주식 포트폴리오 관리를 위한 웹 애플리케이션입니다.

## 주요 기능

- 계좌 관리

  - 여러 증권사 계좌 등록 및 관리
  - 계좌별 자산 현황 조회
  - KRW/USD 통화 지원

- 포트폴리오 관리

  - 포트폴리오 그룹 생성 및 관리
  - 종목별 포지션 관리
  - 자산 배분 현황 시각화
  - 투자 전략 카테고리 관리

- 성과 분석
  - 계좌별/그룹별 수익률 계산
  - 종목별 비중 및 수익률 분석
  - 차트를 통한 시각화

## 기술 스택

- Frontend

  - React 18
  - TypeScript
  - Tailwind CSS
  - Vite

- 데이터 저장
  - IndexedDB (Dexie.js)

## 개발 환경 설정

1. 필수 요구사항

   - Node.js 18 이상
   - npm 8 이상

2. 설치 및 실행

   ```bash
   # 의존성 설치
   npm install

   # 개발 서버 실행
   npm run dev

   # 프로덕션 빌드
   npm run build
   ```

## 테스트 실행

```bash
npm test
```


## 배포

- 호스팅: iwinv.net
- 도메인: hjw3012.iwinv.net
- 배포 경로: /public_html/jinwoo
- 배포 방식: GitHub Actions + FTP

GitHub Actions를 통한 자동 배포가 설정되어 있습니다. `main` 브랜치에 push하면 자동으로 빌드 및 배포가 진행됩니다.

## 프로젝트 구조

```
mystock-mvp/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── services/      # 비즈니스 로직 및 API 호출
│   ├── hooks/         # 커스텀 훅
│   ├── types/         # TypeScript 타입 정의
│   └── utils/         # 유틸리티 함수
├── docs/             # 프로젝트 문서
└── public/           # 정적 파일
```

## 문서

자세한 내용은 `docs` 디렉토리의 문서를 참고하세요:

- [프로젝트 구조](docs/PROJECT_STRUCTURE.md)
- [개발 가이드](docs/DEVELOPMENT.md)
- [배포 가이드](docs/DEPLOYMENT.md)
- [변경 이력](docs/CHANGELOG.md)

## 라이선스

이 프로젝트는 비공개 소프트웨어입니다.
