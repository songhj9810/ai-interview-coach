import { createContext, useContext } from 'react'

import type { Session } from '@/types'

type SessionProviderState = {
  ongoing: Session[]
  completed: Session[]
  isLoading: boolean
  refresh: () => void
}

export const SessionContext = createContext<SessionProviderState | undefined>(
  undefined
)

export const useSession = () => {
  const context = useContext(SessionContext)

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}
