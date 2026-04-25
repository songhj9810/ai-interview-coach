import { BotIcon } from "lucide-react"

import { Button } from "./ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { Separator } from "./ui/separator"

import type { IntegratedEvaluation } from "@/types"

export function FeedbackContent({
  evaluation,
}: {
  evaluation: IntegratedEvaluation
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 질문 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground">질문</p>
        <p className="leading-relaxed">{evaluation.question}</p>
      </div>

      {/* 답변 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground">답변</p>
        <p className="leading-relaxed">{evaluation.answer}</p>
      </div>

      <Separator />

      {/* 점수 + 피드백 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <BotIcon size={16} aria-hidden={"true"} /> 면접 코치의 피드백
          </div>
          <div className="flex items-baseline gap-0.5 font-mono tracking-tight">
            <span className="text-base font-medium text-primary">
              {evaluation.score}
            </span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        </div>
        <p className="leading-relaxed">{evaluation.feedback}</p>
      </div>

      {/* 세부 피드백 */}
      <Collapsible className="flex flex-col gap-3">
        <CollapsibleTrigger asChild>
          <Button
            type={"button"}
            variant={"outline"}
            size={"xs"}
            className="w-fit"
          >
            면접관별 세부 피드백 보기
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3">
            {evaluation.raw_evaluations.map((rawEvaluation, index) => (
              <li key={index} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">
                  {rawEvaluation.interviewer}
                </span>
                <span className="leading-relaxed text-muted-foreground">
                  {rawEvaluation.raw_feedback}
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
