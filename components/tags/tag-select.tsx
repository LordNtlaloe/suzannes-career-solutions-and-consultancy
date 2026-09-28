"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Hash, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getTagsAction,
    getOrCreateTagAction,
} from "@/actions/tag.actions"
import { cn } from "@/lib/utils"

export type Tag = {
    id: string
    name: string
    slug: string
}

type TagSelectProps = {
    value: Tag[]
    onChange: (tags: Tag[]) => void
    placeholder?: string
    disabled?: boolean
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function TagSelect({
    value,
    onChange,
    placeholder = "Add tags...",
    disabled,
}: TagSelectProps) {
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const data = await getTagsAction()
                    if (mounted) setAllTags(data as unknown as Tag[])
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => {
            mounted = false
        }
    }, [])

    // Close on outside click
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!containerRef.current) return
            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", onDoc)
        return () => document.removeEventListener("mousedown", onDoc)
    }, [])

    const selectedIds = useMemo(() => new Set(value.map((t) => t.id)), [value])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        const pool = allTags.filter((t) => !selectedIds.has(t.id))
        if (!q) return pool.slice(0, 20)
        return pool
            .filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.slug.toLowerCase().includes(q)
            )
            .slice(0, 20)
    }, [allTags, query, selectedIds])

    const canCreate =
        query.trim().length > 0 &&
        !allTags.some((t) => t.slug === slugify(query)) &&
        !filtered.some((t) => t.slug === slugify(query))

    function addTag(tag: Tag) {
        onChange([...value, tag])
        setQuery("")
        setOpen(false)
    }

    function removeTag(id: string) {
        onChange(value.filter((t) => t.id !== id))
    }

    async function handleCreate() {
        const name = query.trim()
        if (!name) return
        const slug = slugify(name)
        if (!slug) return

        setCreating(true)
        try {
            const id = await getOrCreateTagAction({ name, slug })
            addTag({ id, name, slug })
        } catch (err: any) {
            toast.error(err?.message || "Failed to create tag")
        } finally {
            setCreating(false)
        }
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Selected chips */}
            <div
                className={cn(
                    "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 min-h-9",
                    disabled && "opacity-60 pointer-events-none"
                )}
            >
                {value.map((tag) => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded-full bg-light px-2 py-0.5 text-xs font-medium"
                    >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                        <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className="ml-0.5 rounded-full hover:bg-background/60 p-0.5"
                            aria-label={`Remove ${tag.name}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && canCreate) {
                            e.preventDefault()
                            handleCreate()
                        }
                        if (e.key === "Backspace" && !query && value.length) {
                            removeTag(value[value.length - 1].id)
                        }
                    }}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-24 border-0 shadow-none focus-visible:ring-0 px-1 h-7"
                    disabled={disabled || creating}
                />
            </div>

            {/* Dropdown */}
            {open && (loading || filtered.length > 0 || canCreate) && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-line bg-white shadow-md max-h-64 overflow-y-auto">
                    {loading ? (
                        <p className="p-3 text-xs text-muted-foreground">
                            Loading tags...
                        </p>
                    ) : (
                        <>
                            {filtered.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => addTag(tag)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-line"
                                >
                                    <Hash className="h-3.5 w-3.5 text-brand-muted" />
                                    <span className="flex-1 truncate">{tag.name}</span>
                                    <span className="text-xs text-brand-muted">
                                        /{tag.slug}
                                    </span>
                                </button>
                            ))}

                            {canCreate && (
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-t hover:bg-line"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span className="flex-1 truncate">
                                        Create{" "}
                                        <span className="font-medium">
                                            &ldquo;{query.trim()}&rdquo;
                                        </span>
                                    </span>
                                    {creating && (
                                        <span className="text-xs text-brand-muted">
                                            Creating...
                                        </span>
                                    )}
                                </button>
                            )}

                            {filtered.length === 0 && !canCreate && (
                                <p className="p-3 text-xs text-brand-muted">
                                    No matching tags
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}