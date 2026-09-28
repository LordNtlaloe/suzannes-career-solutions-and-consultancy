"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PostEditor } from "@/components/posts/editor/post-editor"
import { getPostWithRelationsAction } from "@/actions/post.actions"
import type { PostListItem } from "@/components/posts/post-row"

type PostDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    post?: PostListItem | null
    onSaved: (id: string) => void
}

export function PostDialog({
    open,
    onOpenChange,
    post,
    onSaved,
}: PostDialogProps) {
    const isEdit = !!post
    const [loading, setLoading] = useState(false)
    const [initial, setInitial] = useState<any>(null)

    useEffect(() => {
        if (!open) return
        if (!post) {
            setInitial(null)
            return
        }
        let mounted = true
            ; (async () => {
                try {
                    setLoading(true)
                    const full = await getPostWithRelationsAction(post.id)
                    if (!mounted) return
                    setInitial(
                        full
                            ? {
                                id: full.id,
                                title: full.title,
                                slug: full.slug,
                                content: full.content,
                                excerpt: full.excerpt ?? "",
                                categoryId: full.category_id,
                                coverImageId: full.cover_image_id ?? null,
                                tags: (full.tags ?? []).map((t: any) => ({
                                    id: t.id,
                                    name: t.name,
                                    slug: t.slug,
                                })),
                                published: !!full.published,
                                scheduledAt: full.scheduled_at ?? null,
                            }
                            : null
                    )
                } catch (err) {
                    console.error(err)
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => {
            mounted = false
        }
    }, [open, post])

    function handleSaved(id: string) {
        onOpenChange(false)
        onSaved(id)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Post" : "New Post"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update your post and save your changes."
                            : "Draft, publish, or schedule a new post."}
                    </DialogDescription>
                </DialogHeader>

                {isEdit && loading ? (
                    <div className="py-16 text-center text-sm text-brand-muted">
                        Loading post...
                    </div>
                ) : (
                    <PostEditor
                        key={post?.id ?? "new"}
                        mode={isEdit ? "edit" : "create"}
                        initial={initial ?? undefined}
                        onCancel={() => onOpenChange(false)}
                        onSaved={handleSaved}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}