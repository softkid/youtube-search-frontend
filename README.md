# YouTube 채널 검색 웹앱

YouTube 채널을 조회하고 저장하는 웹 애플리케이션입니다.

## 기능

### 1. 검색 기능
- 검색어 입력 시 YouTube API를 통해 비디오 검색
- 결과값으로 다음 정보 제공:
  - 제목, 게시일, 조회수, 좋아요
  - 채널명, 구독자 수
  - 비디오 길이
  - 조회/구독 비율
  - 설명, 태그
  - 스크립트 (추후 구현)

### 2. 필터 기능
- **길이 필터**: 숏폼(<60초), 롱폼(≥60초), 전체
- **기간 필터**: 1개월, 2개월, 6개월, 1년, 전체
- **조회/구독 비율 필터** (다중선택):
  - 1단계: <0.2
  - 2단계: 0.2-0.6
  - 3단계: 0.6-1.4
  - 4단계: 1.4-3.0
  - 5단계: ≥3.0

### 3. 보기 모드
- **카드형**: 시각적으로 보기 좋은 카드 레이아웃
- **테이블형**: 상세 정보를 한눈에 볼 수 있는 테이블 형식

### 4. 데이터 내보내기
- **엑셀 변환**: 검색 결과를 엑셀 파일로 다운로드
- **이메일 전송**: 결과 분석 링크를 이메일로 전송

## 기술 스택

- **React** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **TypeScript** - 타입 안정성
- **Hono** - 백엔드 프레임워크 (추후 Cloudflare Workers 배포용)
- **YouTube Data API v3** - YouTube 데이터 조회

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 4. 미리보기

```bash
npm run preview
```

## 환경 변수

프로젝트는 `youtube-mcp-server` API를 사용합니다.

### MCP Server 설정

1. `youtube-mcp-server`를 먼저 실행해야 합니다:
```bash
cd ../youtube-mcp-server
npm run dev
```

2. MCP Server는 기본적으로 `http://localhost:3000`에서 실행됩니다.

3. 다른 URL을 사용하려면 `.env` 파일을 생성하고 설정하세요:
```
VITE_MCP_SERVER_URL=http://localhost:3000
```

### YouTube API 키

YouTube API 키는 `youtube-mcp-server`의 `.env` 파일에 설정되어 있습니다.

## Cloudflare Workers 배포

```bash
npm run deploy
```

## 프로젝트 구조

```
youtube-search-frontend/
├── src/
│   ├── components/      # React 컴포넌트
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── VideoList.tsx
│   │   ├── VideoCard.tsx
│   │   └── VideoTable.tsx
│   ├── services/        # API 서비스
│   │   └── youtubeApi.ts
│   ├── types/           # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/           # 유틸리티 함수
│   │   └── duration.ts
│   ├── App.tsx          # 메인 앱 컴포넌트
│   └── main.tsx         # 진입점
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 주요 기능 설명

### 검색 API
- YouTube Data API v3를 사용하여 비디오 검색
- 검색 결과를 필터링하여 표시
- 채널 정보와 통계 정보를 함께 조회

### 필터링
- 클라이언트 사이드에서 실시간 필터링
- 여러 필터를 동시에 적용 가능

### 데이터 내보내기
- XLSX 라이브러리를 사용하여 엑셀 파일 생성
- 이메일 클라이언트를 통한 링크 공유

## 라이선스

MIT
