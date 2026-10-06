// 006_step_audit.mjs
//
// Audit trail and bulk-action support for the admissions workflow:
//  - step_applications.assigned_reviewer: which staff member is handling the
//    application (bulk-assignable), kept separate from reviewed_by.
//  - step_audit_log: one entry per mutated row for bulk operations, so
//    programme staff can see who changed what and when.

async function hasColumn(db, table, column) {
    const info = await db.execute({
        sql: `SELECT name FROM pragma_table_info('${table}')`,
        args: [],
    });
    return info.rows.some((r) => r.name === column);
}

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    if (!(await hasColumn(db, "step_applications", "assigned_reviewer"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN assigned_reviewer TEXT REFERENCES user(id) ON DELETE SET NULL`,
            args: [],
        });
        console.log("  ✓ step_applications.assigned_reviewer");
    }

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_audit_log (
                id TEXT PRIMARY KEY,
                actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
                entity_type TEXT NOT NULL,       -- application | evidence | enrolment | ...
                entity_id TEXT NOT NULL,
                action TEXT NOT NULL,            -- assign_reviewer | mark_under_review | ...
                metadata TEXT,                   -- JSON payload (non-identifying where possible)
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_audit_log_entity ON step_audit_log(entity_type, entity_id)`,
        args: [],
    });
    console.log("  ✓ step_audit_log");
}
