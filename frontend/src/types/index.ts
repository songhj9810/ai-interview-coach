// 채용공고
export type JobDescription = {
  company: string
  position: string
  responsibilities: string[]
  qualifications: string[]
  preferred: string[]
}

// 메시지
export type Message = {
  id: string | null
  type: "ai" | "human"
  category: string | null
  content: string
}

// 평가
export type RawEvaluation = {
  interviewer: string
  raw_score: number
  raw_feedback: string
}

// 통합 평가
export type IntegratedEvaluation = {
  category: string
  question: string
  answer: string
  raw_evaluations: RawEvaluation[]
  score: number
  feedback: string
}

// 보고서
export type Report = {
  overall_score: number
  overall_feedback: string
  scores_by_category: Record<string, number>
  strengths: string[]
  weaknesses: string[]
}

// 세션
export type Session = {
  session_id: string
  title: string
  is_finished: boolean
  created_at: string
}

// API 응답
export type MessagesResponse = {
  title: string
  messages: Message[]
  is_finished: boolean
}

export type ReportResponse = {
  title: string
  evaluations: IntegratedEvaluation[]
  report: Report
}

// SSE 이벤트
export type SSEEvent =
  | { type: "node"; message: string }
  | {
      type: "done"
      session_id: string
      message: Message | null
      is_finished: boolean
    }
  | { type: "error"; message: string }
