"use client"

import { useEffect, useRef } from "react"
import { recordViewAction } from "@/actions/post.actions"

type ViewTrackerProps = {
    postId: string
    /** Avoid double-counting within the same session */
    dedupeKey?: string
}

export function ViewTracker({ postId, dedupeKey }: ViewTrackerProps) {
    const fired = useRef(false)

    useEffect(() => {
        if (fired.current) return
        fired.current = true

        const key = dedupeKey ?? `viewed:${postId}`
        try {
            if (sessionStorage.getItem(key)) return
            sessionStorage.setItem(key, "1")
        } catch {
            // sessionStorage may be disabled — proceed anyway
        }

        // Fire and forget. Wrap in setTimeout so it doesn't block paint.
        const id = window.setTimeout(() => {
            recordViewAction({
                postId,
                referrer: document.referrer || null,
                userAgent: navigator.userAgent,
            }).catch(() => {
                // ignore tracking errors silently
            })
        }, 500)

        return () => window.clearTimeout(id)
    }, [postId, dedupeKey])

    return null
}