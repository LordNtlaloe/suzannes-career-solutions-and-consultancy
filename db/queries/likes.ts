// db/queries/likes.ts
import { database as db } from "@/db/database";

export type LikeRow = {
    id: string;
    user_id: string;
    post_id: string | null;
    comment_id: string | null;
    created_at: number;
};

// ---------- Reads ----------

export async function hasLikedPost(userId: string, postId: string) {
    const result = await db.execute({
        sql: `SELECT id FROM likes WHERE user_id = ? AND post_id = ? LIMIT 1`,
        args: [userId, postId],
    });
    return result.rows.length > 0;
}

export async function hasLikedComment(userId: string, commentId: string) {
    const result = await db.execute({
        sql: `SELECT id FROM likes WHERE user_id = ? AND comment_id = ? LIMIT 1`,
        args: [userId, commentId],
    });
    return result.rows.length > 0;
}

/**
 * Return the set of post IDs the user has liked from a given list.
 * Used to bulk-hydrate "liked" state on the public posts list.
 */
export async function getLikedPostIds(
    userId: string,
    postIds: string[]
): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const placeholders = postIds.map(() => "?").join(", ");
    const result = await db.execute({
        sql: `
            SELECT post_id FROM likes
            WHERE user_id = ? AND post_id IN (${placeholders})
        `,
        args: [userId, ...postIds],
    });
    return new Set(
        (result.rows as any[])
            .map((r) => r.post_id as string | null)
            .filter((id): id is string => id !== null)
    );
}

export async function getBookmarkedPostIds(
    userId: string,
    postIds: string[]
): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const placeholders = postIds.map(() => "?").join(", ");
    const result = await db.execute({
        sql: `
            SELECT post_id FROM bookmarks
            WHERE user_id = ? AND post_id IN (${placeholders})
        `,
        args: [userId, ...postIds],
    });
    return new Set((result.rows as any[]).map((r) => r.post_id as string));
}

// ---------- Writes ----------

export async function likePost(userId: string, postId: string) {
    const id = crypto.randomUUID();
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO likes (id, user_id, post_id, comment_id)
            VALUES (?, ?, ?, NULL)
        `,
        args: [id, userId, postId],
    });
}

export async function unlikePost(userId: string, postId: string) {
    await db.execute({
        sql: `DELETE FROM likes WHERE user_id = ? AND post_id = ?`,
        args: [userId, postId],
    });
}

export async function likeComment(userId: string, commentId: string) {
    const id = crypto.randomUUID();
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO likes (id, user_id, post_id, comment_id)
            VALUES (?, ?, NULL, ?)
        `,
        args: [id, userId, commentId],
    });
}

export async function unlikeComment(userId: string, commentId: string) {
    await db.execute({
        sql: `DELETE FROM likes WHERE user_id = ? AND comment_id = ?`,
        args: [userId, commentId],
    });
}

/**
 * Toggle a post like. Returns the new state.
 */
export async function togglePostLike(userId: string, postId: string) {
    const liked = await hasLikedPost(userId, postId);
    if (liked) {
        await unlikePost(userId, postId);
        return false;
    }
    await likePost(userId, postId);
    return true;
}