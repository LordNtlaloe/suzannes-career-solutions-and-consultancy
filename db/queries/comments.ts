// db/queries/comments.ts
import { database as db } from "@/db/database";

export type CommentRow = {
    id: string;
    post_id: string;
    user_id: string;
    parent_id: string | null;
    body: string;
    depth: number;
    path: string;
    like_count: number;
    reply_count: number;
    is_deleted: boolean | number;
    deleted_at: number | null;
    created_at: number;
    updated_at: number;
};

export type CommentWithAuthor = CommentRow & {
    author_name: string | null;
    author_image: string | null;
};

export type ThreadedComment = CommentWithAuthor & {
    children: ThreadedComment[];
};

// ---------- Reads ----------

/**
 * Fetch all comments for a post, flat, with author joined.
 * Caller builds the tree.
 */
export async function listCommentsForPost(
    postId: string,
    opts: { includeDeleted?: boolean } = {}
): Promise<CommentWithAuthor[]> {
    const where = ["c.post_id = ?"];
    const args: any[] = [postId];

    if (!opts.includeDeleted) {
        where.push("c.is_deleted = FALSE");
    }

    const result = await db.execute({
        sql: `
            SELECT
                c.*,
                u.name  AS author_name,
                u.image AS author_image
            FROM comments c
            LEFT JOIN user u ON u.id = c.user_id
            WHERE ${where.join(" AND ")}
            ORDER BY c.created_at ASC
        `,
        args,
    });

    return result.rows as unknown as CommentWithAuthor[];
}

/**
 * Build a nested tree from a flat list in O(n).
 */
export function buildCommentTree(
    comments: CommentWithAuthor[]
): ThreadedComment[] {
    const byId = new Map<string, ThreadedComment>();
    const roots: ThreadedComment[] = [];

    for (const c of comments) {
        byId.set(c.id, { ...c, children: [] });
    }
    for (const c of comments) {
        const node = byId.get(c.id)!;
        if (c.parent_id && byId.has(c.parent_id)) {
            byId.get(c.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

export async function getCommentById(id: string) {
    const result = await db.execute({
        sql: `
            SELECT
                c.*,
                u.name  AS author_name,
                u.image AS author_image
            FROM comments c
            LEFT JOIN user u ON u.id = c.user_id
            WHERE c.id = ?
        `,
        args: [id],
    });
    return (result.rows[0] as unknown as CommentWithAuthor | undefined) ?? null;
}

export async function countCommentsForPost(
    postId: string,
    opts: { includeDeleted?: boolean } = {}
) {
    const where = ["post_id = ?"];
    const args: any[] = [postId];
    if (!opts.includeDeleted) where.push("is_deleted = FALSE");

    const result = await db.execute({
        sql: `SELECT COUNT(*) AS count FROM comments WHERE ${where.join(" AND ")}`,
        args,
    });
    return Number((result.rows[0] as any)?.count ?? 0);
}

/**
 * Dashboard listing — flat, newest first, optional filters.
 */
export type CommentListFilters = {
    postId?: string;
    userId?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
};

export async function listComments(filters: CommentListFilters = {}) {
    const {
        postId,
        userId,
        includeDeleted = false,
        limit = 50,
        offset = 0,
    } = filters;

    const where: string[] = [];
    const args: any[] = [];

    if (!includeDeleted) where.push("c.is_deleted = FALSE");
    if (postId) { where.push("c.post_id = ?"); args.push(postId); }
    if (userId) { where.push("c.user_id = ?"); args.push(userId); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await db.execute({
        sql: `
            SELECT
                c.*,
                u.name  AS author_name,
                u.image AS author_image,
                p.title AS post_title,
                p.slug  AS post_slug
            FROM comments c
            LEFT JOIN user  u ON u.id = c.user_id
            LEFT JOIN posts p ON p.id = c.post_id
            ${whereSql}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [...args, limit, offset],
    });
    return result.rows;
}

export async function countComments(
    filters: Omit<CommentListFilters, "limit" | "offset"> = {}
) {
    const { postId, userId, includeDeleted = false } = filters;
    const where: string[] = [];
    const args: any[] = [];

    if (!includeDeleted) where.push("is_deleted = FALSE");
    if (postId) { where.push("post_id = ?"); args.push(postId); }
    if (userId) { where.push("user_id = ?"); args.push(userId); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await db.execute({
        sql: `SELECT COUNT(*) AS count FROM comments ${whereSql}`,
        args,
    });
    return Number((result.rows[0] as any)?.count ?? 0);
}

/**
 * Compute depth + materialized path for a new comment.
 */
export async function computeDepthAndPath(parentId: string | null) {
    if (!parentId) {
        return { depth: 0, path: "" };
    }
    const parent = await getCommentById(parentId);
    if (!parent) {
        throw new Error("Parent comment not found");
    }
    return {
        depth: parent.depth + 1,
        path: `${parent.path}${parent.id}/`,
    };
}

// ---------- Writes ----------

export async function createComment(data: {
    postId: string;
    userId: string;
    parentId?: string | null;
    body: string;
}) {
    const { depth, path } = await computeDepthAndPath(data.parentId ?? null);
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await db.execute({
        sql: `
            INSERT INTO comments (
                id, post_id, user_id, parent_id, body, depth, path,
                like_count, reply_count, is_deleted, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, FALSE, ?, ?)
        `,
        args: [
            id,
            data.postId,
            data.userId,
            data.parentId ?? null,
            data.body,
            depth,
            path,
            now,
            now,
        ],
    });

    // Comment counter triggers on `comments` already keep posts.comment_count
    // in sync — nothing more to do here.

    return id;
}

export async function updateComment(
    id: string,
    body: string
): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `UPDATE comments SET body = ?, updated_at = ? WHERE id = ? AND is_deleted = FALSE`,
        args: [body, now, id],
    });
    return result.rowsAffected > 0;
}

export async function softDeleteComment(id: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `
            UPDATE comments
            SET is_deleted = TRUE, deleted_at = ?, updated_at = ?
            WHERE id = ?
        `,
        args: [now, now, id],
    });
    return result.rowsAffected > 0;
}

export async function hardDeleteComment(id: string) {
    await db.execute({
        sql: `DELETE FROM comments WHERE id = ?`,
        args: [id],
    });
}

/**
 * Post author / moderator helper — bulk soft-delete everything on a post.
 */
export async function softDeleteAllCommentsForPost(postId: string) {
    const now = Math.floor(Date.now() / 1000);
    await db.execute({
        sql: `
            UPDATE comments
            SET is_deleted = TRUE, deleted_at = ?, updated_at = ?
            WHERE post_id = ? AND is_deleted = FALSE
        `,
        args: [now, now, postId],
    });
}