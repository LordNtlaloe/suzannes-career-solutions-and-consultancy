"use client"

import { Moon, Sun } from "lucide-react"
import { useAppearance } from "@/hooks/use-appearance"

export function PublicThemeToggle() {
  const { resolvedAppearance, updateAppearance } = useAppearance()

  const toggle = () => {
    updateAppearance(resolvedAppearance === "dark" ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center h-8 w-8 rounded-0 text-[#c4c4c4] hover:text-white transition-colors"
      aria-label={resolvedAppearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={resolvedAppearance === "dark" ? "Light mode" : "Dark mode"}
    >
      {resolvedAppearance === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}