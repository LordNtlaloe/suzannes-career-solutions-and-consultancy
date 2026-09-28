// db/queries/tag.ts
import { database as db } from "@/db/database";

export async function getTagById(id: string) {
    const result = await db.execute({
        sql: "SELECT * FROM tags WHERE id = ?",
        args: [id],
    });
    return result.rows[0] ?? null;
}

export async function getTagBySlug(slug: string) {
    const result = await db.execute({
        sql: "SELECT * FROM tags WHERE slug = ?",
        args: [slug],
    });
    return result.rows[0] ?? null;
}

export async function getAllTags() {
    const result = await db.execute({
        sql: "SELECT * FROM tags ORDER BY name ASC",
        args: [],
    });
    return result.rows;
}

export async function getPostTags(postId: string) {
    const result = await db.execute({
        sql: `
            SELECT t.* FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ?
            ORDER BY t.name ASC
        `,
        args: [postId],
    });
    return result.rows;
}

export async function getTagWithStats(id: string) {
    const result = await db.execute({
        sql: `
            SELECT 
                t.*,
                COUNT(p.id) as post_count
            FROM tags t
            LEFT JOIN post_tags pt ON t.id = pt.tag_id
            LEFT JOIN posts p ON pt.post_id = p.id 
                AND p.published = TRUE AND p.is_deleted = FALSE
            WHERE t.id = ?
            GROUP BY t.id
        `,
        args: [id],
    });
    return result.rows[0] ?? null;
}

export async function getTagsWithPostCounts() {
    const result = await db.execute({
        sql: `
            SELECT 
                t.id,
                t.name,
                t.slug,
                COUNT(p.id) as post_count
            FROM tags t
            LEFT JOIN post_tags pt ON t.id = pt.tag_id
            LEFT JOIN posts p ON pt.post_id = p.id 
                AND p.published = TRUE AND p.is_deleted = FALSE
            GROUP BY t.id
            ORDER BY post_count DESC, t.name ASC
        `,
        args: [],
    });
    return result.rows;
}

export async function createTag(data: { name: string; slug: string }) {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await db.execute({
        sql: `
            INSERT INTO tags (id, name, slug, created_at)
            VALUES (?, ?, ?, ?)
        `,
        args: [id, data.name, data.slug, now],
    });
    return id;
}

export async function updateTag(
    id: string,
    data: { name?: string; slug?: string }
): Promise<boolean> {
    const updates: string[] = [];
    const args: any[] = [];

    if (data.name !== undefined) {
        updates.push("name = ?");
        args.push(data.name);
    }

    if (data.slug !== undefined) {
        updates.push("slug = ?");
        args.push(data.slug);
    }

    if (updates.length === 0) return false;

    args.push(id);

    const result = await db.execute({
        sql: `UPDATE tags SET ${updates.join(", ")} WHERE id = ?`,
        args,
    });
    return result.rowsAffected > 0;
}

export async function deleteTag(id: string) {
    await db.execute({
        sql: "DELETE FROM tags WHERE id = ?",
        args: [id],
    });
}

export async function addTagToPost(postId: string, tagId: string) {
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO post_tags (post_id, tag_id)
            VALUES (?, ?)
        `,
        args: [postId, tagId],
    });
}

export async function removeTagFromPost(postId: string, tagId: string) {
    await db.execute({
        sql: `
            DELETE FROM post_tags 
            WHERE post_id = ? AND tag_id = ?
        `,
        args: [postId, tagId],
    });
}

export async function setPostTags(postId: string, tagIds: string[]) {
    // Transactional replace via batch
    const statements = [
        {
            sql: "DELETE FROM post_tags WHERE post_id = ?",
            args: [postId],
        },
        ...tagIds.map((tagId) => ({
            sql: "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)",
            args: [postId, tagId],
        })),
    ];
    await db.batch(statements, "write");
}

export async function getOrCreateTag(data: { name: string; slug: string }) {
    const existing = await getTagBySlug(data.slug);
    if (existing) {
        return (existing as any).id as string;
    }
    return createTag(data);
}

export async function getTagPostCount(tagId: string) {
    const result = await db.execute({
        sql: `
            SELECT COUNT(DISTINCT p.id) as count FROM posts p
            JOIN post_tags pt ON p.id = pt.post_id
            WHERE pt.tag_id = ? AND p.published = TRUE AND p.is_deleted = FALSE
        `,
        args: [tagId],
    });
    return Number(result.rows[0]?.count || 0);
}

export async function getPopularTags(limit: number = 10) {
    const result = await db.execute({
        sql: `
            SELECT 
                t.id,
                t.name,
                t.slug,
                COUNT(DISTINCT p.id) as post_count
            FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            JOIN posts p ON pt.post_id = p.id 
                AND p.published = TRUE AND p.is_deleted = FALSE
            GROUP BY t.id
            ORDER BY post_count DESC
            LIMIT ?
        `,
        args: [limit],
    });
    return result.rows;
}

export async function searchTags(query: string, limit: number = 10) {
    const searchTerm = `%${query}%`;
    const result = await db.execute({
        sql: `
            SELECT * FROM tags 
            WHERE name LIKE ?
            ORDER BY name ASC
            LIMIT ?
        `,
        args: [searchTerm, limit],
    });
    return result.rows;
}

// db/queries/tag.ts — add this

export async function getTagWithCountBySlug(slug: string) {
    const result = await db.execute({
        sql: `
            SELECT
                t.id,
                t.name,
                t.slug,
                COUNT(DISTINCT p.id) AS post_count
            FROM tags t
            LEFT JOIN post_tags pt ON pt.tag_id = t.id
            LEFT JOIN posts p
                ON p.id = pt.post_id
                AND p.published = TRUE
                AND p.is_deleted = FALSE
            WHERE t.slug = ?
            GROUP BY t.id
            LIMIT 1
        `,
        args: [slug],
    });
    return (result.rows[0] as any) ?? null;
}