import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { AppSidebar } from "@/components/app-sidebar.tsx"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { InterviewProvider } from "@/providers/interview"
import { SessionProvider } from "@/providers/session"
import { ThemeProvider } from "@/providers/theme"

import App from "./App.tsx"

import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <SidebarProvider>
          <SessionProvider>
            <InterviewProvider>
              <AppSidebar />
              <SidebarInset>
                <App />
              </SidebarInset>
            </InterviewProvider>
          </SessionProvider>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
