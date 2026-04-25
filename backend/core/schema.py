from pydantic import BaseModel, Field


class AnalyzeOutput(BaseModel):
    keywords: list[str] = Field(..., description="이력서에서 추출된 핵심 키워드")
    summary: str = Field(..., description="500자 내외의 이력서 요약문")


class ReflectOutput(BaseModel):
    approved: bool = Field(..., description="질문 승인 여부")
    comment: str = Field(..., description="반려 시 문제점과 개선 방향")


class EvaluateOutput(BaseModel):
    score: int = Field(..., ge=1, le=10, description="답변에 대한 평가 점수 (1~10점)")
    feedback: str = Field(
        ..., description="답변에 대한 구체적인 평가, 평가 근거, 개선 방향"
    )


class WrapUpOutput(BaseModel):
    feedback: str = Field(..., description="면접에 대한 종합 피드백")
    strengths: list[str] = Field(..., description="지원자의 강점 목록")
    weaknesses: list[str] = Field(..., description="지원자의 약점 및 보완점 목록")
