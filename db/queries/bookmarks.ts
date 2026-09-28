// db/queries/bookmarks.ts
import { database as db } from "@/db/database";

export type BookmarkRow = {
    id: string;
    user_id: string;
    post_id: string;
    created_at: number;
};

export async function hasBookmarked(userId: string, postId: string) {
    const result = await db.execute({
        sql: `SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ? LIMIT 1`,
        args: [userId, postId],
    });
    return result.rows.length > 0;
}

export async function listBookmarksForUser(userId: string, limit = 50, offset = 0) {
    const result = await db.execute({
        sql: `
            SELECT
                b.id AS bookmark_id,
                b.created_at AS bookmarked_at,
                p.id, p.title, p.slug, p.excerpt, p.published_at,
                p.view_count, p.like_count, p.comment_count, p.bookmark_count,
                c.name AS category_name, c.slug AS category_slug,
                u.name AS author_name, u.image AS author_image,
                cm.url           AS cover_image_url,
                cm.alt_text      AS cover_image_alt,
                cm.thumbnail_url AS cover_image_thumb
            FROM bookmarks b
            JOIN posts p           ON p.id = b.post_id
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            LEFT JOIN media cm     ON cm.id = p.cover_image_id
            WHERE b.user_id = ?
              AND p.is_deleted = FALSE
              AND p.published = TRUE
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [userId, limit, offset],
    });
    return result.rows;
}

export async function countBookmarksForUser(userId: string) {
    const result = await db.execute({
        sql: `
            SELECT COUNT(*) AS count
            FROM bookmarks b
            JOIN posts p ON p.id = b.post_id
            WHERE b.user_id = ?
              AND p.is_deleted = FALSE
              AND p.published = TRUE
        `,
        args: [userId],
    });
    return Number((result.rows[0] as any)?.count ?? 0);
}

export async function addBookmark(userId: string, postId: string) {
    const id = crypto.randomUUID();
    await db.execute({
        sql: `INSERT OR IGNORE INTO bookmarks (id, user_id, post_id) VALUES (?, ?, ?)`,
        args: [id, userId, postId],
    });
}

export async function removeBookmark(userId: string, postId: string) {
    await db.execute({
        sql: `DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?`,
        args: [userId, postId],
    });
}

export async function toggleBookmark(userId: string, postId: string) {
    const bookmarked = await hasBookmarked(userId, postId);
    if (bookmarked) {
        await removeBookmark(userId, postId);
        return false;
    }
    await addBookmark(userId, postId);
    return true;
}