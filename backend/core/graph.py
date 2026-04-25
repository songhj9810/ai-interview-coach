from langgraph.graph import END, START, StateGraph

from core.nodes import (
    decide_next_action,
    executive_evaluate,
    generate,
    hr_evaluate,
    integrate,
    manager_evaluate,
    preprocess,
    reflect,
    wrap_up,
)
from core.state import InterviewState


def route_entry(state: InterviewState) -> str:
    if not state.messages:
        return "preprocess"
    elif state.question_count == 0:
        return "generate"
    return "start_evaluate"


def route_after_decide_next_action(state: InterviewState) -> str:
    return state.next_action


def route_after_reflect(state: InterviewState) -> str:
    if state.needs_regen and state.regen_count < 3:
        return "regenerate"
    return "end"  # 사용자 입력 대기


builder = StateGraph(InterviewState)

# 노드 등록
builder.add_node("preprocess", preprocess)
builder.add_node("start_evaluate", lambda state: {})  # 병렬 평가 시작 노드
builder.add_node("hr_evaluate", hr_evaluate)
builder.add_node("manager_evaluate", manager_evaluate)
builder.add_node("executive_evaluate", executive_evaluate)
builder.add_node("integrate", integrate)
builder.add_node("decide_next_action", decide_next_action)
builder.add_node("generate", generate)
builder.add_node("reflect", reflect)
builder.add_node("wrap_up", wrap_up)

# 엣지 연결
builder.add_conditional_edges(
    START,
    route_entry,
    {
        "preprocess": "preprocess",
        "generate": "generate",
        "start_evaluate": "start_evaluate",
    },
)
builder.add_edge("preprocess", END)
builder.add_edge("start_evaluate", "hr_evaluate")
builder.add_edge("start_evaluate", "manager_evaluate")
builder.add_edge("start_evaluate", "executive_evaluate")
builder.add_edge(["hr_evaluate", "manager_evaluate", "executive_evaluate"], "integrate")
builder.add_edge("integrate", "decide_next_action")
builder.add_conditional_edges(
    "decide_next_action",
    route_after_decide_next_action,
    {
        "follow_up": "generate",
        "next_category": "generate",
        "wrap_up": "wrap_up",
    },
)
builder.add_edge("generate", "reflect")
builder.add_conditional_edges(
    "reflect",
    route_after_reflect,
    {
        "regenerate": "generate",
        "end": END,
    },
)
builder.add_edge("wrap_up", END)

graph = builder.compile()
