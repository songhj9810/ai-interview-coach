import { createContext, useContext } from "react"

import type { JobDescription, Message } from "@/types"

export interface InterviewState {
  title: string
  isLoading: boolean
  loadingMessage: string | null
  messages: Message[]
  isFinished: boolean
}

interface InterviewContextType extends InterviewState {
  startInterview: (form: {
    resume_base64: string
    job_description: JobDescription | null
    max_questions_per_category: number
  }) => void
  submitAnswer: (sessionId: string, answer: string) => void
  loadMessages: (sessionId: string) => void
}

export const InterviewContext = createContext<InterviewContextType | null>(null)

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (!context)
    throw new Error("useInterview must be used within InterviewProvider")
  return context
}
