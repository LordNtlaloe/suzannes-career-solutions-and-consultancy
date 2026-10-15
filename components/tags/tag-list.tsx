"use client"

import { Edit, Trash2, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Tag = {
    id: string
    name: string
    slug: string
    post_count?: number
}

type TagListProps = {
    tags: Tag[]
    onEdit: (tag: Tag) => void
    onDelete: (tag: Tag) => void
}

export function TagList({ tags, onEdit, onDelete }: TagListProps) {
    if (tags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Hash className="h-10 w-10 text-brand-muted" />
                <p className="text-brand-muted">No tags yet</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
                <TagRow key={tag.id} tag={tag} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    )
}

function TagRow({
    tag,
    onEdit,
    onDelete,
}: {
    tag: Tag
    onEdit: (tag: Tag) => void
    onDelete: (tag: Tag) => void
}) {
    return (
        <div
            className={cn(
                "group flex items-center gap-3 rounded-0 border border-line bg-white px-3 py-2 dark:bg-[#242527]",
                "hover:border-ink/20 transition-colors"
            )}
        >
            <div className="flex items-center justify-center h-8 w-8 rounded-0 bg-light">
                <Hash className="h-4 w-4 text-brand-muted" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{tag.name}</span>
                    <span className="text-xs text-brand-muted bg-light px-2 py-0.5 rounded">
                        {tag.post_count ?? 0}
                    </span>
                </div>
                <p className="text-xs text-brand-muted truncate">
                    /{tag.slug}
                </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(tag)}
                    aria-label={`Edit ${tag.name}`}
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(tag)}
                    aria-label={`Delete ${tag.name}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}