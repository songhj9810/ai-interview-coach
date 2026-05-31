import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from '@/providers/session'

import App from './App'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </SessionProvider>
  </StrictMode>
)
