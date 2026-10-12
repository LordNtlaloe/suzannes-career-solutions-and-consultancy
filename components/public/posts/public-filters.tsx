"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { FolderTree, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Option = {
    id: string
    name: string
    slug: string
    post_count?: number
}

type Props = {
    categories: Option[]
    tags: Option[]
    basePath: string
    activeCategorySlug?: string
    activeTagSlug?: string
    lockedCategory?: boolean
    lockedTag?: boolean
    maxCategories?: number
    maxTags?: number
}

/* -------------------------------------------------------------------------- */
/*                              Value renderers                               */
/* -------------------------------------------------------------------------- */

const BADGE_LIMIT = 2

function BadgesOrStack({
    options,
    activeSlug,
    locked,
    fallback,
}: {
    options: Option[]
    activeSlug?: string
    locked?: boolean
    fallback: string
}) {
    const selected = options.filter((o) => o.slug === activeSlug)
    if (locked) return <span className="text-brand-muted text-xs">{fallback}</span>
    if (!activeSlug) return <span className="text-[#a1a1a1] text-xs">{fallback}</span>
    if (selected.length > BADGE_LIMIT) return <StackedDots options={selected} />

    return (
        <span className="flex items-center gap-1.5">
            {selected.map((option) => (
                <span
                    key={option.id}
                    className="inline-flex items-center gap-1 rounded-0 border border-blue-dark/20 bg-blue-dark/10 px-2 py-0.5 text-[11px] font-semibold text-blue-dark"
                >
                    {option.name}
                    {typeof option.post_count === "number" && (
                        <span className="opacity-60 tabular-nums">· {option.post_count}</span>
                    )}
                </span>
            ))}
        </span>
    )
}

function StackedDots({ options }: { options: Option[] }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className="flex items-center">
                {options.slice(0, 4).map((option) => (
                    <span
                        key={option.id}
                        className="ring-background -ml-1 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-dark ring-2 first:ml-0"
                    />
                ))}
            </span>
            <span className="text-brand-muted text-xs tabular-nums">
                {options.length}
            </span>
        </span>
    )
}

/* -------------------------------------------------------------------------- */
/*                              Field component                               */
/* -------------------------------------------------------------------------- */

function FilterField({
    icon,
    label,
    chips,
    children,
}: {
    icon: React.ReactNode
    label: string
    chips?: React.ReactNode
    children?: React.ReactNode
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 min-h-10 dark:bg-[#242527] dark:border-[#333]">
            <span className="flex items-center gap-2 text-[#a1a1a1] shrink-0 dark:text-[#6b7280]">
                <span className="h-4 w-4">{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px]">
                    {label}
                </span>
            </span>

            {chips && (
                <span className="flex items-center gap-1">{chips}</span>
            )}

            {children && (
                <span className="flex items-center gap-1 flex-wrap">{children}</span>
            )}

            {!children && (
                <span className="flex items-center gap-1 flex-wrap">{chips}</span>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                                   Chips                                    */
/* -------------------------------------------------------------------------- */

function Chip({
    label,
    count,
    active,
    onClick,
}: {
    label: string
    count?: number
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "inline-flex items-center gap-1 rounded-0 px-2 py-0.5 text-[11px] font-semibold transition-colors",
                active
                    ? "bg-blue-dark text-white shadow-btn"
                    : "border border-line text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark dark:border-[#333] dark:text-[#6b7280]"
            )}
        >
            {label}
            {typeof count === "number" && (
                <span
                    className={cn(
                        "tabular-nums",
                        active ? "opacity-90" : "opacity-60"
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    )
}

/* -------------------------------------------------------------------------- */
/*                                Filters bar                                 */
/* -------------------------------------------------------------------------- */

export function PublicFilters({
    categories,
    tags,
    basePath,
    activeCategorySlug,
    activeTagSlug,
    lockedCategory,
    lockedTag,
    maxCategories = 8,
    maxTags = 12,
}: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const setParam = useCallback(
        (key: "category" | "tag", value: string | null) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) params.set(key, value)
            else params.delete(key)
            params.delete("page")
            const qs = params.toString()
            router.push(qs ? `${basePath}?${qs}` : basePath)
        },
        [basePath, router, searchParams]
    )

    const clearAll = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("category")
        params.delete("tag")
        params.delete("page")
        const qs = params.toString()
        router.push(qs ? `${basePath}?${qs}` : basePath)
    }, [basePath, router, searchParams])

    const hasActiveFilters = Boolean(activeCategorySlug || activeTagSlug)

    // Nothing to show when both are locked
    if (lockedCategory && lockedTag) return null

    return (
        <div className="flex flex-col gap-3">
            {/* Category field */}
            {!lockedCategory && categories.length > 0 && (
                <FilterField
                    icon={<FolderTree className="h-4 w-4" />}
                    label="Category"
                    chips={
                        <>
                            <Chip
                                label="All"
                                active={!activeCategorySlug}
                                onClick={() => setParam("category", null)}
                            />
                            {categories.slice(0, maxCategories).map((c) => (
                                <Chip
                                    key={c.id}
                                    label={c.name}
                                    count={c.post_count}
                                    active={activeCategorySlug === c.slug}
                                    onClick={() =>
                                        setParam(
                                            "category",
                                            activeCategorySlug === c.slug ? null : c.slug
                                        )
                                    }
                                />
                            ))}
                        </>
                    }
                />
            )}

            {/* Tag field */}
            {!lockedTag && tags.length > 0 && (
                <FilterField
                    icon={<Hash className="h-4 w-4" />}
                    label="Tag"
                    chips={
                        <>
                            <Chip
                                label="Any"
                                active={!activeTagSlug}
                                onClick={() => setParam("tag", null)}
                            />
                            {tags.slice(0, maxTags).map((t) => (
                                <Chip
                                    key={t.id}
                                    label={`#${t.name}`}
                                    count={t.post_count}
                                    active={activeTagSlug === t.slug}
                                    onClick={() =>
                                        setParam("tag", activeTagSlug === t.slug ? null : t.slug)
                                    }
                                />
                            ))}
                        </>
                    }
                />
            )}

            {/* Clear all */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={clearAll}
                    className="self-start text-[11px] font-semibold text-[#a1a1a1] transition-colors hover:text-blue-dark"
                >
                    Clear all filters
                </button>
            )}
        </div>
    )
}