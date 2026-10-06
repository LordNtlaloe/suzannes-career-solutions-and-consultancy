// db/queries/step/access.ts
import "server-only";

import { database as db } from "@/db/database";
import type {
    StepEnrolmentWithRelations,
    StepMentoringAssignment,
    StepStaffAssignment,
} from "@/types/step";
import type { StepParticipantIdentity } from "@/lib/step/access-rules";

export async function getParticipantIdentity(
    userId: string,
): Promise<StepParticipantIdentity | null> {
    const result = await db.execute({
        sql: `SELECT id, user_id FROM step_participants WHERE user_id = ?`,
        args: [userId],
    });
    const row = result.rows[0] as unknown as { id: string; user_id: string } | undefined;
    return row ?? null;
}

export async function getEnrolmentsByUserId(
    userId: string,
): Promise<StepEnrolmentWithRelations[]> {
    const result = await db.execute({
        sql: `
            SELECT e.*, cy.name AS cycle_name, c.name AS cohort_name
            FROM step_enrolments e
            LEFT JOIN step_cycles cy ON cy.id = e.cycle_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            LEFT JOIN step_cohorts c ON c.id = cc.cohort_id
            WHERE e.participant_id IN (SELECT id FROM step_participants WHERE user_id = ?)
            ORDER BY e.enrolled_at DESC
        `,
        args: [userId],
    });
    return result.rows as unknown as StepEnrolmentWithRelations[];
}

export async function getActiveStaffAssignments(
    userId: string,
): Promise<StepStaffAssignment[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_staff_assignments WHERE user_id = ? AND active = TRUE`,
        args: [userId],
    });
    return result.rows as unknown as StepStaffAssignment[];
}

export async function getActiveMentorAssignments(
    userId: string,
): Promise<StepMentoringAssignment[]> {
    const result = await db.execute({
        sql: `
            SELECT ma.*
            FROM step_mentoring_assignments ma
            JOIN step_mentors m ON m.id = ma.mentor_id
            WHERE m.user_id = ? AND m.active = TRUE AND ma.status != 'ended'
        `,
        args: [userId],
    });
    return result.rows as unknown as StepMentoringAssignment[];
}
