// 007_step_capacity.mjs
//
// Enforce cohort/cycle capacity at the database level so concurrent admissions
// can never exceed a cohort's capacity or a cycle's overall target.
//
// Semantics (deliberate):
//   - cycle_cohort_id set     → limit is step_cycle_cohorts.capacity
//   - cycle_cohort_id NULL    → limit is step_cycles.cohort_size
//   - capacity NULL or 0      → no limit (not yet configured)
//   - re-using an existing (participant, cycle) enrolment is never blocked.

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    await db.execute({
        sql: `
            CREATE TRIGGER IF NOT EXISTS trg_step_enrolments_cohort_capacity
            BEFORE INSERT ON step_enrolments
            WHEN NEW.status = 'enrolled'
              AND NEW.cycle_cohort_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM step_enrolments e2
                  WHERE e2.participant_id = NEW.participant_id
                    AND e2.cycle_id = NEW.cycle_id
              )
              AND (SELECT COALESCE(capacity, 0) FROM step_cycle_cohorts WHERE id = NEW.cycle_cohort_id) > 0
              AND (
                  SELECT COUNT(*) FROM step_enrolments e
                  WHERE e.cycle_cohort_id = NEW.cycle_cohort_id
                    AND e.status = 'enrolled'
              ) >= (SELECT COALESCE(capacity, 0) FROM step_cycle_cohorts WHERE id = NEW.cycle_cohort_id)
            BEGIN
                SELECT RAISE(ABORT, 'cohort capacity reached');
            END
        `,
        args: [],
    });
    console.log("  ✓ trg_step_enrolments_cohort_capacity");

    await db.execute({
        sql: `
            CREATE TRIGGER IF NOT EXISTS trg_step_enrolments_cycle_capacity
            BEFORE INSERT ON step_enrolments
            WHEN NEW.status = 'enrolled'
              AND NEW.cycle_cohort_id IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM step_enrolments e2
                  WHERE e2.participant_id = NEW.participant_id
                    AND e2.cycle_id = NEW.cycle_id
              )
              AND (SELECT COALESCE(cohort_size, 0) FROM step_cycles WHERE id = NEW.cycle_id) > 0
              AND (
                  SELECT COUNT(*) FROM step_enrolments e
                  WHERE e.cycle_id = NEW.cycle_id
                    AND e.status = 'enrolled'
              ) >= (SELECT COALESCE(cohort_size, 0) FROM step_cycles WHERE id = NEW.cycle_id)
            BEGIN
                SELECT RAISE(ABORT, 'cycle capacity reached');
            END
        `,
        args: [],
    });
    console.log("  ✓ trg_step_enrolments_cycle_capacity");
}
