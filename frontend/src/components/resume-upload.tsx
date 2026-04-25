import { useRef, useState } from "react"
import { FileTextIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

type ResumeUploadProps = {
  file: File | null
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function ResumeUpload({
  file,
  onFileSelect,
  disabled = false,
}: ResumeUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("PDF 파일만 업로드 가능합니다.")
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB를 초과할 수 없습니다.")
      return
    }
    onFileSelect(selectedFile)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = "" // 같은 파일 재선택 허용
  }

  // 드래그 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault() // 기본 동작 방지 (파일 열기 등)
    setDragOver(true) // 시각적 피드백
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragOver(false)
    // 드롭된 파일 처리
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFile(dropped)
  }

  return (
    <>
      <input
        ref={inputRef}
        type={"file"}
        accept={".pdf"}
        multiple={false}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type={"button"}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 transition",
          "not-disabled:hover:border-primary/40 not-disabled:hover:bg-primary/5",
          dragOver && !disabled && "border-primary/40 bg-primary/5",
          "disabled:opacity-50"
        )}
        aria-label={file ? `선택된 파일: ${file.name}` : "파일 선택"}
      >
        {file ? (
          <>
            <FileTextIcon size={20} />
            <div className="text-center">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </>
        ) : (
          <>
            <UploadIcon size={20} />
            <div className="text-center text-sm text-muted-foreground">
              <p>드래그하거나 클릭해서 파일 선택</p>
              <p>PDF · 최대 5MB</p>
            </div>
          </>
        )}
      </button>
    </>
  )
}
