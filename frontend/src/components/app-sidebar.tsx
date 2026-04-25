import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { MessageSquareDotIcon, PlusIcon } from "lucide-react"

import { useSession } from "@/providers/session"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "./ui/sidebar"

export function AppSidebar() {
  const { pathname } = useLocation()
  const { ongoing, completed, isLoading, refresh } = useSession()

  const [, path, sessionId] = pathname.split("/")

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <Sidebar collapsible={"icon"}>
      <SidebarHeader className="h-14 justify-center">
        <SidebarTrigger size={"icon-lg"} className="absolute right-1" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={"새로운 모의면접 시작하기"}>
                  <Link to={"/"}>
                    <PlusIcon />
                    <span className="font-medium">
                      새로운 모의면접 시작하기
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>진행 중인 모의면접</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                </>
              ) : (
                ongoing.map((session) => (
                  <SidebarMenuItem key={session.session_id}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        path === "interview" && sessionId === session.session_id
                      }
                      tooltip={"이어서 모의면접 진행하기"}
                    >
                      <Link to={`/interview/${session.session_id}`}>
                        <MessageSquareDotIcon />
                        <span className="truncate">{session.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>종료된 모의면접</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton />
                    <SidebarMenuSub>
                      <SidebarMenuSkeleton />
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton />
                    <SidebarMenuSub>
                      <SidebarMenuSkeleton />
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </>
              ) : (
                completed.map((session) => (
                  <SidebarMenuItem key={session.session_id}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        path === "interview" && sessionId === session.session_id
                      }
                    >
                      <Link to={`/interview/${session.session_id}`}>
                        <span className="truncate">{session.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={
                            path === "report" &&
                            sessionId === session.session_id
                          }
                        >
                          <Link to={`/report/${session.session_id}`}>
                            피드백 보고서
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
