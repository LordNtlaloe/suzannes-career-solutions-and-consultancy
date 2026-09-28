"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"
import {
    toggleBookmarkAction,
    hasBookmarkedAction,
} from "@/actions/like.actions"
import { cn } from "@/lib/utils"

type BookmarkButtonProps = {
    postId: string
    initialCount: number
    initialBookmarked?: boolean
    isAuthenticated?: boolean
    size?: "sm" | "default" | "lg"
    variant?: "default" | "outline" | "ghost"
    className?: string
    showCount?: boolean
}

export function BookmarkButton({
    postId,
    initialCount,
    initialBookmarked,
    isAuthenticated,
    size = "sm",
    variant = "outline",
    className,
    showCount = true,
}: BookmarkButtonProps) {
    const router = useRouter()
    const [count, setCount] = useState(initialCount)
    const [bookmarked, setBookmarked] = useState(initialBookmarked ?? false)
    const [pending, startTransition] = useTransition()

    useEffect(() => {
        if (initialBookmarked !== undefined) return
        if (!isAuthenticated) return
        let mounted = true
        hasBookmarkedAction(postId)
            .then((v) => {
                if (mounted) setBookmarked(v)
            })
            .catch(() => { })
        return () => {
            mounted = false
        }
    }, [postId, initialBookmarked, isAuthenticated])

    function handleClick(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error("Sign in to save posts")
            return
        }

        const next = !bookmarked
        setBookmarked(next)
        setCount((c) => Math.max(0, c + (next ? 1 : -1)))

        startTransition(async () => {
            try {
                const res = await toggleBookmarkAction(postId)
                setBookmarked(res.bookmarked)
                router.refresh()
            } catch (err: any) {
                setBookmarked(!next)
                setCount((c) => Math.max(0, c + (next ? -1 : 1)))
                toast.error(err?.message ?? "Failed to save")
            }
        })
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            aria-pressed={bookmarked}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors",
                bookmarked && "text-blue-dark border-blue-dark/40",
                className
            )}
        >
            <Bookmark
                className={cn("h-3.5 w-3.5", bookmarked && "fill-current")}
            />
            {showCount && (
                <span className="tabular-nums">{count}</span>
            )}
        </button>
    )
}