"use client"

import { Suspense } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    Plus,
    FileText,
    Send,
    FileEdit,
    Eye,
    Search,
    ArrowLeft,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionCards } from "@/components/section-cards"
import { CategoryFilter } from "@/components/categories/category-filter"
import { PostRow, type PostListItem } from "@/components/posts/post-row"
import { PostDialog } from "@/components/posts/post-dialog"
import { PostDeleteDialog } from "@/components/posts/post-delete-dialog"
import { PostPublishDialog } from "@/components/posts/post-publish-dialog"
import {
    listPostsAction,
    countPostsAction,
    getDashboardPostStatsAction,
} from "@/actions/post.actions"
import { getCategoriesAction } from "@/actions/category.actions"
import { getTagsAction } from "@/actions/tag.actions"
import type { Category } from "@/components/categories/category-tree"
import type { Tag } from "@/components/tags/tag-list"
import { cn } from "@/lib/utils"
import { TagFilter } from "@/components/posts/tag-filter"

type Tab = "all" | "draft" | "published" | "scheduled" | "trash"
type PublishAction = "publish" | "unpublish" | "restore"

const PAGE_SIZE = 20

export default function PostsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <p className="text-brand-muted">Loading posts...</p>
            </div>
        }>
            <PostsPageInner />
        </Suspense>
    )
}

function PostsPageInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [posts, setPosts] = useState<PostListItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>("all")
    const [query, setQuery] = useState("")
    const [categoryIds, setCategoryIds] = useState<string[]>(
        searchParams.get("categoryId") ? [searchParams.get("categoryId")!] : []
    )
    const [tagIds, setTagIds] = useState<string[]>([])

    const [categories, setCategories] = useState<Category[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [stats, setStats] = useState<any>(null)

    // Dialog state
    const [editorOpen, setEditorOpen] = useState(false)
    const [editing, setEditing] = useState<PostListItem | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<PostListItem | undefined>()
    const [publishOpen, setPublishOpen] = useState(false)
    const [publishing, setPublishing] = useState<PostListItem | undefined>()
    const [publishAction, setPublishAction] = useState<PublishAction>("publish")

    const filters = useMemo(() => {
        const f: any = {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            orderBy: "updated_at" as const,
            orderDir: "desc" as const,
        }
        if (tab === "trash") f.includeDeleted = true
        if (tab === "draft") f.published = false
        if (tab === "published") f.published = true
        if (categoryIds[0]) f.categoryId = categoryIds[0]
        if (tagIds[0]) f.tagId = tagIds[0]
        return f
    }, [tab, page, categoryIds, tagIds])

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const [rows, totalRows, dash] = await Promise.all([
                listPostsAction(filters),
                countPostsAction(filters),
                getDashboardPostStatsAction(),
            ])
            setPosts(rows as unknown as PostListItem[])
            setTotal(totalRows)
            setStats(dash)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load posts")
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        ; (async () => {
            const [c, t] = await Promise.all([getCategoriesAction(), getTagsAction()])
            setCategories(c as Category[])
            setTags(t as Tag[])
        })()
    }, [])

    const filteredPosts = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return posts
        return posts.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
        )
    }, [posts, query])

    // Handlers — all open dialogs
    function handleCreateClick() {
        setEditing(null)
        setEditorOpen(true)
    }

    function handleEditClick(post: PostListItem) {
        setEditing(post)
        setEditorOpen(true)
    }

    function handleDeleteClick(post: PostListItem) {
        setDeleting(post)
        setDeleteOpen(true)
    }

    function handlePublishClick(post: PostListItem) {
        setPublishing(post)
        setPublishAction("publish")
        setPublishOpen(true)
    }

    function handleUnpublishClick(post: PostListItem) {
        setPublishing(post)
        setPublishAction("unpublish")
        setPublishOpen(true)
    }

    function handleRestoreClick(post: PostListItem) {
        setPublishing(post)
        setPublishAction("restore")
        setPublishOpen(true)
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    // Find the selected category name from loaded categories
    const activeCategoryName = useMemo(() => {
        if (!categoryIds[0]) return null
        const match = allFlat.find((c) => c.id === categoryIds[0])
        return match?.name ?? null
    }, [categoryIds, categories])

    // Flatten categories for name lookup
    const allFlat = useMemo(() => {
        function flatten(cats: Category[]): Category[] {
            const result: Category[] = []
            for (const cat of cats) {
                result.push(cat)
                if (cat.children) result.push(...flatten(cat.children))
            }
            return result
        }
        return flatten(categories)
    }, [categories])

    function handleCategoryChange(ids: string[]) {
        setCategoryIds(ids.slice(-1))
        setPage(0)
        // Sync to URL
        const params = new URLSearchParams(searchParams.toString())
        if (ids[0]) params.set("categoryId", ids[0])
        else params.delete("categoryId")
        router.replace(`/studio/posts?${params.toString()}`, { scroll: false })
    }

    function handleClearCategory() {
        setCategoryIds([])
        setPage(0)
        const params = new URLSearchParams(searchParams.toString())
        params.delete("categoryId")
        router.replace(`/studio/posts?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex flex-col gap-6 px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-1">
                <div>
                    <h1 className="text-3xl font-bold">Posts</h1>
                    <p className="text-brand-muted">
                        Manage drafts, published posts, and scheduled content
                    </p>
                </div>
                <Button onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                </Button>
            </div>

            {/* Stats */}
            <SectionCards
                cards={[
                    {
                        label: "Total Posts",
                        value: stats?.total ?? 0,
                        icon: FileText,
                        footerTitle: "All posts",
                        footerDescription: "Across every status",
                    },
                    {
                        label: "Published",
                        value: stats?.published ?? 0,
                        icon: Send,
                        footerTitle: "Live posts",
                        footerDescription: "Visible on your site",
                    },
                    {
                        label: "Drafts",
                        value: stats?.drafts ?? 0,
                        icon: FileEdit,
                        footerTitle: "Work in progress",
                        footerDescription: "Not yet published",
                    },
                    {
                        label: "Total Views",
                        value: stats?.views ?? 0,
                        icon: Eye,
                        footerTitle: "All-time views",
                        footerDescription: "Across published posts",
                    },
                ]}
            />

            {/* Category breadcrumb */}
            {activeCategoryName && (
                <div className="flex items-center gap-2 px-1">
                    <button
                        type="button"
                        onClick={handleClearCategory}
                        className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-ink transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        All categories
                    </button>
                    <span className="text-brand-muted">/</span>
                    <span className="text-sm font-medium text-ink">
                        {activeCategoryName}
                    </span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-line px-1 overflow-x-auto">
                {(
                    [
                        { key: "all", label: "All" },
                        { key: "draft", label: "Drafts" },
                        { key: "published", label: "Published" },
                        { key: "scheduled", label: "Scheduled" },
                        { key: "trash", label: "Trash" },
                    ] as { key: Tab; label: string }[]
                ).map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => { setTab(t.key); setPage(0) }}
                        className={cn(
                            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                            tab === t.key
                                ? "border-blue-dark text-ink"
                                : "border-transparent text-brand-muted hover:text-ink"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 px-1">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="pl-8"
                    />
                </div>
                <CategoryFilter
                    categories={categories}
                    selected={categoryIds}
                    onChange={handleCategoryChange}
                />
                <TagFilter
                    tags={tags}
                    selected={tagIds}
                    onChange={(ids) => { setTagIds(ids.slice(-1)); setPage(0) }}
                />
            </div>

            {/* List */}
            <div className="rounded-lg border border-line bg-white p-3 sm:p-4 dark:bg-[#242527]">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-brand-muted">Loading posts...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <FileText className="h-10 w-10 text-brand-muted" />
                        <p className="text-brand-muted">
                            {query ? `No posts match "${query}"` : "No posts yet"}
                        </p>
                        {!query && tab === "all" && (
                            <Button onClick={handleCreateClick} variant="outline">
                                Write your first post
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredPosts.map((post) => (
                            <PostRow
                                key={post.id}
                                post={post}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                onPublish={handlePublishClick}
                                onUnpublish={handleUnpublishClick}
                                onRestore={tab === "trash" ? handleRestoreClick : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-brand-muted">
                        Page {page + 1} of {totalPages} · {total} total
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Create / Edit dialog — remounts on target change */}
            <PostDialog
                key={`editor-${editing?.id ?? "new"}-${editorOpen}`}
                open={editorOpen}
                onOpenChange={setEditorOpen}
                post={editing}
                onSaved={() => {
                    setEditing(null)
                    load()
                }}
            />

            {/* Delete confirmation */}
            <PostDeleteDialog
                key={`delete-${deleting?.id ?? "none"}-${deleteOpen}`}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                post={deleting}
                onSuccess={load}
            />

            {/* Publish / Unpublish / Restore confirmation */}
            <PostPublishDialog
                key={`publish-${publishing?.id ?? "none"}-${publishAction}-${publishOpen}`}
                open={publishOpen}
                onOpenChange={setPublishOpen}
                post={publishing}
                action={publishAction}
                onSuccess={load}
            />
        </div>
    )
}