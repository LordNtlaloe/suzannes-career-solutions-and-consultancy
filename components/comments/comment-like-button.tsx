"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import {
    toggleCommentLikeAction,
    hasLikedCommentAction,
} from "@/actions/like.actions"
import { cn } from "@/lib/utils"

type CommentLikeButtonProps = {
    commentId: string
    initialCount: number
    initialLiked?: boolean
    isAuthenticated?: boolean
}

export function CommentLikeButton({
    commentId,
    initialCount,
    initialLiked,
    isAuthenticated,
}: CommentLikeButtonProps) {
    const router = useRouter()
    const [count, setCount] = useState(initialCount)
    const [liked, setLiked] = useState(initialLiked ?? false)
    const [pending, startTransition] = useTransition()

    useEffect(() => {
        if (initialLiked !== undefined) return
        if (!isAuthenticated) return
        let mounted = true
        hasLikedCommentAction(commentId)
            .then((v) => {
                if (mounted) setLiked(v)
            })
            .catch(() => { })
        return () => {
            mounted = false
        }
    }, [commentId, initialLiked, isAuthenticated])

    function handleClick() {
        if (!isAuthenticated) {
            toast.error("Sign in to like comments")
            return
        }
        const next = !liked
        setLiked(next)
        setCount((c) => Math.max(0, c + (next ? 1 : -1)))

        startTransition(async () => {
            try {
                const res = await toggleCommentLikeAction(commentId, !next)
                setLiked(res.liked)
                router.refresh()
            } catch (err: any) {
                setLiked(!next)
                setCount((c) => Math.max(0, c + (next ? -1 : 1)))
                toast.error(err?.message ?? "Failed")
            }
        })
    }

    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center gap-1 h-6 px-2 text-[11px] text-[#a1a1a1] hover:text-blue-dark transition-colors font-semibold",
                liked && "text-red-500 hover:text-red-500"
            )}
            onClick={handleClick}
            disabled={pending}
            aria-pressed={liked}
            aria-label={liked ? "Unlike" : "Like"}
        >
            <Heart className={cn("h-3 w-3", liked && "fill-current")} />
            {count > 0 && (
                <span className="tabular-nums">{count}</span>
            )}
        </button>
    )
}