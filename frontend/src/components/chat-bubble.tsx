import { motion } from "framer-motion"

export function AIBubble({
  category,
  question,
}: {
  category: string
  question: string | null
}) {
  return (
    <div
      className="flex w-full flex-col justify-start gap-1"
      role={"article"}
      aria-label={"면접관 질문"}
    >
      <p className="text-xs leading-tight tracking-tight text-muted-foreground">
        {category}
      </p>
      <div className="flex w-fit max-w-4/5 items-center rounded-lg rounded-tl-xs bg-muted px-4 py-2">
        <p className="leading-normal whitespace-pre-wrap">{question}</p>
      </div>
    </div>
  )
}

export function HumanBubble({ answer }: { answer: string }) {
  return (
    <div
      className="flex w-full justify-start"
      role={"article"}
      aria-label={"내 답변"}
    >
      <div className="flex w-full items-center rounded-lg rounded-tr-xs px-4 py-2">
        <p className="leading-normal whitespace-pre-wrap">{answer}</p>
      </div>
    </div>
  )
}

export function LoadingBubble({ message }: { message: string }) {
  return (
    <div className="flex w-full justify-start text-sm">
      <div
        className="flex h-10 max-w-4/5 items-center rounded-lg rounded-tl-xs px-4 py-2"
        role={"status"}
        aria-label={message}
        aria-live={"polite"}
        aria-busy={"true"}
      >
        <div className="flex">
          {message.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
              aria-hidden={"true"}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}
