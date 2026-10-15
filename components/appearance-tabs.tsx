"use client"

import type { HTMLAttributes } from "react"
import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Appearance, useAppearance } from "@/hooks/use-appearance"

type AppearanceToggleTabProps = HTMLAttributes<HTMLDivElement>

export function AppearanceTabs({
    className,
    ...props
}: AppearanceToggleTabProps) {
    const { appearance, updateAppearance } = useAppearance()

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "System" },
    ]

    return (
        <div
            className={cn(
                "inline-flex items-center gap-0.5 rounded-0 border border-line bg-white p-0.5 dark:bg-[#242527]",
                className
            )}
            role="group"
            aria-label="Appearance"
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => {
                const active = appearance === value
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        aria-pressed={active}
                        aria-label={label}
                        title={label}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                                ? "bg-blue-dark text-white"
                                : "text-brand-muted hover:text-ink hover:bg-line"
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        <span className="sr-only sm:not-sr-only">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}