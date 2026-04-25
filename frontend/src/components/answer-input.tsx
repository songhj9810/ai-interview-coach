import { useState } from "react"
import { ArrowUpIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group"

type AnswerInputProps = {
  ref?: React.Ref<HTMLTextAreaElement>
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function AnswerInput({
  ref,
  onSubmit,
  disabled = false,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState("")

  const handleSubmit = () => {
    if (!answer.trim()) return
    onSubmit(answer)
    setAnswer("")
  }

  return (
    <InputGroup>
      <InputGroupTextarea
        ref={ref}
        value={answer}
        placeholder="답변을 입력하세요..."
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return // 한글 입력 중엔 제출 방지
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        disabled={disabled}
        aria-label={"답변 입력"}
      />
      <InputGroupAddon align={"block-end"}>
        <InputGroupButton
          variant={"default"}
          size={"icon-sm"}
          onClick={handleSubmit}
          disabled={!answer.trim() || disabled}
          className="ml-auto"
        >
          <ArrowUpIcon />
          <span className="sr-only">답변 제출</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
