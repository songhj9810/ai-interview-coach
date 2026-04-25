import { useCallback, useState } from "react"

import { SessionContext } from "./context"

import type { Session } from "@/types"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ongoing, setOngoing] = useState<Session[]>([])
  const [completed, setCompleted] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/sessions`)
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const sessions: Session[] = await response.json()
      setOngoing(sessions.filter((session) => !session.is_finished)) // 진행 중인 면접
      setCompleted(sessions.filter((session) => session.is_finished)) // 종료된 면접
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <SessionContext.Provider value={{ ongoing, completed, isLoading, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}
