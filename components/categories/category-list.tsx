"use client"

import { Edit, Trash2, Folder, FolderTree } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/components/categories/category-tree"

type CategoryListProps = {
    categories: Category[]
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

export function CategoryList({
    categories,
    onEdit,
    onDelete,
}: CategoryListProps) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FolderTree className="h-10 w-10 text-brand-muted" />
                <p className="text-brand-muted">No categories yet</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
                <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

function CategoryRow({
    category,
    onEdit,
    onDelete,
}: {
    category: Category
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}) {
    const hasChildren = !!category.children && category.children.length > 0
    const Icon = hasChildren ? FolderTree : Folder

    return (
        <div
            className={cn(
                "group flex items-center gap-3 rounded-0 border border-line bg-white px-3 py-2 dark:bg-[#242527]",
                "hover:border-ink/20 transition-colors"
            )}
        >
            <div className="flex items-center justify-center h-8 w-8 rounded-0 bg-light shrink-0">
                <Icon className="h-4 w-4 text-brand-muted" />
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
                        {category.post_count ?? 0}
                    </Link>
                </div>
                <p className="text-xs text-brand-muted truncate">
                    /{category.slug}
                    {hasChildren && (
                        <span className="ml-2 opacity-70">
                            · {category.children!.length} subcategories
                        </span>
                    )}
                </p>
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
    )
}