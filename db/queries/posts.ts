// db/queries/posts.ts
import { database as db } from "@/db/database";

// ---------- Types ----------

export type PostRow = {
    id: string;
    user_id: string;
    category_id: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    cover_image_id: string | null;
    published: number;
    published_at: number | null;
    scheduled_at: number | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    bookmark_count: number;
    review_count: number;
    review_avg: number;
    is_deleted: number;
    deleted_at: number | null;
    created_at: number;
    updated_at: number;
};

export type PostWithRelations = PostRow & {
    category_name: string | null;
    category_slug: string | null;
    author_name: string | null;
    author_image: string | null;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    cover_image_thumb: string | null;
    tags: { id: string; name: string; slug: string }[];
};

// Select fragment reused by every query that returns covers
const COVER_SELECT = `
    cm.url           AS cover_image_url,
    cm.alt_text      AS cover_image_alt,
    cm.thumbnail_url AS cover_image_thumb
`;
const COVER_JOIN = `LEFT JOIN media cm ON cm.id = p.cover_image_id`;

// ---------- Reads: single ----------

export async function getPostById(id: string) {
    const result = await db.execute({
        sql: `SELECT * FROM posts WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as PostRow | undefined) ?? null;
}

export async function getPostBySlug(slug: string) {
    const result = await db.execute({
        sql: `SELECT * FROM posts WHERE slug = ?`,
        args: [slug],
    });
    return (result.rows[0] as unknown as PostRow | undefined) ?? null;
}

export async function getPostWithRelations(id: string): Promise<PostWithRelations | null> {
    const result = await db.execute({
        sql: `
            SELECT
                p.*,
                c.name AS category_name,
                c.slug AS category_slug,
                u.name AS author_name,
                u.image AS author_image,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            ${COVER_JOIN}
            WHERE p.id = ?
        `,
        args: [id],
    });

    const row = result.rows[0] as any;
    if (!row) return null;

    const tags = await getPostTags(id);
    return { ...(row as PostWithRelations), tags };
}

export async function getPostWithRelationsBySlug(slug: string): Promise<PostWithRelations | null> {
    const result = await db.execute({
        sql: `
            SELECT
                p.*,
                c.name AS category_name,
                c.slug AS category_slug,
                u.name AS author_name,
                u.image AS author_image,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            ${COVER_JOIN}
            WHERE p.slug = ?
        `,
        args: [slug],
    });

    const row = result.rows[0] as any;
    if (!row) return null;

    const tags = await getPostTags(row.id);
    return { ...(row as PostWithRelations), tags };
}

export async function getPostTags(postId: string) {
    const result = await db.execute({
        sql: `
            SELECT t.id, t.name, t.slug
            FROM tags t
            JOIN post_tags pt ON pt.tag_id = t.id
            WHERE pt.post_id = ?
            ORDER BY t.name ASC
        `,
        args: [postId],
    });
    return result.rows as unknown as { id: string; name: string; slug: string }[];
}

// ---------- Reads: lists ----------

export type PostListFilters = {
    userId?: string;
    categoryId?: string;
    tagId?: string;
    published?: boolean;
    includeDeleted?: boolean;
    scheduledBefore?: number;
    limit?: number;
    offset?: number;
    orderBy?: "created_at" | "updated_at" | "published_at" | "view_count";
    orderDir?: "asc" | "desc";
};

export async function listPosts(filters: PostListFilters = {}) {
    const {
        userId,
        categoryId,
        tagId,
        published,
        includeDeleted = false,
        scheduledBefore,
        limit = 20,
        offset = 0,
        orderBy = "created_at",
        orderDir = "desc",
    } = filters;

    const where: string[] = [];
    const args: any[] = [];

    if (!includeDeleted) where.push("p.is_deleted = FALSE");
    if (userId) { where.push("p.user_id = ?"); args.push(userId); }
    if (categoryId) { where.push("p.category_id = ?"); args.push(categoryId); }
    if (published !== undefined) { where.push("p.published = ?"); args.push(published ? 1 : 0); }
    if (scheduledBefore !== undefined) {
        where.push("p.scheduled_at IS NOT NULL AND p.scheduled_at <= ?");
        args.push(scheduledBefore);
    }
    if (tagId) {
        where.push("EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ?)");
        args.push(tagId);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const orderSql = `ORDER BY p.${orderBy} ${orderDir.toUpperCase()}`;

    const result = await db.execute({
        sql: `
            SELECT
                p.*,
                c.name AS category_name,
                c.slug AS category_slug,
                u.name AS author_name,
                u.image AS author_image,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            ${COVER_JOIN}
            ${whereSql}
            ${orderSql}
            LIMIT ? OFFSET ?
        `,
        args: [...args, limit, offset],
    });

    return result.rows as unknown as PostWithRelations[];
}

export async function countPosts(filters: PostListFilters = {}) {
    const {
        userId,
        categoryId,
        tagId,
        published,
        includeDeleted = false,
    } = filters;

    const where: string[] = [];
    const args: any[] = [];

    if (!includeDeleted) where.push("p.is_deleted = FALSE");
    if (userId) { where.push("p.user_id = ?"); args.push(userId); }
    if (categoryId) { where.push("p.category_id = ?"); args.push(categoryId); }
    if (published !== undefined) { where.push("p.published = ?"); args.push(published ? 1 : 0); }
    if (tagId) {
        where.push("EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ?)");
        args.push(tagId);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const result = await db.execute({
        sql: `SELECT COUNT(*) AS count FROM posts p ${whereSql}`,
        args,
    });

    return Number((result.rows[0] as any)?.count ?? 0);
}

// ---------- Reads: public listing ----------

export type PublicPostFilters = {
    query?: string;
    categorySlug?: string;
    tagSlug?: string;
    limit?: number;
    offset?: number;
};

export async function listPublishedPosts(filters: PublicPostFilters = {}) {
    const {
        query,
        categorySlug,
        tagSlug,
        limit = 12,
        offset = 0,
    } = filters;

    const where: string[] = ["p.published = TRUE", "p.is_deleted = FALSE"];
    const args: any[] = [];

    if (query) {
        where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)");
        const term = `%${query}%`;
        args.push(term, term, term);
    }
    if (categorySlug) {
        where.push("c.slug = ?");
        args.push(categorySlug);
    }
    if (tagSlug) {
        where.push(
            "EXISTS (SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id AND t.slug = ?)"
        );
        args.push(tagSlug);
    }

    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt, p.published_at,
                p.view_count, p.like_count, p.comment_count, p.bookmark_count,
                p.category_id, p.updated_at,
                c.name AS category_name,
                c.slug AS category_slug,
                u.name AS author_name,
                u.image AS author_image,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            ${COVER_JOIN}
            WHERE ${where.join(" AND ")}
            ORDER BY p.published_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [...args, limit, offset],
    });
    return result.rows;
}

export async function countPublishedPosts(
    filters: Omit<PublicPostFilters, "limit" | "offset"> = {}
) {
    const { query, categorySlug, tagSlug } = filters;
    const where: string[] = ["p.published = TRUE", "p.is_deleted = FALSE"];
    const args: any[] = [];

    if (query) {
        where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)");
        const term = `%${query}%`;
        args.push(term, term, term);
    }
    if (categorySlug) { where.push("c.slug = ?"); args.push(categorySlug); }
    if (tagSlug) {
        where.push(
            "EXISTS (SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id AND t.slug = ?)"
        );
        args.push(tagSlug);
    }

    const result = await db.execute({
        sql: `
            SELECT COUNT(*) AS count
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE ${where.join(" AND ")}
        `,
        args,
    });
    return Number((result.rows[0] as any)?.count ?? 0);
}

// ---------- Reads: aggregations ----------

export async function getPostStats(postId: string) {
    const result = await db.execute({
        sql: `
            SELECT
                p.view_count, p.like_count, p.comment_count,
                p.bookmark_count, p.review_count, p.review_avg
            FROM posts p
            WHERE p.id = ?
        `,
        args: [postId],
    });
    return (result.rows[0] as any) ?? null;
}

export async function getDashboardPostStats(userId?: string) {
    const where = userId ? "WHERE user_id = ? AND is_deleted = FALSE" : "WHERE is_deleted = FALSE";
    const args = userId ? [userId] : [];

    const result = await db.execute({
        sql: `
            SELECT
                COUNT(*)                                              AS total,
                SUM(CASE WHEN published = TRUE THEN 1 ELSE 0 END)     AS published,
                SUM(CASE WHEN published = FALSE THEN 1 ELSE 0 END)    AS drafts,
                SUM(CASE WHEN scheduled_at IS NOT NULL AND published = FALSE THEN 1 ELSE 0 END) AS scheduled,
                COALESCE(SUM(view_count), 0)                          AS views,
                COALESCE(SUM(like_count), 0)                          AS likes,
                COALESCE(SUM(comment_count), 0)                       AS comments,
                COALESCE(SUM(bookmark_count), 0)                      AS bookmarks
            FROM posts
            ${where}
        `,
        args,
    });
    return (result.rows[0] as any) ?? null;
}

export async function getPopularPosts(limit = 10) {
    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt, p.view_count, p.like_count,
                c.name AS category_name, c.slug AS category_slug,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            ${COVER_JOIN}
            WHERE p.published = TRUE AND p.is_deleted = FALSE
            ORDER BY p.view_count DESC, p.published_at DESC
            LIMIT ?
        `,
        args: [limit],
    });
    return result.rows;
}

export async function getRecentPosts(limit = 10) {
    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt, p.published_at,
                u.name AS author_name, u.image AS author_image,
                c.name AS category_name, c.slug AS category_slug,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN user u       ON u.id = p.user_id
            LEFT JOIN categories c ON c.id = p.category_id
            ${COVER_JOIN}
            WHERE p.published = TRUE AND p.is_deleted = FALSE
            ORDER BY p.published_at DESC
            LIMIT ?
        `,
        args: [limit],
    });
    return result.rows;
}

export async function searchPosts(query: string, limit = 20) {
    const term = `%${query.trim()}%`;
    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt,
                c.name AS category_name, c.slug AS category_slug,
                u.name AS author_name,
                ${COVER_SELECT}
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN user u       ON u.id = p.user_id
            ${COVER_JOIN}
            WHERE p.is_deleted = FALSE
              AND (p.title LIKE ? OR p.slug LIKE ? OR p.excerpt LIKE ?)
            ORDER BY p.updated_at DESC
            LIMIT ?
        `,
        args: [term, term, term, limit],
    });
    return result.rows;
}

export async function getRelatedPosts(postId: string, limit = 5) {
    const result = await db.execute({
        sql: `
            SELECT
                p.id, p.title, p.slug, p.excerpt, p.published_at,
                p.view_count, p.like_count, p.comment_count,
                ${COVER_SELECT}
            FROM posts p
            ${COVER_JOIN}
            WHERE p.is_deleted = FALSE
              AND p.published = TRUE
              AND p.id != ?
              AND p.category_id IS NOT NULL
              AND p.category_id = (SELECT category_id FROM posts WHERE id = ?)
            ORDER BY p.published_at DESC
            LIMIT ?
        `,
        args: [postId, postId, limit],
    });
    return result.rows;
}

// ---------- Writes ----------

export async function createPost(data: {
    userId: string;
    categoryId?: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    coverImageId?: string | null;
    published?: boolean;
    scheduledAt?: number | null;
}) {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const published = data.published ? 1 : 0;
    const publishedAt = data.published ? now : null;

    await db.execute({
        sql: `
            INSERT INTO posts (
                id, user_id, category_id, title, slug, content, excerpt,
                cover_image_id, published, published_at, scheduled_at,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            id,
            data.userId,
            data.categoryId || null,
            data.title,
            data.slug,
            data.content,
            data.excerpt || null,
            data.coverImageId || null,
            published,
            publishedAt,
            data.scheduledAt ?? null,
            now,
            now,
        ],
    });

    return id;
}

export async function updatePost(id: string, data: {
    categoryId?: string | null;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    coverImageId?: string | null;
    scheduledAt?: number | null;
}): Promise<boolean> {
    const updates: string[] = [];
    const args: any[] = [];

    if (data.categoryId !== undefined) {
        updates.push("category_id = ?");
        args.push(data.categoryId || null);
    }
    if (data.title !== undefined) {
        updates.push("title = ?");
        args.push(data.title);
    }
    if (data.slug !== undefined) {
        updates.push("slug = ?");
        args.push(data.slug);
    }
    if (data.content !== undefined) {
        updates.push("content = ?");
        args.push(data.content);
    }
    if (data.excerpt !== undefined) {
        updates.push("excerpt = ?");
        args.push(data.excerpt || null);
    }
    if (data.coverImageId !== undefined) {
        updates.push("cover_image_id = ?");
        args.push(data.coverImageId || null);
    }
    if (data.scheduledAt !== undefined) {
        updates.push("scheduled_at = ?");
        args.push(data.scheduledAt ?? null);
    }

    if (updates.length === 0) return false;

    updates.push("updated_at = ?");
    args.push(Math.floor(Date.now() / 1000));
    args.push(id);

    const result = await db.execute({
        sql: `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`,
        args,
    });
    return result.rowsAffected > 0;
}

export async function publishPost(id: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `
            UPDATE posts
            SET published = TRUE,
                published_at = COALESCE(published_at, ?),
                scheduled_at = NULL,
                updated_at = ?
            WHERE id = ?
        `,
        args: [now, now, id],
    });
    return result.rowsAffected > 0;
}

export async function unpublishPost(id: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `UPDATE posts SET published = FALSE, updated_at = ? WHERE id = ?`,
        args: [now, id],
    });
    return result.rowsAffected > 0;
}

export async function softDeletePost(id: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `
            UPDATE posts
            SET is_deleted = TRUE, deleted_at = ?, updated_at = ?
            WHERE id = ?
        `,
        args: [now, now, id],
    });
    return result.rowsAffected > 0;
}

export async function restorePost(id: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `
            UPDATE posts
            SET is_deleted = FALSE, deleted_at = NULL, updated_at = ?
            WHERE id = ?
        `,
        args: [now, id],
    });
    return result.rowsAffected > 0;
}

export async function hardDeletePost(id: string) {
    await db.execute({
        sql: `DELETE FROM posts WHERE id = ?`,
        args: [id],
    });
}

export async function publishDuePosts(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
        sql: `
            UPDATE posts
            SET published = TRUE,
                published_at = ?,
                scheduled_at = NULL,
                updated_at = ?
            WHERE published = FALSE
              AND is_deleted = FALSE
              AND scheduled_at IS NOT NULL
              AND scheduled_at <= ?
        `,
        args: [now, now, now],
    });
    return result.rowsAffected ?? 0;
}

export async function recordView(data: {
    postId: string;
    userId?: string | null;
    ipHash?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
}) {
    const id = crypto.randomUUID();
    await db.execute({
        sql: `
            INSERT INTO post_views (id, post_id, user_id, ip_hash, user_agent, referrer)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            id,
            data.postId,
            data.userId || null,
            data.ipHash || null,
            data.userAgent || null,
            data.referrer || null,
        ],
    });
}