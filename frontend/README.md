# Frontend

React로 구현한 AI 모의면접 클라이언트입니다.

## 기술 스택

- **React** + **TypeScript**: UI 구현
- **Tailwind CSS** + **shadcn/ui**: 스타일링 및 컴포넌트
- **Framer Motion**: 애니메이션
- **React Router**: 라우팅

## 프로젝트 구조

```
frontend/src/
├─ pages/
│　 ├─ HomePage.tsx # 홈 페이지
│　 ├─ InterviewPage.tsx # 인터뷰 페이지
│　 ├─ ReportPage.tsx # 리포트 페이지
│　 └─ NotFound.tsx
├─ components/
├─ hooks/
├─ lib/
├─ providers/
│　 ├─ interview/
│　 ├─ session/
│　 └─ theme/
├─ types/
├─ App.tsx
├─ index.css
└─ main.tsx
```

## 페이지 구성

- **홈 페이지** (`/`)

  이력서 업로드, 채용공고 입력, 질문 개수 설정 후 모의면접 시작

- **인터뷰 페이지** (`/interview/:sessionId`)

  실시간 모의면접 진행, SSE로 AI 처리 상태 표시

- **리포트 페이지** (`/report/:sessionId`)

  종합 점수, 강점/약점, 카테고리별 피드백 확인

## 실행 방법

먼저 `.env.example`을 참고해 `.env`를 생성해주세요.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

클라이언트가 실행되면 [http://localhost:5173](http://localhost:5173)에서 확인할 수 있습니다.
