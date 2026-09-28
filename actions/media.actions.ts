// actions/media.actions.ts
"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Joi from "joi"
import {
    listMedia,
    countMedia,
    getMediaById,
    getMediaForPost,
    getMediaStats,
    createMedia,
    updateMedia,
    deleteMedia,
    attachMediaToPost,
    type MediaListFilters,
} from "@/db/queries/media"
import { storage } from "@/lib/media/storage"
import {
    ALLOWED_MIME,
    MAX_UPLOAD_BYTES,
    buildKey,
} from "@/lib/media/upload"

// ---------- Auth ----------

async function getSession() {
    return auth.api.getSession({ headers: await headers() })
}

async function requireAuth() {
    const session = await getSession()
    if (!session?.user) throw new Error("Unauthorized")
    return session
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

// ---------- Reads ----------

export async function listMediaAction(filters: MediaListFilters = {}) {
    const rows = await listMedia(filters)
    return rows.map(toPlain)
}

export async function countMediaAction(
    filters: Omit<MediaListFilters, "limit" | "offset"> = {}
) {
    return countMedia(filters)
}

export async function getMediaByIdAction(id: string) {
    const row = await getMediaById(id)
    return row ? toPlain(row) : null
}

export async function getMediaForPostAction(postId: string) {
    const rows = await getMediaForPost(postId)
    return rows.map(toPlain)
}

export async function getMediaStatsAction(userId?: string) {
    const row = await getMediaStats(userId)
    return row ? toPlain(row) : null
}

// ---------- Upload ----------

export async function uploadMediaAction(formData: FormData) {
    const session = await requireAuth()

    const file = formData.get("file")
    const postId = formData.get("postId")
    const altText = formData.get("altText")

    if (!(file instanceof File)) throw new Error("No file provided")
    if (file.size === 0) throw new Error("File is empty")
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(
            `File too large (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB)`
        )
    }
    if (!ALLOWED_MIME.has(file.type)) {
        throw new Error(`File type not allowed: ${file.type}`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = buildKey(file.name)

    const stored = await storage.put(key, buffer, file.type)

    const id = await createMedia({
        userId: session.user.id,
        postId: typeof postId === "string" && postId ? postId : null,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        width: stored.width ?? null,
        height: stored.height ?? null,
        url: stored.url,
        thumbnailUrl: stored.thumbnailUrl ?? null,
        altText: typeof altText === "string" && altText ? altText : null,
        storageKey: stored.key,
    })

    const row = await getMediaById(id)
    return row ? toPlain(row) : null
}

// ---------- Updates ----------

const updateSchema = Joi.object({
    altText: Joi.string().allow("").max(255).optional(),
    postId: Joi.string().allow(null, "").optional(),
})

export async function updateMediaAction(
    id: string,
    data: { altText?: string; postId?: string | null }
) {
    await requireAuth()
    const { error, value } = updateSchema.validate(data)
    if (error) throw new Error(error.details[0].message)
    return updateMedia(id, value)
}

export async function attachMediaToPostAction(
    mediaId: string,
    postId: string | null
) {
    await requireAuth()
    return attachMediaToPost(mediaId, postId)
}

// ---------- Delete ----------

export async function deleteMediaAction(id: string) {
    await requireAuth()

    const row = await getMediaById(id)
    if (!row) return

    if (row.storage_key) {
        try {
            await storage.delete(row.storage_key)
        } catch {
            // Storage delete failure shouldn't block DB cleanup
        }
    }

    await deleteMedia(id)
}