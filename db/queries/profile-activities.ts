// db/queries/profile-activities.ts
import { database as db } from "@/db/database"

const COVER_SELECT = `
    cm.url           AS cover_image_url,
    cm.alt_text      AS cover_image_alt,
    cm.thumbnail_url AS cover_image_thumb
`
const COVER_JOIN = `LEFT JOIN media cm ON cm.id = p.cover_image_id`

export type ProfilePostRow = {
    id: string
    title: string
    slug: string
    excerpt: string | null
    published_at: number | null
    published: number
    is_deleted: number
    view_count: number
    like_count: number
    comment_count: number
    cover_image_url: string | null
    cover_image_alt: string | null
    cover_image_thumb: string | null
    category_name: string | null
    liked_at?: number
}

export type ProfileCommentRow = {
    id: string
    body: string
    created_at: number
    post_id: string
    post_title: string
    post_slug: string
    published: number
    is_deleted: number
}

export async function listUserLikedPosts(
    userId: string,
    limit = 6
): Promise<ProfilePostRow[]> {
    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt, p.published_at,
                p.published, p.is_deleted,
                p.view_count, p.like_count, p.comment_count,
                c.name AS category_name,
                l.created_at AS liked_at,
                ${COVER_SELECT}
            FROM likes l
            JOIN posts p           ON p.id = l.post_id
            LEFT JOIN categories c ON c.id = p.category_id
            ${COVER_JOIN}
            WHERE l.user_id = ?
              AND l.post_id IS NOT NULL
              AND p.is_deleted = FALSE
            ORDER BY l.created_at DESC
            LIMIT ?
        `,
        args: [userId, limit],
    })
    return result.rows as unknown as ProfilePostRow[]
}

export async function listUserRecentComments(
    userId: string,
    limit = 6
): Promise<ProfileCommentRow[]> {
    const result = await db.execute({
        sql: `
            SELECT
                c.id, c.body, c.created_at,
                c.post_id,
                p.title AS post_title,
                p.slug  AS post_slug,
                p.published, p.is_deleted
            FROM comments c
            JOIN posts p ON p.id = c.post_id
            WHERE c.user_id = ?
              AND c.is_deleted = FALSE
              AND p.is_deleted = FALSE
            ORDER BY c.created_at DESC
            LIMIT ?
        `,
        args: [userId, limit],
    })
    return result.rows as unknown as ProfileCommentRow[]
}