import base64
import json
import random
from pathlib import Path
from typing import cast

import fitz  # PyMuPDF
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from core.prompts import (
    ANALYZE_SYSTEM_PROMPT,
    EXECUTIVE_EVALUATE_SYSTEM_PROMPT,
    FOLLOW_UP_GENERATE_SYSTEM_PROMPT,
    GENERATE_SYSTEM_PROMPT,
    HR_EVALUATE_SYSTEM_PROMPT,
    INTEGRATE_SYSTEM_PROMPT,
    MANAGER_EVALUATE_SYSTEM_PROMPT,
    REFLECT_SYSTEM_PROMPT,
    WRAP_UP_SYSTEM_PROMPT,
)
from core.schema import AnalyzeOutput, EvaluateOutput, ReflectOutput, WrapUpOutput
from core.state import IntegratedEvaluation, InterviewState, RawEvaluation
from core.utils import format_jd

CATEGORIES_PATH = Path(__file__).parent.parent / "data" / "categories.json"
FOLLOW_UP_THRESHOLD = 6

analyze_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, disable_streaming=True)
generate_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.6, disable_streaming=True)
reflect_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, disable_streaming=True)
evaluate_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, disable_streaming=True)
wrap_up_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, disable_streaming=True)


def _analyze(state: InterviewState) -> dict:
    # base64 → PDF 텍스트 추출
    pdf_bytes = base64.b64decode(state.resume_base64)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    resume_text = "\n".join(cast(str, page.get_text("text")) for page in doc)
    doc.close()

    # 프롬프트 준비
    system_message = ANALYZE_SYSTEM_PROMPT
    human_message = f"""다음 이력서를 분석하여 키워드와 요약문을 추출하세요.

    채용공고:
    ###
    {format_jd(state.job_description)}
    ###

    이력서 원문:
    ###
    {resume_text}
    ###"""

    # LLM으로 키워드 추출 및 요약문 생성
    response = cast(
        AnalyzeOutput,
        analyze_llm.with_structured_output(AnalyzeOutput).invoke(
            [
                SystemMessage(content=system_message),
                HumanMessage(content=human_message),
            ]
        ),
    )

    return {
        "resume_keywords": response.keywords,
        "resume_summary": response.summary,
    }


def preprocess(state: InterviewState) -> dict:
    # 이력서 분석
    analyze_result = _analyze(state)

    # 면접 카테고리 셔플
    with open(CATEGORIES_PATH, "r", encoding="utf-8") as f:
        categories = json.load(f)
    middle = [
        (k, {"description": v, "questions": 0})
        for k, v in categories.items()
        if k not in ("지원 동기", "인성 및 가치관")
    ]
    shuffled_categories = {
        "지원 동기": {
            "description": categories["지원 동기"],
            "questions": 0,
        },
        **dict(random.sample(middle, len(middle))),
        "인성 및 가치관": {
            "description": categories["인성 및 가치관"],
            "questions": 0,
        },
    }

    return {
        **analyze_result,
        "messages": [
            AIMessage(
                content="먼저 자기소개를 해주세요.",
                additional_kwargs={"category": "자기소개"},
            )
        ],
        "categories": shuffled_categories,
        "current_category": next(iter(shuffled_categories)),
    }


def generate(state: InterviewState) -> dict:
    # 최근 질문과 답변
    ai_messages = [m for m in state.messages if isinstance(m, AIMessage)]
    human_messages = [m for m in state.messages if isinstance(m, HumanMessage)]
    pairs = []
    for q, a in zip(ai_messages, human_messages):
        pairs.append(f"질문: {cast(str, q.content)}\n답변: {cast(str, a.content)}")
    recent_context = "\n\n".join(pairs[-2:])  # 최근 2개의 QA 페어

    # 질문 재생성 여부에 따른 프롬프트 조정
    regen_context = ""
    if state.needs_regen and state.regen_comment:
        regen_context = f"""생성된 질문을 검토한 결과, 질문을 다시 생성하기로 결정했습니다.
        아래의 코멘트를 참고하여 새로운 질문을 생성하세요.

        반려된 질문:
        ###
        {state.pending_question}
        ###

        검토 코멘트:
        ###
        {state.regen_comment}
        ###"""

    # 프롬프트 준비
    system_message = (
        FOLLOW_UP_GENERATE_SYSTEM_PROMPT
        if state.next_action == "follow_up"
        else GENERATE_SYSTEM_PROMPT
    )
    human_message = f"""다음 정보를 바탕으로 면접 질문을 생성하세요.

    {regen_context}

    채용공고:
    ###
    {format_jd(state.job_description)}
    ###

    이력서 키워드:
    ###
    {", ".join(state.resume_keywords)}
    ###

    이력서 요약:
    ###
    {state.resume_summary}
    ###

    질문 카테고리:
    ###
    {state.current_category}: {state.categories[state.current_category]["description"]}
    ###

    이전 질문과 답변:
    ###
    {recent_context if recent_context else "없음"}
    ###"""

    # LLM으로 다음 질문 생성
    response = generate_llm.invoke(
        [
            SystemMessage(content=system_message),
            HumanMessage(content=human_message),
        ]
    )

    return {
        "pending_question": response.content,
    }


def reflect(state: InterviewState) -> dict:
    questions = [
        cast(str, m.content) for m in state.messages if isinstance(m, AIMessage)
    ]

    # 프롬프트 준비
    system_message = REFLECT_SYSTEM_PROMPT
    human_message = f"""다음 정보를 바탕으로 면접 질문을 검토하세요.

    채용공고:
    ###
    {format_jd(state.job_description)}
    ###

    이력서 키워드:
    ###
    {", ".join(state.resume_keywords)}
    ###

    이력서 요약:
    ###
    {state.resume_summary}
    ###

    질문 카테고리:
    ###
    {state.current_category}: {state.categories[state.current_category]["description"]}
    ###

    검토 대상 질문:
    ###
    {state.pending_question}
    ###

    이전 질문 목록:
    ###
    {"\n".join(questions)}
    ###"""

    # LLM으로 평가 검토
    response: ReflectOutput = cast(
        ReflectOutput,
        reflect_llm.with_structured_output(ReflectOutput).invoke(
            [
                SystemMessage(content=system_message),
                HumanMessage(content=human_message),
            ]
        ),
    )

    if response.approved:
        return {
            "pending_question": "",
            "needs_regen": False,
            "regen_count": 0,
            "regen_comment": "",
            "messages": [
                AIMessage(
                    content=state.pending_question,
                    additional_kwargs={"category": state.current_category},
                )
            ],
            "question_count": state.question_count + 1,
            "categories": {
                **state.categories,
                state.current_category: {
                    **state.categories[state.current_category],
                    "questions": state.categories[state.current_category]["questions"]
                    + 1,
                },
            },
        }
    return {
        "needs_regen": True,
        "regen_count": state.regen_count + 1,
        "regen_comment": response.comment,
    }


def _evaluate(
    state: InterviewState, interviewer: str, system_prompt: str
) -> RawEvaluation:
    # 현재 질문과 답변
    current_question = cast(
        str, [m for m in state.messages if isinstance(m, AIMessage)][-1].content
    )
    current_answer = cast(
        str, [m for m in state.messages if isinstance(m, HumanMessage)][-1].content
    )

    # 프롬프트 준비
    system_message = system_prompt
    human_message = f"""다음 정보를 바탕으로 면접 답변을 평가하세요.

    채용공고:
    ###
    {format_jd(state.job_description)}
    ###

    질문 카테고리:
    ###
    {state.current_category}: {state.categories[state.current_category]["description"]}
    ###

    면접 질문:
    ###
    {current_question}
    ###

    면접 답변:
    ###
    {current_answer}
    ###"""

    # LLM으로 평가 생성
    response: EvaluateOutput = cast(
        EvaluateOutput,
        evaluate_llm.with_structured_output(EvaluateOutput).invoke(
            [
                SystemMessage(content=system_message),
                HumanMessage(content=human_message),
            ]
        ),
    )

    return {
        "interviewer": interviewer,
        "raw_score": response.score,
        "raw_feedback": response.feedback,
    }


def hr_evaluate(state: InterviewState) -> dict:
    return {
        "hr_eval": _evaluate(
            state,
            "HR 면접관",
            HR_EVALUATE_SYSTEM_PROMPT,
        )
    }


def manager_evaluate(state: InterviewState) -> dict:
    return {
        "manager_eval": _evaluate(
            state,
            "실무 면접관",
            MANAGER_EVALUATE_SYSTEM_PROMPT,
        )
    }


def executive_evaluate(state: InterviewState) -> dict:
    return {
        "executive_eval": _evaluate(
            state,
            "임원 면접관",
            EXECUTIVE_EVALUATE_SYSTEM_PROMPT,
        )
    }


def integrate(state: InterviewState) -> dict:
    # 병렬 평가 결과 수집
    raw_evaluations = [
        e
        for e in [state.hr_eval, state.manager_eval, state.executive_eval]
        if e is not None
    ]
    if len(raw_evaluations) < 3:
        raise ValueError("병렬 평가가 완료되지 않았습니다.")

    # 평균 점수 계산
    score = (
        round(sum(e["raw_score"] for e in raw_evaluations) / len(raw_evaluations), 1)
        if raw_evaluations
        else 0.0
    )

    # 개별 점수 및 피드백 통합
    evaluations_text = "\n\n".join(
        f"- {e['interviewer']}의 평가는 {e['raw_score']}점이며, 평가 근거 및 피드백은 다음과 같습니다."
        f"{e['raw_feedback']}"
        for e in raw_evaluations
    )

    # 프롬프트 준비
    system_message = INTEGRATE_SYSTEM_PROMPT
    human_message = f"""면접 답변에 대한 세 면접관의 평가를 바탕으로 최종 평가를 작성하세요.

    {evaluations_text}"""

    # LLM으로 최종 평가 생성
    response = evaluate_llm.invoke(
        [
            SystemMessage(content=system_message),
            HumanMessage(content=human_message),
        ]
    )

    # 현재 질문과 답변
    current_question = cast(
        str, [m for m in state.messages if isinstance(m, AIMessage)][-1].content
    )
    current_answer = cast(
        str, [m for m in state.messages if isinstance(m, HumanMessage)][-1].content
    )

    integrated_evaluation: IntegratedEvaluation = {
        "category": state.current_category,
        "question": current_question,
        "answer": current_answer,
        "raw_evaluations": raw_evaluations,
        "score": score,
        "feedback": cast(str, response.content),
    }

    return {
        "hr_eval": None,
        "manager_eval": None,
        "executive_eval": None,
        "evaluations": [integrated_evaluation],
    }


def decide_next_action(state: InterviewState) -> dict:
    categories = list(state.categories.keys())
    current_category_idx = categories.index(state.current_category)

    # 꼬리질문 조건: 점수 낮음 + 한도 남음
    if (
        state.evaluations[-1]["score"] < FOLLOW_UP_THRESHOLD
        and state.categories[state.current_category]["questions"]
        < state.max_questions_per_category
    ):
        return {"next_action": "follow_up"}

    # 마지막 카테고리에서 다음으로 넘어가려 할 때 → 종료
    if current_category_idx == len(categories) - 1:
        return {"next_action": "wrap_up"}

    # 다음 카테고리로
    next_category = categories[current_category_idx + 1]
    return {
        "current_category": next_category,
        "next_action": "next_category",
    }


def wrap_up(state: InterviewState) -> dict:
    # 종합 점수 계산
    overall_score = (
        round(sum(e["score"] for e in state.evaluations) / len(state.evaluations), 1)
        if state.evaluations
        else 0.0
    )

    # 카테고리별 점수 계산
    scores: dict[str, list[float]] = {k: [] for k in state.categories}
    for evaluation in state.evaluations:
        scores[evaluation["category"]].append(evaluation["score"])
    scores_by_category = {k: round(sum(v) / len(v), 1) for k, v in scores.items() if v}

    evaluations_text = "\n\n".join(
        f"[{e['category']}] 질문: {e['question']}\n답변: {e['answer']}\n점수: {e['score']}\n피드백: {e['feedback']}"
        for e in state.evaluations
    )

    # 프롬프트 준비
    system_message = WRAP_UP_SYSTEM_PROMPT
    human_message = f"""다음 정보를 바탕으로 면접에 대한 종합 피드백과 지원자의 강점/약점을 작성하세요.
    
    채용공고:
    ###
    {format_jd(state.job_description)}
    ###

    이력서 키워드:
    ###
    {", ".join(state.resume_keywords)}
    ###

    이력서 요약:
    ###
    {state.resume_summary}
    ###

    전체 면접 기록:
    ###
    {evaluations_text}
    ###"""

    # LLM으로 종합 피드백 생성
    response: WrapUpOutput = cast(
        WrapUpOutput,
        wrap_up_llm.with_structured_output(WrapUpOutput).invoke(
            [
                SystemMessage(content=system_message),
                HumanMessage(content=human_message),
            ]
        ),
    )

    return {
        "is_finished": True,
        "report": {
            "overall_score": overall_score,
            "overall_feedback": response.feedback,
            "scores_by_category": scores_by_category,
            "strengths": response.strengths,
            "weaknesses": response.weaknesses,
        },
    }
