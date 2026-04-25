import { Link } from "react-router-dom"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function NotFound() {
  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto]">
        <SidebarTrigger size={"icon"} className="inline-flex md:hidden" />
        <h1 className="truncate text-lg font-bold">AI 면접 코치</h1>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-8 md:p-16">
        <p className="text-6xl font-bold text-muted-foreground/30">404</p>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold">페이지를 찾을 수 없어요</p>
          <p className="text-sm text-muted-foreground">
            존재하지 않는 페이지예요
          </p>
        </div>
        <Button asChild type={"button"} variant={"outline"} size={"lg"}>
          <Link to={"/"}>홈으로 돌아가기</Link>
        </Button>
      </main>
    </>
  )
}
