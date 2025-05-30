# 배포 가이드

## 배포 환경

- **호스팅 제공자**: iwinv.net
- **도메인**: hjw3012.iwinv.net
- **배포 방식**: FTP + GitHub Actions
- **배포 경로**: /public_html/jinwoo

## 배포 설정

### FTP 설정
```json
{
    "host": "hjw3012.iwinv.net",
    "user": "hjw3012",
    "remote": "/public_html/jinwoo"
}
```

### GitHub Actions 설정

GitHub Actions를 통해 자동 배포가 구성되어 있습니다. `main` 브랜치에 push하면 자동으로 빌드 및 배포가 진행됩니다.

1. GitHub Secrets 설정
   - `FTP_SERVER`: hjw3012.iwinv.net
   - `FTP_USERNAME`: hjw3012
   - `FTP_PASSWORD`: [보안상 비공개]

2. 워크플로우 파일: `.github/workflows/deploy.yml`
   - Node.js 18 환경에서 빌드
   - `npm ci`로 의존성 설치
   - `npm run build`로 프로덕션 빌드
   - FTP를 통해 `dist` 디렉토리를 `/public_html/jinwoo`에 배포

## 수동 배포 방법

1. 로컬에서 빌드:
```bash
npm run build
```

2. FTP 클라이언트로 접속:
   - 호스트: hjw3012.iwinv.net
   - 사용자: hjw3012
   - 포트: 21

3. `dist` 디렉토리의 내용을 서버의 `/public_html/jinwoo` 디렉토리에 업로드

## 주의사항

1. 보안
   - FTP 인증 정보는 절대 Git에 커밋하지 않습니다
   - `.ftpconfig`와 `.env` 파일은 반드시 `.gitignore`에 포함

2. 배포 전 확인사항
   - 모든 테스트 통과 여부
   - 빌드 성공 여부
   - 환경 변수 설정 여부
   - 배포 경로(/public_html/jinwoo) 존재 여부 확인

3. 문제 해결
   - 배포 실패 시 GitHub Actions 로그 확인
   - FTP 연결 문제는 네트워크/방화벽 설정 확인
   - 빌드 실패 시 로컬에서 먼저 테스트
   - 권한 문제 발생 시 FTP 디렉토리 권한 확인 