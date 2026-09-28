// db/queries/media.ts
import { database as db } from "@/db/database";

export type MediaRow = {
    id: string;
    post_id: string | null;
    user_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    width: number | null;
    height: number | null;
    url: string;
    thumbnail_url: string | null;
    alt_text: string | null;
    storage_key: string | null;
    created_at: number;
};

export type MediaListFilters = {
    userId?: string;
    postId?: string;
    type?: "image" | "video" | "document" | "all";
    search?: string;
    limit?: number;
    offset?: number;
};

// ---------- List ----------

export async function listMedia(filters: MediaListFilters = {}) {
    const {
        userId,
        postId,
        type,
        search,
        limit = 60,
        offset = 0,
    } = filters;

    const where: string[] = [];
    const args: any[] = [];

    if (userId) { where.push("user_id = ?"); args.push(userId); }
    if (postId) { where.push("post_id = ?"); args.push(postId); }

    if (type && type !== "all") {
        if (type === "image") {
            where.push("file_type LIKE ?");
            args.push("image/%");
        } else if (type === "video") {
            where.push("file_type LIKE ?");
            args.push("video/%");
        } else if (type === "document") {
            where.push(
                "(file_type = 'application/pdf' OR file_type LIKE 'application/%')"
            );
        }
    }

    if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        where.push("(file_name LIKE ? OR alt_text LIKE ?)");
        args.push(term, term);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await db.execute({
        sql: `
            SELECT * FROM media
            ${whereSql}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [...args, limit, offset],
    });

    return result.rows as unknown as MediaRow[];
}

export async function countMedia(
    filters: Omit<MediaListFilters, "limit" | "offset"> = {}
) {
    const { userId, postId, type, search } = filters;

    const where: string[] = [];
    const args: any[] = [];

    if (userId) { where.push("user_id = ?"); args.push(userId); }
    if (postId) { where.push("post_id = ?"); args.push(postId); }

    if (type && type !== "all") {
        if (type === "image") {
            where.push("file_type LIKE ?");
            args.push("image/%");
        } else if (type === "video") {
            where.push("file_type LIKE ?");
            args.push("video/%");
        } else if (type === "document") {
            where.push(
                "(file_type = 'application/pdf' OR file_type LIKE 'application/%')"
            );
        }
    }

    if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        where.push("(file_name LIKE ? OR alt_text LIKE ?)");
        args.push(term, term);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await db.execute({
        sql: `SELECT COUNT(*) AS count FROM media ${whereSql}`,
        args,
    });

    return Number((result.rows[0] as any)?.count ?? 0);
}

// ---------- Single ----------

export async function getMediaById(id: string) {
    const result = await db.execute({
        sql: `SELECT * FROM media WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as MediaRow | undefined) ?? null;
}

export async function getMediaForPost(postId: string) {
    const result = await db.execute({
        sql: `SELECT * FROM media WHERE post_id = ? ORDER BY created_at DESC`,
        args: [postId],
    });
    return result.rows as unknown as MediaRow[];
}

// ---------- Aggregations ----------

export async function getMediaStats(userId?: string) {
    const where = userId ? "WHERE user_id = ?" : "";
    const args = userId ? [userId] : [];

    const result = await db.execute({
        sql: `
            SELECT
                COUNT(*)                                                           AS total,
                COALESCE(SUM(file_size), 0)                                        AS total_bytes,
                SUM(CASE WHEN file_type LIKE 'image/%' THEN 1 ELSE 0 END)          AS images,
                SUM(CASE WHEN file_type LIKE 'video/%' THEN 1 ELSE 0 END)          AS videos,
                SUM(CASE WHEN file_type LIKE 'application/%' THEN 1 ELSE 0 END)    AS documents
            FROM media
            ${where}
        `,
        args,
    });

    return (result.rows[0] as any) ?? null;
}

// ---------- Writes ----------

export async function createMedia(data: {
    userId: string;
    postId?: string | null;
    fileName: string;
    fileType: string;
    fileSize: number;
    width?: number | null;
    height?: number | null;
    url: string;
    thumbnailUrl?: string | null;
    altText?: string | null;
    storageKey?: string | null;
}) {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await db.execute({
        sql: `
            INSERT INTO media (
                id, post_id, user_id, file_name, file_type, file_size,
                width, height, url, thumbnail_url, alt_text, storage_key, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            id,
            data.postId ?? null,
            data.userId,
            data.fileName,
            data.fileType,
            data.fileSize,
            data.width ?? null,
            data.height ?? null,
            data.url,
            data.thumbnailUrl ?? null,
            data.altText ?? null,
            data.storageKey ?? null,
            now,
        ],
    });

    return id;
}

export async function updateMedia(
    id: string,
    data: { altText?: string | null; postId?: string | null }
): Promise<boolean> {
    const updates: string[] = [];
    const args: any[] = [];

    if (data.altText !== undefined) {
        updates.push("alt_text = ?");
        args.push(data.altText || null);
    }
    if (data.postId !== undefined) {
        updates.push("post_id = ?");
        args.push(data.postId || null);
    }

    if (updates.length === 0) return false;

    args.push(id);

    const result = await db.execute({
        sql: `UPDATE media SET ${updates.join(", ")} WHERE id = ?`,
        args,
    });
    return result.rowsAffected > 0;
}

export async function deleteMedia(id: string) {
    await db.execute({
        sql: `DELETE FROM media WHERE id = ?`,
        args: [id],
    });
}

export async function attachMediaToPost(mediaId: string, postId: string | null) {
    await db.execute({
        sql: `UPDATE media SET post_id = ? WHERE id = ?`,
        args: [postId, mediaId],
    });
}