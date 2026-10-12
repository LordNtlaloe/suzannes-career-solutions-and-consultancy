"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Reply, Trash2, Shield } from "lucide-react"
import { toast } from "sonner"
import { CommentForm } from "./comment-form"
import { CommentLikeButton } from "./comment-like-button"
import { deleteCommentAction } from "@/actions/comment.actions"
import { cn } from "@/lib/utils"

export type CommentNode = {
    id: string
    post_id: string
    user_id: string
    parent_id: string | null
    body: string
    depth: number
    path: string
    like_count: number
    reply_count: number
    is_deleted: boolean | number
    deleted_at: number | null
    created_at: number
    updated_at: number
    author_name: string | null
    author_image: string | null
    children: CommentNode[]
}

type CommentItemProps = {
    comment: CommentNode
    currentUserId?: string | null
    currentUserRole?: string | null
    isAuthenticated?: boolean
    maxDepth?: number
    onRefresh?: () => void
}

function formatRelative(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function initials(name?: string | null) {
    if (!name) return "?"
    return name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

export function CommentItem({
    comment,
    currentUserId,
    currentUserRole,
    isAuthenticated,
    maxDepth = 4,
    onRefresh,
}: CommentItemProps) {
    const [replyOpen, setReplyOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isOwner = currentUserId === comment.user_id
    const isStaff =
        currentUserRole === "admin" || currentUserRole === "moderator"
    const canEdit = isOwner
    const canDelete = isOwner || isStaff
    const isDeleted = !!comment.is_deleted

    const indent = Math.min(comment.depth, maxDepth)

    if (isDeleted && comment.children.length === 0) {
        return null
    }

    async function handleDelete() {
        if (!confirm("Delete this comment?")) return
        setDeleting(true)
        try {
            await deleteCommentAction(comment.id)
            toast.success("Comment deleted")
            onRefresh?.()
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to delete")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div
            className="flex flex-col gap-2"
            style={{ marginLeft: indent > 0 ? `${indent * 16}px` : 0 }}
        >
            <div
                className={cn(
                    "flex gap-3 rounded-lg border border-line bg-white p-3",
                    isDeleted && "opacity-60"
                )}
            >
                <div className="h-8 w-8 shrink-0 rounded-full bg-light overflow-hidden flex items-center justify-center text-[10px] font-semibold">
                    {comment.author_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={comment.author_image}
                            alt={comment.author_name ?? ""}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials(comment.author_name)
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span className="font-semibold text-ink">
                            {comment.author_name ?? "Anonymous"}
                        </span>
                        {isStaff && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue/12 px-1.5 py-0.5 text-[10px] font-semibold text-blue-dark">
                                <Shield className="h-2.5 w-2.5" />
                                Staff
                            </span>
                        )}
                        <span className="text-[#a1a1a1] text-[11px]">
                            {formatRelative(comment.created_at)}
                        </span>
                        {comment.updated_at > comment.created_at + 1 && !isDeleted && (
                            <span className="text-[11px] text-[#a1a1a1] italic">
                                edited
                            </span>
                        )}
                    </div>

                    {isDeleted ? (
                        <p className="text-[13px] italic text-[#a1a1a1] mt-1">
                            This comment has been deleted.
                        </p>
                    ) : editOpen ? (
                        <div className="mt-2">
                            <CommentForm
                                postId={comment.post_id}
                                editingId={comment.id}
                                initialBody={comment.body}
                                compact
                                onSuccess={() => {
                                    setEditOpen(false)
                                    onRefresh?.()
                                }}
                                onCancel={() => setEditOpen(false)}
                            />
                        </div>
                    ) : (
                        <p className="text-[13px] mt-1 whitespace-pre-wrap wrap-break-word text-ink">
                            {comment.body}
                        </p>
                    )}

                    {!isDeleted && !editOpen && (
                        <div className="flex items-center gap-1 mt-2 -ml-1">
                            <CommentLikeButton
                                commentId={comment.id}
                                initialCount={comment.like_count}
                                isAuthenticated={isAuthenticated}
                            />

                            <button
                                type="button"
                                className="inline-flex items-center gap-1 h-6 px-2 text-[11px] text-[#a1a1a1] hover:text-blue-dark transition-colors font-semibold"
                                onClick={() => setReplyOpen((v) => !v)}
                            >
                                <Reply className="h-3 w-3" />
                                Reply
                            </button>

                            {(canEdit || canDelete) && (
                                <div className="relative inline-flex">
                                    <button
                                        type="button"
                                        className="h-6 w-6 flex items-center justify-center text-[#a1a1a1] hover:text-blue-dark transition-colors rounded"
                                        aria-label="More"
                                        onClick={() => {
                                            const menu = document.getElementById(`comment-menu-${comment.id}`)
                                            if (menu) menu.classList.toggle('hidden')
                                        }}
                                    >
                                        <MoreHorizontal className="h-3 w-3" />
                                    </button>
                                    <div
                                        id={`comment-menu-${comment.id}`}
                                        className="hidden absolute top-full left-0 mt-1 z-10 min-w-30 rounded-0 border border-line bg-white shadow-soft py-1"
                                    >
                                        {canEdit && (
                                            <button
                                                type="button"
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-ink hover:bg-light transition-colors"
                                                onClick={() => setEditOpen(true)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500 hover:bg-light transition-colors"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                {deleting ? "Deleting..." : "Delete"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {replyOpen && (
                        <div className="mt-3">
                            <CommentForm
                                postId={comment.post_id}
                                parentId={comment.id}
                                compact
                                onSuccess={() => {
                                    setReplyOpen(false)
                                    onRefresh?.()
                                }}
                                onCancel={() => setReplyOpen(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {comment.children.length > 0 && (
                <div className="flex flex-col gap-2">
                    {comment.children.map((child) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            isAuthenticated={isAuthenticated}
                            maxDepth={maxDepth}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}