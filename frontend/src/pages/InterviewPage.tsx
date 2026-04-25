import { useEffect, useRef } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

import { AnswerInput } from "@/components/answer-input"
import { AIBubble, HumanBubble, LoadingBubble } from "@/components/chat-bubble"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useInterview } from "@/providers/interview"

import { InterviewLoading } from "./InterviewLoading"

export default function InterviewPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()

  const {
    title,
    isLoading,
    loadingMessage,
    messages,
    isFinished,
    submitAnswer,
    loadMessages,
  } = useInterview()

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 페이지 진입 시 메시지 로드
  useEffect(() => {
    if (sessionId) loadMessages(sessionId)
  }, [loadMessages, sessionId]) // loadMessages를 useCallback으로 감싸 무한 렌더링 방지

  // 새로운 메시지가 올 때마다 최하단으로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loadingMessage])

  // 로딩 상태가 끝나면 입력창에 포커스
  useEffect(() => {
    if (!isLoading && !isFinished) inputRef.current?.focus()
  }, [isLoading, isFinished])

  if (!sessionId) return <Navigate to="/404" />
  if (isLoading) return <InterviewLoading />

  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto_auto]">
        <SidebarTrigger className="block md:hidden" />
        <h1 className="truncate text-lg font-bold">{title ?? "모의면접"}</h1>
        {isFinished && (
          <Button asChild type={"button"} variant={"link"}>
            <Link to={`/report/${sessionId}`}>피드백 보고서 보기</Link>
          </Button>
        )}
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-2 p-8 pb-0 md:p-16 md:pb-0">
        <main
          className="flex w-full flex-1 flex-col gap-4"
          aria-live={"polite"}
          aria-label={"면접 대화"}
        >
          {messages.map((message) =>
            message.type === "ai" ? (
              <AIBubble
                key={message.id!}
                category={message.category ?? ""}
                question={message.content}
              />
            ) : (
              <HumanBubble key={message.id!} answer={message.content} />
            )
          )}
          {isLoading && loadingMessage && (
            <LoadingBubble message={loadingMessage} />
          )}
          <div ref={bottomRef} />
        </main>

        {isFinished ? (
          <footer className="flex w-full items-center justify-center bg-background pb-8 md:pb-16">
            <div className="flex h-30 w-full flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                면접이 종료되었습니다
              </p>
              <Button
                type={"button"}
                size={"lg"}
                onClick={() => navigate(`/report/${sessionId}`)}
              >
                피드백 보고서 보기
              </Button>
            </div>
          </footer>
        ) : (
          <footer className="sticky bottom-0 z-50 flex w-full max-w-3xl items-center justify-center rounded-t-3xl bg-background pb-8 md:pb-16">
            <AnswerInput
              ref={inputRef}
              onSubmit={(answer) => submitAnswer(sessionId, answer)}
              disabled={isLoading}
            />
          </footer>
        )}
      </div>
    </>
  )
}
