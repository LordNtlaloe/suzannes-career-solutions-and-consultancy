// actions/profile.actions.ts
"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
    listUserLikedPosts,
    listUserRecentComments,
} from "@/db/queries/profile-activities"

async function requireAuth() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

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

export async function listUserLikedPostsAction(limit = 6) {
    const session = await requireAuth()
    const rows = await listUserLikedPosts(session.user.id, limit)
    return (rows as Record<string, any>[]).map(toPlain)
}

export async function listUserRecentCommentsAction(limit = 6) {
    const session = await requireAuth()
    const rows = await listUserRecentComments(session.user.id, limit)
    return (rows as Record<string, any>[]).map(toPlain)
}