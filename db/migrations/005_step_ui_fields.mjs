// 005_step_ui_fields.mjs
//
// Columns the STEP frontend needs:
//  - step_applications.feedback: participant-visible feedback, kept separate
//    from the private review_note.
//  - step_learning_requirements.resource_url: course/resource link shown on
//    assignment detail pages.

async function hasColumn(db, table, column) {
    const info = await db.execute({
        sql: `SELECT name FROM pragma_table_info('${table}')`,
        args: [],
    });
    return info.rows.some((r) => r.name === column);
}

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    if (!(await hasColumn(db, "step_applications", "feedback"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN feedback TEXT`,
            args: [],
        });
        console.log("  ✓ step_applications.feedback");
    }

    if (!(await hasColumn(db, "step_learning_requirements", "resource_url"))) {
        await db.execute({
            sql: `ALTER TABLE step_learning_requirements ADD COLUMN resource_url TEXT`,
            args: [],
        });
        console.log("  ✓ step_learning_requirements.resource_url");
    }
}
