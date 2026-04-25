from pydantic import BaseModel

from core.state import IntegratedEvaluation, JobDescription, Report


class StartRequest(BaseModel):
    resume_base64: str
    job_description: JobDescription | None = None
    max_questions_per_category: int = 3


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


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
