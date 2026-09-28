"use client"

import { Moon, Sun } from "lucide-react"
import { useAppearance } from "@/hooks/use-appearance"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarThemeToggle() {
  const { resolvedAppearance, updateAppearance } = useAppearance()

  const toggle = () => {
    updateAppearance(resolvedAppearance === "dark" ? "light" : "dark")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggle}
          className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
          tooltip={resolvedAppearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedAppearance === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span>
            {resolvedAppearance === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}