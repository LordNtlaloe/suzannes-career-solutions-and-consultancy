// lib/db/user-migrations.ts
import "dotenv/config";
import { Kysely, sql } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// ---------- DB client ----------

function makeDb() {
    return new Kysely<any>({
        dialect: new LibsqlDialect({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN,
        }),
    });
}

// ---------- Helpers ----------

async function runSafe(db: Kysely<any>, label: string, statement: string) {
    try {
        await sql.raw(statement).execute(db);
        console.log(`  ✓ ${label}`);
    } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.includes("duplicate column")) {
            console.log(`  · ${label} (already applied)`);
            return;
        }
        throw new Error(`${label} failed: ${msg}`);
    }
}

// ---------- Migration steps ----------

async function addRoleToUsers(db: Kysely<any>) {
    console.log("→ [1/10] user.role");
    await runSafe(
        db,
        "user.role",
        `ALTER TABLE user ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`
    );
}

async function addPostColumns(db: Kysely<any>) {
    console.log("→ [2/10] posts counters & soft-delete columns");

    await runSafe(db, "posts.like_count", `ALTER TABLE posts ADD COLUMN like_count     INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "posts.comment_count", `ALTER TABLE posts ADD COLUMN comment_count  INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "posts.bookmark_count", `ALTER TABLE posts ADD COLUMN bookmark_count INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "posts.review_count", `ALTER TABLE posts ADD COLUMN review_count   INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "posts.review_avg", `ALTER TABLE posts ADD COLUMN review_avg     REAL    NOT NULL DEFAULT 0`);
    await runSafe(db, "posts.cover_image_id", `ALTER TABLE posts ADD COLUMN cover_image_id TEXT`);
    await runSafe(db, "posts.deleted_at", `ALTER TABLE posts ADD COLUMN deleted_at     INTEGER`);
}

async function addCommentColumns(db: Kysely<any>) {
    console.log("→ [3/10] comments depth/path & counters");

    await runSafe(db, "comments.depth", `ALTER TABLE comments ADD COLUMN depth        INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "comments.path", `ALTER TABLE comments ADD COLUMN path         TEXT    NOT NULL DEFAULT ''`);
    await runSafe(db, "comments.like_count", `ALTER TABLE comments ADD COLUMN like_count   INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "comments.reply_count", `ALTER TABLE comments ADD COLUMN reply_count  INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "comments.deleted_at", `ALTER TABLE comments ADD COLUMN deleted_at   INTEGER`);
}

async function addCategoryColumns(db: Kysely<any>) {
    console.log("→ [4/10] categories depth/path & updated_at");

    await runSafe(db, "categories.depth", `ALTER TABLE categories ADD COLUMN depth      INTEGER NOT NULL DEFAULT 0`);
    await runSafe(db, "categories.path", `ALTER TABLE categories ADD COLUMN path       TEXT    NOT NULL DEFAULT ''`);
    await runSafe(db, "categories.updated_at", `ALTER TABLE categories ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
}

async function addAuxiliaryColumns(db: Kysely<any>) {
    console.log("→ [5/10] post_versions, media, post_views");

    await runSafe(db, "post_versions.created_by", `ALTER TABLE post_versions ADD COLUMN created_by TEXT`);
    await runSafe(db, "media.width", `ALTER TABLE media ADD COLUMN width              INTEGER`);
    await runSafe(db, "media.height", `ALTER TABLE media ADD COLUMN height             INTEGER`);
    await runSafe(db, "media.thumbnail_url", `ALTER TABLE media ADD COLUMN thumbnail_url      TEXT`);
    await runSafe(db, "post_views.ip_hash", `ALTER TABLE post_views ADD COLUMN ip_hash       TEXT`);
    await runSafe(db, "post_views.user_agent", `ALTER TABLE post_views ADD COLUMN user_agent    TEXT`);
    await runSafe(db, "post_views.referrer", `ALTER TABLE post_views ADD COLUMN referrer      TEXT`);
}

async function addMediaStorageKey(db: Kysely<any>) {
    console.log("→ [6/10] media.storage_key");
    await runSafe(
        db,
        "media.storage_key",
        `ALTER TABLE media ADD COLUMN storage_key TEXT`
    );
}

async function backfillCounters(db: Kysely<any>) {
    console.log("→ [7/10] backfilling counters & timestamps");

    await sql`
        UPDATE posts SET
            like_count     = (SELECT COUNT(*) FROM likes     WHERE post_id   = posts.id),
            comment_count  = (SELECT COUNT(*) FROM comments  WHERE post_id   = posts.id AND is_deleted = FALSE),
            bookmark_count = (SELECT COUNT(*) FROM bookmarks WHERE post_id   = posts.id),
            review_count   = (SELECT COUNT(*) FROM reviews   WHERE post_id   = posts.id),
            review_avg     = COALESCE((SELECT AVG(rating) FROM reviews WHERE post_id = posts.id), 0)
    `.execute(db);
    console.log("  ✓ posts counters backfilled");

    await sql`
        UPDATE comments SET
            like_count  = (SELECT COUNT(*) FROM likes    WHERE comment_id = comments.id),
            reply_count = (SELECT COUNT(*) FROM comments WHERE parent_id  = comments.id)
    `.execute(db);
    console.log("  ✓ comments counters backfilled");

    await sql`
        UPDATE categories SET updated_at = created_at WHERE updated_at = 0
    `.execute(db);
    console.log("  ✓ categories.updated_at backfilled");
}

async function recreateTriggers(db: Kysely<any>) {
    console.log("→ [8/10] recreating triggers");

    const drops = [
        "trg_likes_post_after_insert",
        "trg_likes_post_after_delete",
        "trg_likes_comment_after_insert",
        "trg_likes_comment_after_delete",
        "trg_comments_after_insert",
        "trg_comments_after_delete",
        "trg_comments_after_soft_delete",
        "trg_comments_after_restore",
        "trg_bookmarks_after_insert",
        "trg_bookmarks_after_delete",
        "trg_reviews_after_insert",
        "trg_reviews_after_update",
        "trg_reviews_after_delete",
        "trg_post_views_after_insert",
    ];
    for (const name of drops) {
        await sql.raw(`DROP TRIGGER IF EXISTS ${name}`).execute(db);
    }

    const triggers: [string, string][] = [
        [
            "trg_likes_post_after_insert",
            `CREATE TRIGGER trg_likes_post_after_insert
             AFTER INSERT ON likes
             WHEN NEW.post_id IS NOT NULL
             BEGIN
                 UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_likes_post_after_delete",
            `CREATE TRIGGER trg_likes_post_after_delete
             AFTER DELETE ON likes
             WHEN OLD.post_id IS NOT NULL
             BEGIN
                 UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = OLD.post_id;
             END`,
        ],
        [
            "trg_likes_comment_after_insert",
            `CREATE TRIGGER trg_likes_comment_after_insert
             AFTER INSERT ON likes
             WHEN NEW.comment_id IS NOT NULL
             BEGIN
                 UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
             END`,
        ],
        [
            "trg_likes_comment_after_delete",
            `CREATE TRIGGER trg_likes_comment_after_delete
             AFTER DELETE ON likes
             WHEN OLD.comment_id IS NOT NULL
             BEGIN
                 UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = OLD.comment_id;
             END`,
        ],
        [
            "trg_comments_after_insert",
            `CREATE TRIGGER trg_comments_after_insert
             AFTER INSERT ON comments
             BEGIN
                 UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
                 UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
             END`,
        ],
        [
            "trg_comments_after_delete",
            `CREATE TRIGGER trg_comments_after_delete
             AFTER DELETE ON comments
             BEGIN
                 UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = OLD.post_id;
                 UPDATE comments SET reply_count = MAX(0, reply_count - 1) WHERE id = OLD.parent_id;
             END`,
        ],
        [
            "trg_comments_after_soft_delete",
            `CREATE TRIGGER trg_comments_after_soft_delete
             AFTER UPDATE OF is_deleted ON comments
             WHEN NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE
             BEGIN
                 UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_comments_after_restore",
            `CREATE TRIGGER trg_comments_after_restore
             AFTER UPDATE OF is_deleted ON comments
             WHEN NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE
             BEGIN
                 UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_bookmarks_after_insert",
            `CREATE TRIGGER trg_bookmarks_after_insert
             AFTER INSERT ON bookmarks
             BEGIN
                 UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_bookmarks_after_delete",
            `CREATE TRIGGER trg_bookmarks_after_delete
             AFTER DELETE ON bookmarks
             BEGIN
                 UPDATE posts SET bookmark_count = MAX(0, bookmark_count - 1) WHERE id = OLD.post_id;
             END`,
        ],
        [
            "trg_reviews_after_insert",
            `CREATE TRIGGER trg_reviews_after_insert
             AFTER INSERT ON reviews
             BEGIN
                 UPDATE posts
                 SET review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
                     review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
                 WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_reviews_after_update",
            `CREATE TRIGGER trg_reviews_after_update
             AFTER UPDATE ON reviews
             BEGIN
                 UPDATE posts
                 SET review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
                     review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
                 WHERE id = NEW.post_id;
             END`,
        ],
        [
            "trg_reviews_after_delete",
            `CREATE TRIGGER trg_reviews_after_delete
             AFTER DELETE ON reviews
             BEGIN
                 UPDATE posts
                 SET review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = OLD.post_id),
                     review_avg   = COALESCE((SELECT AVG(rating) FROM reviews WHERE post_id = OLD.post_id), 0)
                 WHERE id = OLD.post_id;
             END`,
        ],
        [
            "trg_post_views_after_insert",
            `CREATE TRIGGER trg_post_views_after_insert
             AFTER INSERT ON post_views
             BEGIN
                 UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
             END`,
        ],
    ];

    for (const [name, sqlText] of triggers) {
        await sql.raw(sqlText).execute(db);
        console.log(`  ✓ ${name}`);
    }
}

async function rebuildMediaTable(db: Kysely<any>) {
    console.log("→ [9/10] media table (post_id nullable)");

    const info = await sql<{ name: string; notnull: number }>`
        SELECT name, "notnull" FROM pragma_table_info('media')
    `.execute(db);

    if (info.rows.length === 0) {
        console.log("  · media table not found, skipping");
        return;
    }

    const postIdCol = info.rows.find((r) => r.name === "post_id");
    if (!postIdCol) {
        console.log("  · media.post_id missing, skipping");
        return;
    }

    if (postIdCol.notnull === 0) {
        console.log("  · media.post_id already nullable");
        return;
    }

    await sql.raw(`PRAGMA foreign_keys = OFF`).execute(db);

    try {
        await sql.raw(`
            CREATE TABLE media_new (
                id            TEXT PRIMARY KEY,
                post_id       TEXT,
                user_id       TEXT NOT NULL,
                file_name     TEXT NOT NULL,
                file_type     TEXT NOT NULL,
                file_size     INTEGER NOT NULL,
                width         INTEGER,
                height        INTEGER,
                url           TEXT NOT NULL,
                thumbnail_url TEXT,
                alt_text      TEXT,
                storage_key   TEXT,
                created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `).execute(db);
        console.log("  ✓ created media_new");

        const existingCols = new Set(info.rows.map((r) => r.name));
        const required = [
            "id", "post_id", "user_id", "file_name", "file_type",
            "file_size", "url", "alt_text", "created_at",
        ].filter((c) => existingCols.has(c));
        const optional = ["width", "height", "thumbnail_url", "storage_key"].filter(
            (c) => existingCols.has(c)
        );
        const allCols = [...required, ...optional];

        await sql.raw(`
            INSERT INTO media_new (${allCols.join(", ")})
            SELECT ${allCols.join(", ")} FROM media
        `).execute(db);
        console.log(`  ✓ copied ${allCols.length} columns`);

        await sql.raw(`DROP TABLE media`).execute(db);
        await sql.raw(`ALTER TABLE media_new RENAME TO media`).execute(db);
        console.log("  ✓ renamed media_new → media");

        await sql.raw(`CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id)`).execute(db);
        await sql.raw(`CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id)`).execute(db);
        console.log("  ✓ recreated indexes");
    } finally {
        await sql.raw(`PRAGMA foreign_keys = ON`).execute(db);
    }
}

/**
 * One-shot: recompute posts.comment_count from non-deleted comments.
 * Safe to run any time; keeps counters aligned with actual rows.
 */
async function reconcileCommentCounts(db: Kysely<any>) {
    console.log("→ [10/10] reconciling posts.comment_count");

    const result = await sql`
        UPDATE posts SET
            comment_count = (
                SELECT COUNT(*) FROM comments
                WHERE post_id = posts.id AND is_deleted = FALSE
            )
    `.execute(db);
    console.log(`  ✓ reconciled ${result.numAffectedRows ?? "all"} posts`);
}

// ---------- Runner ----------

async function migrate() {
    const db = makeDb();

    try {
        console.log("Running user schema migrations...\n");

        await addRoleToUsers(db);
        await addPostColumns(db);
        await addCommentColumns(db);
        await addCategoryColumns(db);
        await addAuxiliaryColumns(db);
        await addMediaStorageKey(db);
        await backfillCounters(db);
        await recreateTriggers(db);
        await rebuildMediaTable(db);
        await reconcileCommentCounts(db);

        console.log("\n✓ All migrations applied successfully");
        await db.destroy();
        process.exit(0);
    } catch (error: any) {
        console.error("\n✗ Migration failed:", error.message);
        await db.destroy();
        process.exit(1);
    }
}

migrate();