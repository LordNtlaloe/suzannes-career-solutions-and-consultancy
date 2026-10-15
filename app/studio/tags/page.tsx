"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Hash, FileText, TrendingUp, Tag as IconTag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionCards } from "@/components/section-cards"
import { TagList, type Tag } from "@/components/tags/tag-list"
import { TagDialog } from "@/components/tags/tag-dialog"
import { TagDeleteDialog } from "@/components/tags/tag-delete-dialog"
import { getTagsWithCountsAction } from "@/actions/tag.actions"

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Tag | undefined>()

    const loadTags = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getTagsWithCountsAction()
            setTags(data as unknown as Tag[])
        } catch (err) {
            console.error("Failed to load tags:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTags()
    }, [loadTags])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return tags
        return tags.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.slug.toLowerCase().includes(q)
        )
    }, [tags, query])

    const totalTags = tags.length
    const totalPosts = tags.reduce((sum, t) => sum + (t.post_count ?? 0), 0)
    const unusedTags = tags.filter((t) => (t.post_count ?? 0) === 0).length

    function handleCreateClick() {
        setSelected(undefined)
        setCreateOpen(true)
    }

    function handleEditClick(tag: Tag) {
        setSelected(tag)
        setEditOpen(true)
    }

    function handleDeleteClick(tag: Tag) {
        setSelected(tag)
        setDeleteOpen(true)
    }

    return (
        <div className="flex flex-col gap-6 px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap px-1">
                <div>
                    <h1 className="text-3xl font-bold">Tags</h1>
                    <p className="text-brand-muted">
                        Manage tags used to organize your posts
                    </p>
                </div>
                <Button onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Tag
                </Button>
            </div>

            {/* Stats */}
            <SectionCards
                cards={[
                    {
                        label: "Total Tags",
                        value: totalTags,
                        icon: IconTag,
                        footerTitle: "All tags in your blog",
                        footerDescription: "Across every post",
                    },
                    {
                        label: "Tagged Posts",
                        value: totalPosts,
                        icon: FileText,
                        footerTitle: "Post ↔ tag relations",
                        footerDescription: "Posts that have at least one tag",
                    },
                    {
                        label: "Unused Tags",
                        value: unusedTags,
                        icon: Hash,
                        footerTitle: "No posts attached",
                        footerDescription: "Consider cleaning these up",
                    },
                    {
                        label: "Most Popular",
                        value: tags[0]?.name ?? "—",
                        icon: TrendingUp,
                        footerTitle:
                            tags[0] != null
                                ? `${tags[0].post_count ?? 0} posts`
                                : "No data",
                        footerDescription: "Highest tagged tag",
                    },
                ]}
            />

            {/* Filter */}
            <div className="flex items-center gap-2 px-1">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tags by name or slug..."
                    className="max-w-sm"
                />
                {query && (
                    <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                        Clear
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="rounded-lg border border-line bg-white p-4 sm:p-6 dark:bg-[#242527]">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-brand-muted">Loading tags...</p>
                    </div>
                ) : tags.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Hash className="h-10 w-10 text-brand-muted" />
                        <p className="text-brand-muted">No tags yet</p>
                        <Button onClick={handleCreateClick} variant="outline">
                            Create your first tag
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-brand-muted">
                            No tags match &ldquo;{query}&rdquo;
                        </p>
                    </div>
                ) : (
                    <TagList
                        tags={filtered}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            {/* Dialogs */}
            <TagDialog
                key={`create-${createOpen}`}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={loadTags}
            />

            <TagDialog
                key={`edit-${selected?.id ?? "none"}-${editOpen}`}
                open={editOpen}
                onOpenChange={setEditOpen}
                tag={selected}
                onSuccess={loadTags}
            />

            <TagDeleteDialog
                key={`delete-${selected?.id ?? "none"}-${deleteOpen}`}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                tag={selected}
                onSuccess={loadTags}
            />
        </div>
    )
}