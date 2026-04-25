import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

import type { JobDescription } from "@/types"

type JDInputProps = {
  value: JobDescription
  onChange: (value: JobDescription) => void
  disabled?: boolean
}

export function JDInput({ value, onChange, disabled = false }: JDInputProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="company">회사명</Label>
        <Input
          id="company"
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="position">직무명</Label>
        <Input
          id="position"
          value={value.position}
          onChange={(e) => onChange({ ...value, position: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="responsibilities">주요업무</Label>
        <ChipInput
          id="responsibilities"
          items={value.responsibilities}
          onChange={(items) => onChange({ ...value, responsibilities: items })}
          disabled={disabled}
        />
      </div>

      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="qualifications">자격요건</Label>
        <ChipInput
          id="qualifications"
          items={value.qualifications}
          onChange={(items) => onChange({ ...value, qualifications: items })}
          disabled={disabled}
        />
      </div>

      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="preferred">우대사항</Label>
        <ChipInput
          id="preferred"
          items={value.preferred}
          onChange={(items) => onChange({ ...value, preferred: items })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

type ChipInputProps = {
  id: string
  items: string[]
  onChange: (items: string[]) => void
  disabled?: boolean
}

function ChipInput({ id, items, onChange, disabled = false }: ChipInputProps) {
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setValue("")
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <span>{item}</span>
              <Button
                type={"button"}
                variant={"ghost"}
                size={"icon-xs"}
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <XIcon />
                <span className="sr-only">{`${item} 삭제`}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          type={"button"}
          variant={"outline"}
          size={"icon"}
          onClick={handleAdd}
          disabled={disabled}
        >
          <PlusIcon />
          <span className="sr-only">추가</span>
        </Button>
      </div>

      <p className="text-xs leading-none text-muted-foreground">
        입력 후 Enter 키를 누르거나 + 버튼을 클릭하세요.
      </p>
    </div>
  )
}
