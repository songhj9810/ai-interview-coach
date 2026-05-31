import { createContext, useContext } from 'react'

import type { JobDescription, Message } from '@/types'

export type InterviewState = {
  title: string
  isLoading: boolean
  loadingMessage: string | null
  messages: Message[]
  isFinished: boolean
}

type InterviewProviderState = InterviewState & {
  startInterview: (form: {
    resume_base64: string
    job_description: JobDescription | null
    max_questions_per_category: number
  }) => void
  submitAnswer: (sessionId: string, answer: string) => void
  loadMessages: (sessionId: string) => void
}

export const InterviewContext = createContext<
  InterviewProviderState | undefined
>(undefined)

export const useInterview = () => {
  const context = useContext(InterviewContext)

  if (context === undefined) {
    throw new Error('useInterview must be used within a InterviewProvider')
  }

  return context
}
