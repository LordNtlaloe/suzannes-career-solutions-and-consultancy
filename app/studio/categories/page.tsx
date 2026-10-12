"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
    Plus,
    FolderTree,
    Folder,
    FileText,
    Layers,
    Search,
    LayoutList,
    Network,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionCards } from "@/components/section-cards"
import { CategoryTree, type Category } from "@/components/categories/category-tree"
import { CategoryList } from "@/components/categories/category-list"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryDeleteDialog } from "@/components/categories/category-delete-dialog"
import { getCategoriesAction } from "@/actions/category.actions"
import { cn } from "@/lib/utils"

type ViewMode = "tree" | "list"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [view, setView] = useState<ViewMode>("tree")

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Category | undefined>()

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getCategoriesAction()
            setCategories(data as Category[])
        } catch (err) {
            console.error("Failed to load categories:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCategories()
    }, [loadCategories])

    const allFlat = useMemo(() => flattenCategories(categories), [categories])

    const filteredTree = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return categories
        return filterTree(categories, q)
    }, [categories, query])

    const filteredFlat = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return allFlat
        return allFlat.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.slug.toLowerCase().includes(q) ||
                (c.description ?? "").toLowerCase().includes(q)
        )
    }, [allFlat, query])

    const totalCount = allFlat.length
    const totalPosts = useMemo(
        () => allFlat.reduce((sum, c) => sum + (c.post_count ?? 0), 0),
        [allFlat]
    )
    const emptyCategories = allFlat.filter((c) => (c.post_count ?? 0) === 0).length

    function handleCreateClick() {
        setSelected(undefined)
        setCreateOpen(true)
    }

    function handleEditClick(category: Category) {
        setSelected(category)
        setEditOpen(true)
    }

    function handleDeleteClick(category: Category) {
        setSelected(category)
        setDeleteOpen(true)
    }

    return (
        <div className="flex flex-col gap-6 px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap px-1">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-brand-muted">
                        Organize your posts with categories and subcategories
                    </p>
                </div>
                <Button onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            {/* Stats */}
            <SectionCards
                cards={[
                    {
                        label: "Total Categories",
                        value: totalCount,
                        icon: FolderTree,
                        footerTitle: "All categories and subcategories",
                        footerDescription: "Across your entire taxonomy",
                    },
                    {
                        label: "Top-Level Categories",
                        value: categories.length,
                        icon: Folder,
                        footerTitle: "Root categories",
                        footerDescription: "Categories without a parent",
                    },
                    {
                        label: "Published Posts",
                        value: totalPosts,
                        icon: FileText,
                        footerTitle: "Linked to categories",
                        footerDescription: "Published and not deleted",
                    },
                    {
                        label: "Empty Categories",
                        value: emptyCategories,
                        icon: Layers,
                        footerTitle: "No posts attached",
                        footerDescription: "Consider cleaning these up",
                    },
                ]}
            />

            {/* Toolbar: search + view toggle */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-1">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search categories by name, slug, or description..."
                        className="pl-8"
                    />
                </div>

                <div className="inline-flex rounded-0 border border-line p-0.5 bg-white">
                    <button
                        type="button"
                        onClick={() => setView("tree")}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                            view === "tree"
                                ? "bg-blue-dark text-white"
                                : "hover:bg-line"
                        )}
                        aria-label="Tree view"
                    >
                        <Network className="h-3.5 w-3.5" />
                        Tree
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("list")}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                            view === "list"
                                ? "bg-blue-dark text-white"
                                : "hover:bg-line"
                        )}
                        aria-label="List view"
                    >
                        <LayoutList className="h-3.5 w-3.5" />
                        List
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-brand-muted">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <FolderTree className="h-10 w-10 text-brand-muted" />
                        <p className="text-brand-muted">No categories yet</p>
                        <Button onClick={handleCreateClick} variant="outline">
                            Create your first category
                        </Button>
                    </div>
                ) : query && filteredFlat.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-brand-muted">
                            No categories match &ldquo;{query}&rdquo;
                        </p>
                    </div>
                ) : view === "tree" ? (
                    <CategoryTree
                        categories={query ? filteredTree : categories}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ) : (
                    <CategoryList
                        categories={filteredFlat}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            {/* Dialogs */}
            <CategoryDialog
                key={`create-${createOpen}`}
                open={createOpen}
                onOpenChange={setCreateOpen}
                parentCategories={allFlat}
                onSuccess={loadCategories}
            />

            <CategoryDialog
                key={`edit-${selected?.id ?? "none"}-${editOpen}`}
                open={editOpen}
                onOpenChange={setEditOpen}
                category={selected}
                parentCategories={allFlat}
                onSuccess={loadCategories}
            />

            <CategoryDeleteDialog
                key={`delete-${selected?.id ?? "none"}-${deleteOpen}`}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                category={selected}
                onSuccess={loadCategories}
            />
        </div>
    )
}

/**
 * Flatten nested categories into a single-level array.
 */
function flattenCategories(categories: Category[]): Category[] {
    const result: Category[] = []

    function flatten(cats: Category[]) {
        for (const cat of cats) {
            result.push(cat)
            if (cat.children?.length) flatten(cat.children)
        }
    }

    flatten(categories)
    return result
}

/**
 * Filter a tree, keeping any node that matches or has a descendant that
 * matches. Returns the pruned tree.
 */
function filterTree(categories: Category[], q: string): Category[] {
    const result: Category[] = []

    for (const cat of categories) {
        const matchesSelf =
            cat.name.toLowerCase().includes(q) ||
            cat.slug.toLowerCase().includes(q) ||
            (cat.description ?? "").toLowerCase().includes(q)

        const filteredChildren = cat.children?.length
            ? filterTree(cat.children, q)
            : []

        if (matchesSelf || filteredChildren.length > 0) {
            result.push({
                ...cat,
                children: filteredChildren,
            })
        }
    }

    return result
}