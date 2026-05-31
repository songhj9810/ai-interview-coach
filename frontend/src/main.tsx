import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InterviewProvider } from '@/providers/interview'
import { SessionProvider } from '@/providers/session'
import { ThemeProvider } from '@/providers/theme'

import App from './App'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <InterviewProvider>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </InterviewProvider>
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>
)
