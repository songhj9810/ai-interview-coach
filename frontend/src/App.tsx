import { Navigate, Route, Routes } from "react-router-dom"

import HomePage from "@/pages/HomePage.tsx"
import InterviewPage from "@/pages/InterviewPage.tsx"
import NotFound from "@/pages/NotFound"
import ReportPage from "@/pages/ReportPage.tsx"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/interview/:sessionId" element={<InterviewPage />} />
      <Route path="/report/:sessionId" element={<ReportPage />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
