"use client"

import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/components/categories/category-tree"

type CategoryFilterProps = {
    categories: Category[]
    selected: string[]
    onChange: (selected: string[]) => void
    includeAll?: boolean
    className?: string
}

export function CategoryFilter({
    categories,
    selected,
    onChange,
    includeAll = true,
    className,
}: CategoryFilterProps) {
    function toggle(id: string) {
        if (selected.includes(id)) {
            onChange(selected.filter((s) => s !== id))
        } else {
            onChange([...selected, id])
        }
    }

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {includeAll && (
                <button
                    type="button"
                    onClick={() => onChange([])}
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        selected.length === 0
                            ? "bg-blue-dark text-white border-blue-dark"
                            : "hover:bg-line"
                    )}
                >
                    All
                </button>
            )}
            {categories.map((category) => {
                const active = selected.includes(category.id)
                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => toggle(category.id)}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            active
                                ? "bg-blue-dark text-white border-blue-dark"
                                : "hover:bg-line"
                        )}
                    >
                        <Folder className="h-3 w-3" />
                        {category.name}
                        {typeof category.post_count === "number" && (
                            <span className={cn("opacity-70", active && "opacity-90")}>
                                {category.post_count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}