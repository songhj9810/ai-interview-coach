import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { CircularScore } from "@/components/circular-score"
import { FeedbackTab } from "@/components/feedback-tab"
import { InsightCard } from "@/components/insight-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { ReportLoading } from "./ReportLoading"

import type { ReportResponse } from "@/types"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const [title, setTitle] = useState("")
  const [evaluations, setEvaluations] = useState<ReportResponse["evaluations"]>(
    []
  )
  const [report, setReport] = useState<ReportResponse["report"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/interview/report?session_id=${sessionId}`
        )
        if (!response.ok) throw new Error("Failed to load report")
        const data: ReportResponse = await response.json()
        setTitle(data.title)
        setEvaluations(data.evaluations)
        setReport(data.report)
      } catch (error) {
        toast.error("Failed to load report")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  if (!sessionId) return <Navigate to="/404" />
  if (isLoading || !report) return <ReportLoading />

  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto_auto]">
        <SidebarTrigger className="block md:hidden" />
        <h1 className="truncate text-lg font-bold">{title}</h1>
        <Button asChild type={"button"} variant={"link"}>
          <Link to={`/interview/${sessionId}`}>면접 기록 보기</Link>
        </Button>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-8 md:p-16">
        <h2 className="text-2xl font-bold">피드백 보고서</h2>

        {/* 종합 점수 및 피드백 */}
        <section aria-label={"종합 피드백"}>
          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/40 p-6 md:flex-row md:items-center">
            <CircularScore score={report.overall_score} />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">총평</p>
              <p className="leading-relaxed">{report.overall_feedback}</p>
            </div>
          </div>
        </section>

        {/* 강점 및 약점 */}
        <section aria-label={"강점 및 약점"}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InsightCard type={"strengths"} items={report.strengths} />
            <InsightCard type={"weaknesses"} items={report.weaknesses} />
          </div>
        </section>

        {/* 카테고리별 피드백 */}
        <section aria-label={"카테고리별 피드백"}>
          <FeedbackTab
            scoresByCategory={report.scores_by_category}
            evaluations={evaluations}
          />
        </section>
      </main>
    </>
  )
}
