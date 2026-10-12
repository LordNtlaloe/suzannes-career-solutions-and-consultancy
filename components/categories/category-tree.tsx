"use client"

import { ChevronDown, ChevronRight, Edit, Trash2, Folder } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export type Category = {
    id: string
    name: string
    slug: string
    description?: string | null
    parent_id?: string | null
    children?: Category[]
    post_count?: number
}

type CategoryTreeProps = {
    categories: Category[]
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
    return (
        <div className="space-y-1">
            {categories.map((category) => (
                <CategoryNode
                    key={category.id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

type CategoryNodeProps = {
    category: Category
    level?: number
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

function CategoryNode({
    category,
    level = 0,
    onEdit,
    onDelete,
}: CategoryNodeProps) {
    const [expanded, setExpanded] = useState(level === 0)
    const hasChildren = !!category.children && category.children.length > 0

    return (
        <div>
            <div
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-line group"
                style={{ paddingLeft: `${level * 20 + 8}px` }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        aria-label={expanded ? "Collapse" : "Expand"}
                        className="p-0 h-5 w-5 flex items-center justify-center rounded hover:bg-light"
                    >
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                ) : (
                    <div className="h-5 w-5" />
                )}

                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-light shrink-0">
                    <Folder className="h-3.5 w-3.5 text-brand-muted" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                            {category.name}
                        </span>
                        <Link
                            href={`/studio/posts?categoryId=${category.id}`}
                            className="text-xs text-brand-muted bg-light px-2 py-0.5 rounded hover:bg-blue-dark/10 hover:text-blue-dark transition-colors"
                            title={`View posts in ${category.name}`}
                        >
                            {category.post_count ?? 0} posts
                        </Link>
                        {hasChildren && (
                            <span className="text-xs text-brand-muted">
                                {category.children!.length} subcategories
                            </span>
                        )}
                    </div>
                    {category.description && (
                        <p className="text-xs text-brand-muted truncate">
                            {category.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(category)}
                        aria-label={`Edit ${category.name}`}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(category)}
                        aria-label={`Delete ${category.name}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {expanded && hasChildren && (
                <div>
                    {category.children!.map((child) => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}