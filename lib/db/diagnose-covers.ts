// scripts/diagnose-covers.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("--- posts with covers ---");
    const a = await db.execute(`
        SELECT id, title, cover_image_id
        FROM posts
        WHERE cover_image_id IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 5
    `);
    console.table(a.rows);

    console.log("--- join check ---");
    const b = await db.execute(`
        SELECT
            p.title,
            p.cover_image_id,
            m.id AS media_id,
            m.url,
            m.thumbnail_url
        FROM posts p
        LEFT JOIN media m ON m.id = p.cover_image_id
        WHERE p.cover_image_id IS NOT NULL
        ORDER BY p.updated_at DESC
        LIMIT 5
    `);
    console.table(b.rows);

    console.log("--- media rows ---");
    const c = await db.execute(`SELECT id, file_name, url FROM media LIMIT 5`);
    console.table(c.rows);

    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});