import { DotIcon, ThumbsUpIcon, TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export function InsightCard({
  type,
  items,
}: {
  type: "strengths" | "weaknesses"
  items: string[]
}) {
  const { title, Icon, iconColor, bgColor } = {
    strengths: {
      title: "강점",
      Icon: ThumbsUpIcon,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/5",
    },
    weaknesses: {
      title: "약점",
      Icon: TriangleAlertIcon,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/5",
    },
  }[type]

  return (
    <Card className={cn("shadow-lg", bgColor)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={16} className={iconColor} aria-hidden={"true"} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex gap-2 leading-normal">
              <DotIcon size={20} className="shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
