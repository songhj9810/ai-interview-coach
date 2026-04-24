import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/providers/theme"

import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      type={"button"}
      variant={"ghost"}
      size={"icon"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  )
}
