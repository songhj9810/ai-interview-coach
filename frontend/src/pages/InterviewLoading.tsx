import { AnswerInput } from "@/components/answer-input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function InterviewLoading() {
  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto_auto]">
        <SidebarTrigger className="block md:hidden" />
        <Skeleton className="h-7 w-40" />
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-2 p-8 pb-0 md:p-16 md:pb-0">
        <main className="flex w-full flex-1 flex-col gap-4"></main>

        <footer className="sticky bottom-0 z-50 flex w-full max-w-3xl items-center justify-center rounded-t-3xl bg-background pb-8 md:pb-16">
          <AnswerInput onSubmit={() => {}} disabled={true} />
        </footer>
      </div>
    </>
  )
}
