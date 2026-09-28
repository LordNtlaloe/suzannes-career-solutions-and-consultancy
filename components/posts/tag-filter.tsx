"use client"

import { Hash } from "lucide-react"
import { cn } from "@/lib/utils"

export type Tag = {
    id: string
    name: string
    slug: string
    post_count?: number
}

type TagFilterProps = {
    tags: Tag[]
    selected: string[]
    onChange: (selected: string[]) => void
    includeAll?: boolean
    allLabel?: string
    className?: string
    disabled?: boolean
    /** Optional: cap the number of visible tags (rest are hidden). */
    max?: number
}

export function TagFilter({
    tags,
    selected,
    onChange,
    includeAll = true,
    allLabel = "All",
    className,
    disabled,
    max,
}: TagFilterProps) {
    const visible = typeof max === "number" ? tags.slice(0, max) : tags
    const isAllActive = selected.length === 0

    function toggle(id: string) {
        if (disabled) return
        const next = selected.includes(id)
            ? selected.filter((s) => s !== id)
            : [...selected, id]
        onChange(next)
    }

    return (
        <div
            className={cn(
                "flex flex-wrap gap-2",
                disabled && "opacity-60 pointer-events-none",
                className
            )}
            role="group"
            aria-label="Filter by tag"
        >
            {includeAll && (
                <button
                    type="button"
                    onClick={() => onChange([])}
                    aria-pressed={isAllActive}
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        isAllActive
                            ? "bg-blue-dark text-white border-blue-dark"
                            : "border-line hover:bg-line"
                    )}
                >
                    {allLabel}
                </button>
            )}

            {visible.map((tag) => {
                const active = selected.includes(tag.id)
                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggle(tag.id)}
                        aria-pressed={active}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            active
                                ? "bg-blue-dark text-white border-blue-dark"
                                : "border-line hover:bg-line"
                        )}
                    >
                        <Hash className="h-3 w-3" />
                        <span>{tag.name}</span>
                        {typeof tag.post_count === "number" && (
                            <span
                                className={cn(
                                    "tabular-nums",
                                    active ? "opacity-90" : "opacity-60"
                                )}
                            >
                                {tag.post_count}
                            </span>
                        )}
                    </button>
                )
            })}

            {typeof max === "number" && tags.length > max && (
                <span className="inline-flex items-center px-2 text-xs text-brand-muted">
                    +{tags.length - max} more
                </span>
            )}
        </div>
    )
}