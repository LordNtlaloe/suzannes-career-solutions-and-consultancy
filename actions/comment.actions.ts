// actions/comment.actions.ts
"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Joi from "joi"
import {
    listCommentsForPost,
    buildCommentTree,
    getCommentById,
    countCommentsForPost,
    listComments,
    countComments,
    createComment,
    updateComment,
    softDeleteComment,
    hardDeleteComment,
    type CommentListFilters,
} from "@/db/queries/comments"
import { getPostById } from "@/db/queries/posts"

// ---------- Auth ----------

async function getSession() {
    return auth.api.getSession({ headers: await headers() })
}

async function requireAuth() {
    const session = await getSession()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

async function requireStaff() {
    const session = await getSession()
    if (
        !session?.user?.role ||
        !["admin", "moderator"].includes(session.user.role)
    ) {
        throw new Error("Unauthorized")
    }
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

function toPlainArray<T extends Record<string, any>>(rows: T[]): T[] {
    return rows.map(toPlain)
}

function serializeTree(nodes: any[]): any[] {
    return nodes.map((n) => ({
        ...toPlain(n),
        children: n.children?.length ? serializeTree(n.children) : [],
    }))
}

// ---------- Validation ----------

const createCommentSchema = Joi.object({
    postId: Joi.string().required(),
    parentId: Joi.string().allow(null, "").optional(),
    body: Joi.string().required().min(1).max(5000).messages({
        "string.empty": "Comment cannot be empty",
        "string.max": "Comment must be under 5000 characters",
    }),
})

const updateCommentSchema = Joi.object({
    body: Joi.string().required().min(1).max(5000),
})

// ---------- Reads ----------

/**
 * Fetch a post's comments as a threaded tree, ready for rendering.
 * `includeDeleted` is only honored for staff.
 */
export async function getPostCommentsAction(
    postId: string,
    opts: { includeDeleted?: boolean } = {}
) {
    const session = await getSession()
    const isStaff =
        session?.user?.role === "admin" || session?.user?.role === "moderator"

    const rows = await listCommentsForPost(postId, {
        includeDeleted: isStaff && opts.includeDeleted,
    })
    const tree = buildCommentTree(rows as any)
    return serializeTree(tree)
}

export async function countPostCommentsAction(postId: string) {
    return countCommentsForPost(postId)
}

export async function listCommentsAction(filters: CommentListFilters = {}) {
    const rows = await listComments(filters)
    return toPlainArray(rows as Record<string, any>[])
}

export async function countCommentsAction(
    filters: Omit<CommentListFilters, "limit" | "offset"> = {}
) {
    return countComments(filters)
}

export async function getCommentByIdAction(id: string) {
    const row = await getCommentById(id)
    return row ? toPlain(row) : null
}

// ---------- Writes ----------

export async function createCommentAction(data: {
    postId: string
    parentId?: string | null
    body: string
}) {
    const session = await requireAuth()

    const { error, value } = createCommentSchema.validate(data)
    if (error) throw new Error(error.details[0].message)

    // Verify the post exists and is visible
    const post = await getPostById(value.postId)
    if (!post) throw new Error("Post not found")
    if (post.is_deleted && session.user.role !== "admin") {
        throw new Error("Cannot comment on a deleted post")
    }
    if (!post.published && post.user_id !== session.user.id && session.user.role !== "admin") {
        throw new Error("Cannot comment on an unpublished post")
    }

    // If replying, ensure parent belongs to the same post
    if (value.parentId) {
        const parent = await getCommentById(value.parentId)
        if (!parent || parent.post_id !== value.postId) {
            throw new Error("Invalid parent comment")
        }
    }

    const id = await createComment({
        postId: value.postId,
        userId: session.user.id,
        parentId: value.parentId || null,
        body: value.body,
    })

    return id
}

export async function updateCommentAction(id: string, body: string) {
    const session = await requireAuth()
    const { error, value } = updateCommentSchema.validate({ body })
    if (error) throw new Error(error.details[0].message)

    const comment = await getCommentById(id)
    if (!comment) throw new Error("Comment not found")

    const isOwner = comment.user_id === session.user.id
    const isStaff =
        session.user.role === "admin" || session.user.role === "moderator"
    if (!isOwner && !isStaff) throw new Error("Forbidden")

    return updateComment(id, value.body)
}

export async function deleteCommentAction(id: string) {
    const session = await requireAuth()

    const comment = await getCommentById(id)
    if (!comment) return

    const isOwner = comment.user_id === session.user.id
    const isStaff =
        session.user.role === "admin" || session.user.role === "moderator"
    if (!isOwner && !isStaff) throw new Error("Forbidden")

    return softDeleteComment(id)
}

export async function hardDeleteCommentAction(id: string) {
    await requireStaff()
    await hardDeleteComment(id)
}