// actions/like.actions.ts
"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
    hasLikedPost,
    hasLikedComment,
    getLikedPostIds,
    getBookmarkedPostIds,
    togglePostLike,
    likeComment,
    unlikeComment,
} from "@/db/queries/likes"
import {
    hasBookmarked,
    listBookmarksForUser,
    countBookmarksForUser,
    toggleBookmark,
} from "@/db/queries/bookmarks"

async function requireAuth() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

async function getSession() {
    return auth.api.getSession({ headers: await headers() })
}

// ---------- Post likes ----------

export async function togglePostLikeAction(postId: string) {
    const session = await requireAuth()
    const liked = await togglePostLike(session.user.id, postId)
    return { liked }
}

export async function hasLikedPostAction(postId: string) {
    const session = await getSession()
    if (!session?.user) return false
    return hasLikedPost(session.user.id, postId)
}

// ---------- Comment likes ----------

export async function toggleCommentLikeAction(commentId: string, currentlyLiked: boolean) {
    const session = await requireAuth()
    if (currentlyLiked) {
        await unlikeComment(session.user.id, commentId)
        return { liked: false }
    }
    await likeComment(session.user.id, commentId)
    return { liked: true }
}

export async function hasLikedCommentAction(commentId: string) {
    const session = await getSession()
    if (!session?.user) return false
    return hasLikedComment(session.user.id, commentId)
}

// ---------- Bulk hydration ----------

export async function getLikedPostIdsAction(postIds: string[]) {
    const session = await getSession()
    if (!session?.user) return []
    const set = await getLikedPostIds(session.user.id, postIds)
    return Array.from(set)
}

export async function getBookmarkedPostIdsAction(postIds: string[]) {
    const session = await getSession()
    if (!session?.user) return []
    const set = await getBookmarkedPostIds(session.user.id, postIds)
    return Array.from(set)
}

// ---------- Post bookmarks ----------

export async function toggleBookmarkAction(postId: string) {
    const session = await requireAuth()
    const bookmarked = await toggleBookmark(session.user.id, postId)
    return { bookmarked }
}

export async function hasBookmarkedAction(postId: string) {
    const session = await getSession()
    if (!session?.user) return false
    return hasBookmarked(session.user.id, postId)
}

export async function listBookmarksAction(limit = 50, offset = 0) {
    const session = await requireAuth()
    const rows = await listBookmarksForUser(session.user.id, limit, offset)
    return rows.map(toPlain)
}

export async function countBookmarksAction() {
    const session = await requireAuth()
    return countBookmarksForUser(session.user.id)
}

// ---------- Serialization ----------

function toPlain<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = {}
    for (const [key, value] of Object.entries(row)) {
        if (typeof value === "bigint") out[key] = Number(value)
        else if (value instanceof Date) out[key] = value.toISOString()
        else if (value === undefined) out[key] = null
        else out[key] = value
    }
    return out as T
}