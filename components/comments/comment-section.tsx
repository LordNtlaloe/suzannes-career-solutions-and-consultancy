"use client"

import { useCallback, useEffect, useState } from "react"
import { MessageSquare, LogIn } from "lucide-react"
import Link from "next/link"
import { CommentForm } from "./comment-form"
import { CommentItem, type CommentNode } from "./comment-item"
import { getPostCommentsAction } from "@/actions/comment.actions"

type CommentSectionProps = {
    postId: string
    initialCount: number
    currentUserId?: string | null
    currentUserRole?: string | null
    isAuthenticated: boolean
}

export function CommentSection({
    postId,
    initialCount,
    currentUserId,
    currentUserRole,
    isAuthenticated,
}: CommentSectionProps) {
    const [comments, setComments] = useState<CommentNode[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const tree = await getPostCommentsAction(postId)
            setComments(tree as unknown as CommentNode[])
        } catch (err) {
            console.error("Failed to load comments", err)
        } finally {
            setLoading(false)
        }
    }, [postId])

    useEffect(() => {
        load()
    }, [load])

    const total = countAll(comments)

    return (
        <section className="flex flex-col gap-6">
            <header className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#a1a1a1]" />
                <h2 className="text-[18px] font-semibold">
                    {total > 0
                        ? `${total} comment${total === 1 ? "" : "s"}`
                        : "Comments"}
                </h2>
            </header>

            {isAuthenticated ? (
                <CommentForm postId={postId} onSuccess={load} />
            ) : (
                <div className="rounded-lg border border-line bg-light/50 p-4 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[13px] text-[#a1a1a1]">
                        Sign in to join the conversation.
                    </p>
                    <Link
                        href="/sign-in"
                        className="btn-brand min-h-9! px-4! text-[11px]!"
                    >
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        Sign in
                    </Link>
                </div>
            )}

            {loading ? (
                <p className="text-[13px] text-[#a1a1a1] py-4">
                    Loading comments...
                </p>
            ) : comments.length === 0 ? (
                <p className="text-[13px] text-[#a1a1a1] py-4">
                    No comments yet. Be the first.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            isAuthenticated={isAuthenticated}
                            onRefresh={load}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

function countAll(nodes: CommentNode[]): number {
    let n = 0
    for (const node of nodes) {
        n += 1
        if (node.children?.length) n += countAll(node.children)
    }
    return n
}