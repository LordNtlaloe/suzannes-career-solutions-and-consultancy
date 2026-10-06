// db/queries/step/enrolments.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepEnrolment } from "@/types/step";

export async function getEnrolmentById(id: string): Promise<StepEnrolment | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_enrolments WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepEnrolment | undefined) ?? null;
}

export async function getEnrolmentsByParticipantId(
    participantId: string,
): Promise<StepEnrolment[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_enrolments WHERE participant_id = ? ORDER BY enrolled_at DESC`,
        args: [participantId],
    });
    return result.rows as unknown as StepEnrolment[];
}

/** Enrolments within a staff scope, with participant names, paginated. */
export async function listEnrolmentsForScope(scope: {
    cycleId?: string | null;
    limit: number;
    offset: number;
}) {
    const conditions: string[] = ["e.status = 'enrolled'"];
    const args: (string | number)[] = [];
    if (scope.cycleId) {
        conditions.push("e.cycle_id = ?");
        args.push(scope.cycleId);
    }
    const result = await db.execute({
        sql: `
            SELECT e.*, p.user_id AS participant_user_id, u.name AS participant_name,
                   cy.name AS cycle_name, c.name AS cohort_name
            FROM step_enrolments e
            JOIN step_participants p ON p.id = e.participant_id
            JOIN user u ON u.id = p.user_id
            LEFT JOIN step_cycles cy ON cy.id = e.cycle_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            LEFT JOIN step_cohorts c ON c.id = cc.cohort_id
            WHERE ${conditions.join(" AND ")}
            ORDER BY e.enrolled_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [...args, scope.limit, scope.offset],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function countEnrolmentsForScope(scope: { cycleId?: string | null }): Promise<number> {
    const result = await db.execute({
        sql: `
            SELECT COUNT(*) AS c FROM step_enrolments e
            WHERE e.status = 'enrolled' ${scope.cycleId ? "AND e.cycle_id = ?" : ""}
        `,
        args: scope.cycleId ? [scope.cycleId] : [],
    });
    return Number(result.rows[0]?.c ?? 0);
}

export async function getParticipantByUser(
    userId: string,
): Promise<{ id: string; user_id: string } | null> {
    const result = await db.execute({
        sql: `SELECT id, user_id FROM step_participants WHERE user_id = ?`,
        args: [userId],
    });
    const row = result.rows[0] as unknown as { id: string; user_id: string } | undefined;
    return row ?? null;
}

/**
 * Admit an application: create or reuse the permanent participant, create the
 * enrolment for the intake, record the admission progression decision and mark
 * the application admitted — all in one atomic batch.
 */
export async function admitApplication(input: {
    applicationId: string;
    userId: string;
    cycleId: string;
    cycleCohortId: string | null;
    pathway: string;
    decidedBy: string;
}): Promise<{ enrolmentId: string; participantId: string }> {
    const enrolmentId = `step_enrol_${input.applicationId.slice(-24)}`;
    const participantId = `step_part_${input.userId}`;
    const decisionId = `step_prog_admit_${input.applicationId.slice(-24)}`;

    let results: { rowsAffected?: number }[];
    try {
        results = (await db.batch(
            [
                {
                    sql: `
                        INSERT INTO step_participants (id, user_id, created_at, updated_at)
                        VALUES (?, ?, unixepoch(), unixepoch())
                        ON CONFLICT(user_id) DO NOTHING
                    `,
                    args: [participantId, input.userId],
                },
                {
                    sql: `
                        INSERT INTO step_enrolments (
                            id, participant_id, cycle_id, cycle_cohort_id, application_id, pathway,
                            level, status, enrolled_at, admitted_at, created_at, updated_at
                        )
                        SELECT ?, p.id, ?, ?, ?, ?, 'registered', 'enrolled',
                               unixepoch(), unixepoch(), unixepoch(), unixepoch()
                        FROM step_participants p
                        WHERE p.user_id = ?
                        ON CONFLICT(participant_id, cycle_id) DO NOTHING
                    `,
                    args: [enrolmentId, input.cycleId, input.cycleCohortId, input.applicationId, input.pathway, input.userId],
                },
                {
                    sql: `
                        INSERT INTO step_progression_decisions (
                            id, participant_id, enrolment_id, from_level, to_level,
                            decision, override_reason, decided_by, decided_at
                        )
                        SELECT ?, p.id, ?, 'none', 'registered', 'approved', NULL, ?, unixepoch()
                        FROM step_participants p
                        WHERE p.user_id = ?
                    `,
                    args: [decisionId, enrolmentId, input.decidedBy, input.userId],
                },
                {
                    sql: `
                        UPDATE step_applications
                        SET status = 'admitted', reviewed_at = unixepoch(), updated_at = unixepoch()
                        WHERE id = ? AND status IN ('submitted', 'under_review')
                    `,
                    args: [input.applicationId],
                },
            ],
            "write",
        )) as { rowsAffected?: number }[];
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("capacity reached")) {
            throw new Error(
                "This intake is at capacity — no further admissions can be made.",
            );
        }
        throw err;
    }

    // Determine whether the enrolment insert actually happened (rowsAffected).
    const enrolResult = results[1] as { rowsAffected?: number };
    if (!enrolResult || !enrolResult.rowsAffected) {
        // Participant already enrolled in this cycle: reuse existing enrolment.
        const existing = await db.execute({
            sql: `
                SELECT e.id FROM step_enrolments e
                JOIN step_participants p ON p.id = e.participant_id
                WHERE p.user_id = ? AND e.cycle_id = ?
            `,
            args: [input.userId, input.cycleId],
        });
        const row = existing.rows[0] as unknown as { id: string } | undefined;
        return { enrolmentId: row?.id ?? enrolmentId, participantId };
    }

    return { enrolmentId, participantId };
}
