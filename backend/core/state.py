import operator
from dataclasses import dataclass, field
from typing import Annotated, Sequence, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages


class JobDescription(TypedDict):
    company: str  # 회사명
    position: str  # 직무명
    responsibilities: list[str]  # 주요업무
    qualifications: list[str]  # 자격요건
    preferred: list[str]  # 우대사항


class CategoryInfo(TypedDict):
    description: str  # 카테고리 설명
    questions: int  # 질문 횟수


class RawEvaluation(TypedDict):
    interviewer: str
    raw_score: int
    raw_feedback: str


class IntegratedEvaluation(TypedDict):
    category: str
    question: str
    answer: str
    raw_evaluations: list[RawEvaluation]
    score: float
    feedback: str


class Report(TypedDict):
    overall_score: float  # 종합 점수
    overall_feedback: str  # 종합 피드백
    scores_by_category: dict[str, float]  # 카테고리별 점수
    strengths: list[str]  # 강점
    weaknesses: list[str]  # 약점


@dataclass
class InterviewState:
    # 입력
    resume_base64: str = field(default="")  # base64 인코딩된 이력서 PDF
    job_description: JobDescription | None = field(default=None)
    max_questions_per_category: int = field(
        default=3
    )  # 카테고리당 최대 질문 수 (꼬리 질문 포함)

    # 전처리
    title: str = field(default="모의면접")
    resume_keywords: list[str] = field(default_factory=list)
    resume_summary: str = field(default="")

    # 면접 진행
    messages: Annotated[Sequence[BaseMessage], add_messages] = field(
        default_factory=list
    )  # 면접 질문과 답변 누적
    question_count: int = field(default=0)  # 총 질문 수
    categories: dict[str, CategoryInfo] = field(
        default_factory=dict
    )  # 셔플된 질문 카테고리 {"지원 동기": {"description": "설명", "questions": 3}, ...}
    current_category: str = field(default="")  # 현재 카테고리
    next_action: str = field(default="")  # "follow_up" | "next_category" | "wrap_up"

    # 반성
    pending_question: str = field(default="")
    needs_regen: bool = field(default=False)  # 질문 재생성 필요 여부
    regen_count: int = field(default=0)  # 질문 재생성 시도 횟수
    regen_comment: str = field(default="")  # 질문 재생성이 필요한 경우 코멘트

    # 평가
    hr_eval: RawEvaluation | None = field(default=None)  # HR 면접관
    manager_eval: RawEvaluation | None = field(default=None)  # 실무 면접관
    executive_eval: RawEvaluation | None = field(default=None)  # 임원 면접관
    evaluations: Annotated[list[IntegratedEvaluation], operator.add] = field(
        default_factory=list
    )  # 통합 평가 누적

    # 종료
    is_finished: bool = field(default=False)
    report: Report | None = field(default=None)
