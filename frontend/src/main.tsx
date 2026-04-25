import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { Toaster } from "@/components/ui/sonner.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { SessionProvider } from "@/providers/session"
import { ThemeProvider } from "@/providers/theme"

import App from "./App.tsx"

import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
