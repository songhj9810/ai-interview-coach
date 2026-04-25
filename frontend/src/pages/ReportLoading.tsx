import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportLoading() {
  return (
    <>
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b bg-background px-4 md:grid-cols-[1fr_auto_auto]">
        <SidebarTrigger className="block md:hidden" />
        <Skeleton className="h-7 w-40" />
        <Button type={"button"} variant={"link"} disabled>
          면접 기록 보기
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-8 md:p-16">
        <h2 className="text-2xl font-bold">피드백 보고서</h2>

        <section className="grid grid-cols-[auto_1fr] items-center gap-4">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
          <div className="flex w-full flex-col gap-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </section>

        <section className="grid grid-cols-2 items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  )
}
