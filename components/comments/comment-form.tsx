"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Send, X } from "lucide-react"
import { createCommentAction, updateCommentAction } from "@/actions/comment.actions"
import { cn } from "@/lib/utils"

type CommentFormProps = {
    postId: string
    parentId?: string | null
    /** If provided, edits an existing comment instead of creating */
    editingId?: string
    /** Pre-filled body when editing */
    initialBody?: string
    /** Called after a successful create or update */
    onSuccess?: () => void
    /** Called when the user cancels (edit mode) */
    onCancel?: () => void
    /** Compact layout for nested replies */
    compact?: boolean
    placeholder?: string
}

export function CommentForm({
    postId,
    parentId = null,
    editingId,
    initialBody = "",
    onSuccess,
    onCancel,
    compact = false,
    placeholder,
}: CommentFormProps) {
    const [body, setBody] = useState(initialBody)
    const [loading, setLoading] = useState(false)
    const isEdit = !!editingId

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const text = body.trim()
        if (!text) {
            toast.error("Comment cannot be empty")
            return
        }

        setLoading(true)
        try {
            if (isEdit) {
                await updateCommentAction(editingId!, text)
                toast.success("Comment updated")
            } else {
                await createCommentAction({ postId, parentId, body: text })
                toast.success("Comment posted")
                setBody("")
            }
            onSuccess?.()
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", compact && "gap-1.5")}>
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                    placeholder ??
                    (parentId ? "Write a reply..." : "Share your thoughts...")
                }
                rows={compact ? 2 : 3}
                disabled={loading}
                className={cn(
                    "w-full rounded-0 border border-line bg-white px-3 py-2 text-[13px] text-ink placeholder:text-[#a1a1a1] outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors resize-none dark:bg-[#242527]",
                    compact ? "min-h-16" : "min-h-24"
                )}
            />

            <div className="flex items-center justify-end gap-2">
                {isEdit && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-0 border border-line px-3 py-1.5 text-[11px] font-semibold text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !body.trim()}
                    className="btn-brand min-h-9! px-4! text-[11px]! disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Send className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1.5">
                        {loading ? "Posting..." : isEdit ? "Save" : "Post"}
                    </span>
                </button>
            </div>
        </form>
    )
}