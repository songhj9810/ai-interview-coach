import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
      <BrowserRouter>
        <SessionProvider>
          <InterviewProvider>
            <TooltipProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <App />
                </SidebarInset>
                <Toaster />
              </SidebarProvider>
            </TooltipProvider>
          </InterviewProvider>
        </SessionProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
