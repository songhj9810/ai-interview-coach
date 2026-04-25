import { useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"

import { cn } from "@/lib/utils"

function getScoreColor(score: number) {
  if (score >= 80)
    return { stroke: "var(--color-emerald-500)", text: "text-emerald-500" }
  if (score >= 60)
    return { stroke: "var(--color-primary)", text: "text-primary" }
  if (score >= 40)
    return { stroke: "var(--color-amber-500)", text: "text-amber-500" }
  return { stroke: "var(--color-red-500)", text: "text-red-500" }
}

export function CircularScore({ score }: { score: number }) {
  const radius = 70 // 반지름
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((score * 10) / 100) * circumference

  const { stroke, text } = getScoreColor(score * 10)

  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const animation = animate(count, score * 10, {
      duration: 1.5,
      ease: "circOut",
    })
    return () => animation.stop()
  }, [count, score])

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      role={"img"}
      aria-label={`종합 점수: ${score * 10}점`}
    >
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* 배경 원 */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/60"
        />
        {/* 점수 원 */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} // 0점에서 시작
          animate={{ strokeDashoffset: offset }} // 실제 점수까지 애니메이션
          transition={{ duration: 1.5, ease: "circOut" }}
          transform="rotate(-90 80 80)" // 12시 방향에서 시작하도록 회전
        />
      </svg>
      {/* 점수 텍스트 */}
      <div className="absolute flex items-baseline gap-0.5 font-mono tracking-tight">
        <motion.span className={cn("text-5xl font-semibold", text)}>
          {rounded}
        </motion.span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
    </div>
  )
}
