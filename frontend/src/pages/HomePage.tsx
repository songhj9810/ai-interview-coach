import { useState } from "react"
import { ChevronDownIcon, Loader2Icon } from "lucide-react"

import { JDInput } from "@/components/jd-input"
import { ResumeUpload } from "@/components/resume-upload"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useInterview } from "@/providers/interview"

import type { JobDescription } from "@/types"

// pdf → base64 변환 유틸
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1])
    }
    reader.onerror = reject
  })
}

export default function HomePage() {
  const { isLoading, startInterview } = useInterview()

  const [resume, setResume] = useState<File | null>(null)
  const [jd, setJD] = useState<JobDescription>({
    company: "",
    position: "",
    responsibilities: [],
    qualifications: [],
    preferred: [],
  })
  const [maxQuestions, setMaxQuestions] = useState<"few" | "moderate" | "many">(
    "moderate"
  )

  const handleStartInterview = async () => {
    if (!resume) return

    const resume_base64 = await fileToBase64(resume)
    const isJDEmpty =
      !jd.company.trim() &&
      !jd.position.trim() &&
      jd.responsibilities.length === 0 &&
      jd.qualifications.length === 0 &&
      jd.preferred.length === 0

    startInterview({
      resume_base64,
      job_description: isJDEmpty ? null : jd,
      max_questions_per_category: { few: 2, moderate: 3, many: 5 }[
        maxQuestions
      ],
    })
  }

  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto]">
        <SidebarTrigger size={"icon"} className="inline-flex md:hidden" />
        <h1 className="truncate text-lg font-bold">AI 면접 코치</h1>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-8 md:p-16">
        <Card className="w-full" aria-labelledby={"resume-upload"}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-fit rounded-3xl border border-transparent bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary transition-all">
                필수
              </span>
              <div id="resume-upload" className="text-base font-semibold">
                이력서
              </div>
            </div>

            <ResumeUpload
              file={resume}
              onFileSelect={setResume}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="w-full" aria-labelledby={"job-description"}>
          <CardContent>
            <Collapsible className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-fit rounded-3xl border border-transparent bg-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-all">
                  선택
                </span>
                <div id="job-description" className="text-base font-semibold">
                  채용공고
                </div>
                <CollapsibleTrigger asChild className="group ml-auto">
                  <Button type={"button"} variant={"ghost"} size={"icon"}>
                    <ChevronDownIcon className="group-data-[state=open]:rotate-180" />
                    <span className="sr-only">채용공고 입력 열기/닫기</span>
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <JDInput value={jd} onChange={setJD} disabled={isLoading} />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <Card className="w-full" aria-labelledby={"max-questions"}>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-fit rounded-3xl border border-transparent bg-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-all">
                선택
              </span>
              <div id="max-questions" className="text-base font-semibold">
                질문 개수
              </div>
            </div>

            <ToggleGroup
              type={"single"}
              value={maxQuestions}
              onValueChange={(value) => {
                if (value) setMaxQuestions(value as "few" | "moderate" | "many")
              }}
              variant={"outline"}
              spacing={2}
              disabled={isLoading}
            >
              <ToggleGroupItem value={"few"} aria-label={"적음"}>
                적음
              </ToggleGroupItem>
              <ToggleGroupItem value={"moderate"} aria-label={"보통"}>
                보통
              </ToggleGroupItem>
              <ToggleGroupItem value={"many"} aria-label={"많음"}>
                많음
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        <Button
          type={"button"}
          size={"lg"}
          onClick={handleStartInterview}
          disabled={isLoading || !resume}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="animate-spin" />
              <span>이력서 분석 중...</span>
            </>
          ) : (
            "모의면접 시작하기"
          )}
        </Button>
      </main>
    </>
  )
}
