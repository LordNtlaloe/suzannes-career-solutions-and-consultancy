import { database } from "@/db/database"

export async function getCategoryById(id: string) {
    const result = await database.execute({
        sql: "SELECT * FROM categories WHERE id = ?",
        args: [id]
    })

    return result.rows[0] ?? null;
}

export async function getCategoryBySlug(slug: string) {
    const result = await database.execute({
        sql: "SELECT * FROM categories WHERE slug = ?",
        args: [slug]
    });

    return result.rows[0] ?? null;
}

export async function getAllCategories() {
    const result = await database.execute({
        sql: "SELECT * FROM categories ORDER BY name ASC",
        args: []
    })

    return result.rows;
}

export async function getTopLevelCategories() {
    const result = await database.execute({
        sql: `SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name ASC`,
        args: []
    })
    return result.rows;
}

export async function getSubcategory(parentId: string) {
    const result = await database.execute({
        sql: `SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC`,
        args: [parentId]
    })
    return result.rows
}

export async function getCategoryWithStats(id: string) {
    const result = await database.execute({
        sql: `
            SELECT 
                c.*,
                COUNT(p.id) as post_count
            FROM categories c
            LEFT JOIN posts p ON c.id = p.category_id 
                AND p.published = TRUE AND p.is_deleted = FALSE
            WHERE c.id = ?
            GROUP BY c.id
        `,
        args: [id],
    });
    return result.rows[0] ?? null;
}

export async function getCategoryHierarchy(parentId: string | null = null) {
    const result = await database.execute({
        sql: `
            SELECT * FROM categories 
            WHERE parent_id IS ?
            ORDER BY name ASC
        `,
        args: [parentId],
    });
    return result.rows;
}

export async function getAllCategoriesWithChildren() {
    // Use the version with post_count so the tree can render counts
    const rows = await getCategoriesWithPostCounts();
    const byId = new Map<string, any>();
    const roots: any[] = [];

    for (const row of rows as any[]) {
        byId.set(row.id, { ...row, children: [] });
    }
    for (const row of rows as any[]) {
        const node = byId.get(row.id)!;
        if (row.parent_id && byId.has(row.parent_id)) {
            byId.get(row.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

export async function createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
}) {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await database.execute({
        sql: `
            INSERT INTO categories (id, name, slug, description, parent_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            id,
            data.name,
            data.slug,
            data.description || null,
            data.parentId || null,
            now,
        ],
    });
    return id;
}

export async function updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string;
}): Promise<boolean> {
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
    if (data.description !== undefined) {
        updates.push("description = ?");
        args.push(data.description);
    }
    if (data.parentId !== undefined) {
        updates.push("parent_id = ?");
        args.push(data.parentId || null);
    }

    if (updates.length === 0) return false;

    args.push(id);

    const result = await database.execute({
        sql: `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
        args,
    });
    return result.rowsAffected > 0;
}

export async function deleteCategory(id: string) {
    await database.execute({
        sql: "DELETE FROM categories WHERE id = ?",
        args: [id],
    });
}

export async function getCategoryPostCount(categoryId: string) {
    const result = await database.execute({
        sql: `
            SELECT COUNT(*) as count FROM posts 
            WHERE category_id = ? AND published = TRUE AND is_deleted = FALSE
        `,
        args: [categoryId],
    });
    return Number(result.rows[0]?.count || 0);
}

export async function getCategoriesWithPostCounts() {
    const result = await database.execute({
        sql: `
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.description,
                c.parent_id,
                COUNT(p.id) as post_count
            FROM categories c
            LEFT JOIN posts p ON c.id = p.category_id 
                AND p.published = TRUE AND p.is_deleted = FALSE
            GROUP BY c.id
            ORDER BY c.name ASC
        `,
        args: [],
    });
    return result.rows;
}

export async function getCategoryPathToRoot(categoryId: string) {
    const result = await database.execute({
        sql: `
            WITH RECURSIVE category_path AS (
                SELECT id, name, slug, parent_id, 1 as depth
                FROM categories
                WHERE id = ?
                
                UNION ALL
                
                SELECT c.id, c.name, c.slug, c.parent_id, cp.depth + 1
                FROM categories c
                JOIN category_path cp ON c.id = cp.parent_id
            )
            SELECT * FROM category_path
            ORDER BY depth DESC
        `,
        args: [categoryId],
    });
    return result.rows;
}