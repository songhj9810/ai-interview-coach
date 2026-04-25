import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import { FeedbackContent } from "./feedback-content"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

import type { IntegratedEvaluation, Report } from "@/types"

function getGrade(score: number) {
  if (score >= 8) return "A"
  if (score >= 6) return "B"
  if (score >= 4) return "C"
  if (score >= 2) return "D"
  return "F"
}

export function FeedbackTab({
  scoresByCategory,
  evaluations,
}: {
  scoresByCategory: Report["scores_by_category"]
  evaluations: IntegratedEvaluation[]
}) {
  const isMobile = useIsMobile()

  const categories = Object.keys(scoresByCategory)

  const groupedEvaluations = evaluations.reduce(
    (acc: Record<string, IntegratedEvaluation[]>, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {}
  )

  return (
    <Tabs
      orientation={isMobile ? "vertical" : "horizontal"}
      defaultValue={categories[0]}
      className="gap-4"
    >
      <TabsList
        variant={"line"}
        className={cn("h-fit!", !isMobile && "w-full")}
      >
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="rounded-xs! whitespace-normal"
          >
            <div
              className={cn(
                "flex",
                isMobile
                  ? "flex-row-reverse items-start gap-2"
                  : "flex-col items-center gap-0.5"
              )}
            >
              <p>{category}</p>
              <p className="font-semibold">
                {getGrade(scoresByCategory[category] ?? 0)}
              </p>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent
          key={category}
          value={category}
          className="rounded-2xl border"
        >
          {groupedEvaluations[category]?.map((evaluation, index, arr) => (
            <div key={index}>
              <FeedbackContent evaluation={evaluation} />
              {index < arr.length - 1 && <Separator />}
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
