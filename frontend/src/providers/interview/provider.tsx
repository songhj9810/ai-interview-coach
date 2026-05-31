import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useSession } from '@/providers/session'
import type {
  JobDescription,
  Message,
  MessagesResponse,
  SSEEvent,
} from '@/types'

import { InterviewContext, type InterviewState } from './context'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { refresh } = useSession()

  const [state, setState] = useState<InterviewState>({
    title: '',
    isLoading: false,
    loadingMessage: null,
    messages: [],
    isFinished: false,
  })

  const startInterview = useCallback(
    async (form: {
      resume_base64: string
      job_description: JobDescription | null
      max_questions_per_category: number
    }) => {
      setState({
        title: '',
        isLoading: true,
        loadingMessage: null,
        messages: [],
        isFinished: false,
      })

      try {
        const response = await fetch(`${API_URL}/interview/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!response.ok) throw new Error('Failed to start interview')

        const data = await response.json()
        navigate(`/interview/${data.session_id}`)
        refresh() // 사이드바 새로고침
      } catch (error) {
        toast.error('모의면접을 시작하는 중 오류가 발생했습니다.')
        console.error(error)
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [navigate, refresh]
  )

  const submitAnswer = useCallback(
    async (sessionId: string, answer: string) => {
      const optimistic: Message = {
        id: crypto.randomUUID(),
        type: 'human',
        category: null,
        content: answer,
      }
      setState((prev) => ({
        ...prev,
        isLoading: true,
        loadingMessage: null,
        messages: [...prev.messages, optimistic], // 낙관적 업데이트
      }))

      try {
        const response = await fetch(`${API_URL}/interview/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, answer: answer }),
        })
        if (response.status === 404) {
          navigate('/404', { replace: true })
          return
        }
        if (!response.ok) throw new Error('Failed to submit answer')
        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const events = buffer.split('\n\n')
            buffer = events.pop() ?? ''

            for (const event of events) {
              const line = event.split('\n').find((l) => l.startsWith('data: '))
              if (!line) continue

              const data: SSEEvent = JSON.parse(line.slice(6))
              if (data.type === 'node') {
                setState((prev) => ({ ...prev, loadingMessage: data.message }))
              } else if (data.type === 'done') {
                if (data.is_finished) {
                  // 면접이 종료된 경우
                  setState((prev) => ({
                    ...prev,
                    isFinished: data.is_finished,
                  }))
                  refresh() // 사이드바 새로고침
                } else {
                  // 면접이 계속 진행되는 경우
                  setState((prev) => ({
                    ...prev,
                    messages: data.message
                      ? [...prev.messages, data.message]
                      : prev.messages,
                    isFinished: data.is_finished,
                  }))
                }
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== optimistic.id),
        })) // 낙관적 업데이트 롤백
        toast.error('답변을 제출하는 중 오류가 발생했습니다.')
        console.error(error)
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loadingMessage: null,
        }))
      }
    },
    [navigate, refresh]
  )

  const loadMessages = useCallback(
    async (sessionId: string) => {
      setState({
        title: '',
        isLoading: true,
        loadingMessage: null,
        messages: [],
        isFinished: false,
      })
      try {
        const response = await fetch(
          `${API_URL}/interview/messages?session_id=${sessionId}`
        )
        if (response.status === 404) {
          navigate('/404', { replace: true })
          return
        }
        if (!response.ok) throw new Error('Failed to load messages')

        const data: MessagesResponse = await response.json()
        setState((prev) => ({
          ...prev,
          title: data.title,
          messages: data.messages,
          isFinished: data.is_finished,
        }))
      } catch (error) {
        toast.error('대화 기록을 불러오는 중 오류가 발생했습니다.')
        console.error(error)
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loadingMessage: null,
        }))
      }
    },
    [navigate]
  )

  return (
    <InterviewContext.Provider
      value={{ ...state, startInterview, submitAnswer, loadMessages }}
    >
      {children}
    </InterviewContext.Provider>
  )
}
