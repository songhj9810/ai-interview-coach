from pydantic import BaseModel, Field

from core.state import IntegratedEvaluation, JobDescription, Report

_10MB_BASE64 = 13_981_016  # 10MB 바이너리 → base64 인코딩 후 최대 길이


class StartRequest(BaseModel):
    resume_base64: str = Field(..., max_length=_10MB_BASE64)
    job_description: JobDescription | None = None
    max_questions_per_category: int = 3


class AnswerRequest(BaseModel):
    session_id: str
    answer: str = Field(..., min_length=1)


class Message(BaseModel):
    id: str | None
    type: str
    category: str | None
    content: str


class MessagesResponse(BaseModel):
    title: str
    messages: list[Message]
    is_finished: bool


class ReportResponse(BaseModel):
    title: str
    evaluations: list[IntegratedEvaluation]
    report: Report
