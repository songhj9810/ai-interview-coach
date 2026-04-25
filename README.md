# AI 면접 코치

이력서와 채용공고를 기반으로 LangGraph 에이전트가 맞춤형 질문을 생성하고, 답변을 평가한 뒤 피드백을 제공하는 AI 모의면접 시뮬레이터입니다.

## 주요 기능

- **맞춤형 질문 생성**: 이력서와 채용공고를 분석해 사용자에게 최적화된 면접 질문을 생성합니다
- **다중 면접관 평가**: HR, 실무, 임원 면접관 페르소나가 병렬로 답변을 평가합니다
- **꼬리질문**: 낮은 점수의 답변에 대해 자동으로 꼬리질문을 생성합니다
- **피드백 보고서**: 면접 종료 후 카테고리별 점수 및 피드백, 강점/약점, 종합 피드백을 제공합니다
- **실시간 진행 상태**: SSE 스트리밍으로 AI 처리 상태를 실시간으로 표시합니다

## 기술 스택

| 영역       | 기술                                                      |
| ---------- | --------------------------------------------------------- |
| Frontend   | React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | FastAPI, LangGraph, LangChain                             |
| AI         | OpenAI GPT-4o-mini                                        |
| Database   | PostgreSQL                                                |
| Monitoring | LangSmith                                                 |

## 프로젝트 구조

```
ai-interview-coach/
├─ backend/  # FastAPI + LangGraph 서버
└─ frontend/ # React 클라이언트
```

## 실행 방법

### 백엔드

```bash
cd backend
cp .env.example .env  # 환경변수 설정
uv sync
uvicorn main:app --reload
```

### 프론트엔드

```bash
cd frontend
cp .env.example .env  # 환경변수 설정
pnpm install
pnpm dev
```
