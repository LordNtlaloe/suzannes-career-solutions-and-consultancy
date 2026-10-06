// 001_blog_fixes.mjs
//
// Two non-destructive fixes to existing blog tables:
//
//  1. likes — the table-level UNIQUE(user_id, post_id, comment_id) does not
//     prevent duplicates when one target is NULL (SQLite treats NULLs as
//     distinct). This adds proper partial unique indexes after checking for
//     and removing any existing duplicates.
//
//  2. comments — soft-delete / restore triggers only adjusted
//     posts.comment_count, leaving comments.reply_count counting hidden
//     replies. Triggers are recreated so both counters follow the intended
//     soft-delete behaviour, then both counters are reconciled.

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    // ---------- 1. likes nullable-target uniqueness ----------
    console.log("  · likes uniqueness");

    const postDupes = await db.execute({
        sql: `SELECT COUNT(*) AS c FROM (
                SELECT user_id, post_id FROM likes
                WHERE post_id IS NOT NULL
                GROUP BY user_id, post_id HAVING COUNT(*) > 1
              )`,
        args: [],
    });
    const commentDupes = await db.execute({
        sql: `SELECT COUNT(*) AS c FROM (
                SELECT user_id, comment_id FROM likes
                WHERE comment_id IS NOT NULL
                GROUP BY user_id, comment_id HAVING COUNT(*) > 1
              )`,
        args: [],
    });

    if (Number(postDupes.rows[0]?.c ?? 0) > 0) {
        console.log("  · deduplicating post likes");
        await db.execute({
            sql: `DELETE FROM likes WHERE id IN (
                    SELECT id FROM (
                        SELECT id, ROW_NUMBER() OVER (
                            PARTITION BY user_id, post_id ORDER BY created_at ASC, id ASC
                        ) AS rn
                        FROM likes WHERE post_id IS NOT NULL
                    ) WHERE rn > 1
                  )`,
            args: [],
        });
    }

    if (Number(commentDupes.rows[0]?.c ?? 0) > 0) {
        console.log("  · deduplicating comment likes");
        await db.execute({
            sql: `DELETE FROM likes WHERE id IN (
                    SELECT id FROM (
                        SELECT id, ROW_NUMBER() OVER (
                            PARTITION BY user_id, comment_id ORDER BY created_at ASC, id ASC
                        ) AS rn
                        FROM likes WHERE comment_id IS NOT NULL
                    ) WHERE rn > 1
                  )`,
            args: [],
        });
    }

    await db.execute({
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS uniq_likes_post
              ON likes(user_id, post_id) WHERE post_id IS NOT NULL`,
        args: [],
    });
    await db.execute({
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS uniq_likes_comment
              ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL`,
        args: [],
    });
    console.log("  ✓ partial unique indexes added");

    // ---------- 2. comment counters vs soft-delete ----------
    console.log("  · comment counter triggers");

    for (const name of [
        "trg_comments_after_insert",
        "trg_comments_after_delete",
        "trg_comments_after_soft_delete",
        "trg_comments_after_restore",
    ]) {
        await db.execute({ sql: `DROP TRIGGER IF EXISTS ${name}`, args: [] });
    }

    const triggers = [
        `CREATE TRIGGER trg_comments_after_insert
         AFTER INSERT ON comments
         BEGIN
             UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
             UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
         END`,
        `CREATE TRIGGER trg_comments_after_delete
         AFTER DELETE ON comments
         BEGIN
             UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = OLD.post_id;
             UPDATE comments SET reply_count = MAX(0, reply_count - 1) WHERE id = OLD.parent_id;
         END`,
        `CREATE TRIGGER trg_comments_after_soft_delete
         AFTER UPDATE OF is_deleted ON comments
         WHEN NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE
         BEGIN
             UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = NEW.post_id;
             UPDATE comments SET reply_count = MAX(0, reply_count - 1) WHERE id = NEW.parent_id;
         END`,
        `CREATE TRIGGER trg_comments_after_restore
         AFTER UPDATE OF is_deleted ON comments
         WHEN NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE
         BEGIN
             UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
             UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
         END`,
    ];

    for (const sql of triggers) {
        await db.execute({ sql, args: [] });
    }
    console.log("  ✓ triggers recreated");

    // Reconcile counters so they match rows on disk (guards against drift).
    const info = await db.execute({
        sql: `SELECT name FROM pragma_table_info('comments')`,
        args: [],
    });
    const hasReplyCount = info.rows.some((r) => r.name === "reply_count");

    if (hasReplyCount) {
        await db.execute({
            sql: `UPDATE comments SET reply_count = (
                    SELECT COUNT(*) FROM comments c
                    WHERE c.parent_id = comments.id AND c.is_deleted = FALSE
                  )`,
            args: [],
        });
        console.log("  ✓ comments.reply_count reconciled");
    }

    await db.execute({
        sql: `UPDATE posts SET comment_count = (
                SELECT COUNT(*) FROM comments c
                WHERE c.post_id = posts.id AND c.is_deleted = FALSE
              )`,
        args: [],
    });
    console.log("  ✓ posts.comment_count reconciled");
}
