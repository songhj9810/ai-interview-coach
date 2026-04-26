import json
import os
import uuid
from contextlib import asynccontextmanager
from typing import cast

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig

from api.schema import (
    AnswerRequest,
    Message,
    MessagesResponse,
    ReportResponse,
    StartRequest,
)
from core.database import create_session, finish_session, get_sessions, init_db, pool
from core.graph import graph
from core.state import InterviewState

CORS_ORIGINS = os.environ["CORS_ORIGINS"].split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()  # 데이터베이스 연결 열기
    await init_db()  # 데이터베이스 초기화
    yield  # 앱 실행
    await pool.close()  # 데이터베이스 연결 닫기


app = FastAPI(lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


NODE_MAP = {
    "preprocess": "이력서를 분석하고 있어요",
    "start_evaluate": "답변을 평가하고 있어요",
    "hr_evaluate": "답변을 평가하고 있어요",
    "manager_evaluate": "답변을 평가하고 있어요",
    "executive_evaluate": "답변을 평가하고 있어요",
    "integrate": "답변을 평가하고 있어요",
    "decide_next_action": "답변을 평가하고 있어요",
    "generate": "질문을 생각하고 있어요",
    "reflect": "질문을 생각하고 있어요",
    "wrap_up": "보고서를 작성하고 있어요",
}


# 모의면접 시작
@app.post("/interview/start")
async def start_interview(req: StartRequest):
    session_id = str(uuid.uuid4())  # 고유한 세션 ID 생성
    config: RunnableConfig = {"configurable": {"thread_id": session_id}}

    initial_state = InterviewState(
        resume_base64=req.resume_base64,
        job_description=req.job_description,
        max_questions_per_category=req.max_questions_per_category,
        title=(
            f"{req.job_description['company']} {req.job_description['position']} 모의면접".strip()
            if req.job_description
            else "모의면접"
        ),
    )

    state = await graph.ainvoke(initial_state, config=config)

    await create_session(session_id, state["title"])

    return {"session_id": session_id}


# 답변 제출
@app.post("/interview/answer")
async def submit_answer(req: AnswerRequest):
    config: RunnableConfig = {"configurable": {"thread_id": req.session_id}}

    check_state = await graph.aget_state(config=config)
    if not check_state.values:
        raise HTTPException(status_code=404, detail="면접 세션을 찾을 수 없습니다.")
    if check_state.values["is_finished"]:
        raise HTTPException(status_code=400, detail="이미 종료된 면접입니다.")

    async def event_stream():
        try:
            async for update in graph.astream(
                {"messages": [HumanMessage(content=req.answer)]},  # type: ignore
                config=config,
                stream_mode="updates",
            ):
                node = list(update.keys())[0]
                if node in NODE_MAP:
                    yield f"data: {json.dumps({'type': 'node', 'message': NODE_MAP[node]}, ensure_ascii=False)}\n\n"

            state = await graph.aget_state(config=config)

            message = None
            is_finished = state.values["is_finished"]
            if is_finished:
                await finish_session(req.session_id)
            else:
                ai = [m for m in state.values["messages"] if isinstance(m, AIMessage)][
                    -1
                ]
                message = Message(
                    id=ai.id,
                    type=ai.type,
                    category=ai.additional_kwargs.get("category") or None,
                    content=cast(str, ai.content),
                )

            yield f"data: {json.dumps({'type': 'done', 'session_id': req.session_id, 'message': message.model_dump() if message else None, 'is_finished': is_finished}, ensure_ascii=False)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# 대화 기록 조회
@app.get("/interview/messages", response_model=MessagesResponse)
async def get_messages(session_id: str):
    config: RunnableConfig = {"configurable": {"thread_id": session_id}}

    state = await graph.aget_state(config=config)
    if not state.values:
        raise HTTPException(status_code=404, detail="면접 세션을 찾을 수 없습니다.")

    return MessagesResponse(
        title=state.values["title"],
        messages=[
            Message(
                id=m.id,
                type=m.type,
                category=m.additional_kwargs.get("category") or None,
                content=cast(str, m.content),
            )
            for m in state.values["messages"]
        ],
        is_finished=state.values["is_finished"],
    )


# 보고서 조회
@app.get("/interview/report", response_model=ReportResponse)
async def get_report(session_id: str):
    config: RunnableConfig = {"configurable": {"thread_id": session_id}}

    state = await graph.aget_state(config=config)
    if not state.values:
        raise HTTPException(status_code=404, detail="면접 세션을 찾을 수 없습니다.")
    if not state.values["is_finished"]:
        raise HTTPException(status_code=400, detail="아직 종료되지 않은 면접입니다.")

    return ReportResponse(
        title=state.values["title"],
        evaluations=state.values["evaluations"],
        report=state.values["report"],
    )


# 모의면접 목록 조회
@app.get("/sessions")
async def list_sessions():
    return await get_sessions()
