import { createContext, useContext } from "react"

import type { Session } from "@/types"

interface SessionContextType {
  ongoing: Session[]
  completed: Session[]
  isLoading: boolean
  refresh: () => void
}

export const SessionContext = createContext<SessionContextType | null>(null)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context)
    throw new Error("useSession must be used within SessionProvider")
  return context
}
