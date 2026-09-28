"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { togglePostLikeAction, hasLikedPostAction } from "@/actions/like.actions"
import { cn } from "@/lib/utils"

type LikeButtonProps = {
    postId: string
    initialCount: number
    initialLiked?: boolean
    isAuthenticated?: boolean
    size?: "sm" | "default" | "lg"
    variant?: "default" | "outline" | "ghost"
    className?: string
    showCount?: boolean
}

export function LikeButton({
    postId,
    initialCount,
    initialLiked,
    isAuthenticated,
    size = "sm",
    variant = "outline",
    className,
    showCount = true,
}: LikeButtonProps) {
    const router = useRouter()
    const [count, setCount] = useState(initialCount)
    const [liked, setLiked] = useState(initialLiked ?? false)
    const [pending, startTransition] = useTransition()

    // Hydrate the liked state if not provided and user is authed
    useEffect(() => {
        if (initialLiked !== undefined) return
        if (!isAuthenticated) return
        let mounted = true
        hasLikedPostAction(postId)
            .then((v) => {
                if (mounted) setLiked(v)
            })
            .catch(() => { })
        return () => {
            mounted = false
        }
    }, [postId, initialLiked, isAuthenticated])

    function handleClick(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error("Sign in to like posts")
            return
        }

        // Optimistic
        const nextLiked = !liked
        setLiked(nextLiked)
        setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))

        startTransition(async () => {
            try {
                const res = await togglePostLikeAction(postId)
                // Sync from server in case of drift
                setLiked(res.liked)
                router.refresh()
            } catch (err: any) {
                // Roll back
                setLiked(!nextLiked)
                setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)))
                toast.error(err?.message ?? "Failed to like")
            }
        })
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            aria-pressed={liked}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors",
                liked && "text-red-500 border-red-500/40 hover:text-red-500",
                className
            )}
        >
            <Heart
                className={cn(
                    "h-3.5 w-3.5",
                    liked && "fill-current"
                )}
            />
            {showCount && (
                <span className="tabular-nums">{count}</span>
            )}
        </button>
    )
}