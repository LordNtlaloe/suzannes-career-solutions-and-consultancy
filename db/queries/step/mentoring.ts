// db/queries/step/mentoring.ts
import "server-only";

import { database as db } from "@/db/database";

/** Enrolments assigned to a mentor (the only participants they may access). */
export async function listAssignedEnrolments(mentorUserId: string) {
    const result = await db.execute({
        sql: `
            SELECT e.*, p.user_id AS participant_user_id, u.name AS participant_name,
                   cy.name AS cycle_name, c.name AS cohort_name,
                   COALESCE(
                       (SELECT MAX(ev.submitted_at)
                        FROM step_evidence ev
                        JOIN step_learning_assignments la ON la.id = ev.assignment_id
                        WHERE la.enrolment_id = e.id),
                       (SELECT MAX(a.created_at)
                        FROM step_mentoring_attendance a
                        WHERE a.enrolment_id = e.id),
                       (SELECT MAX(da.updated_at)
                        FROM step_development_actions da
                        WHERE da.enrolment_id = e.id),
                       0
                   ) AS last_interaction
            FROM step_mentoring_assignments ma
            JOIN step_mentors m ON m.id = ma.mentor_id
            JOIN step_enrolments e ON e.id = ma.enrolment_id
            JOIN step_participants p ON p.id = e.participant_id
            JOIN user u ON u.id = p.user_id
            LEFT JOIN step_cycles cy ON cy.id = e.cycle_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            LEFT JOIN step_cohorts c ON c.id = cc.cohort_id
            WHERE m.user_id = ? AND m.active = TRUE AND ma.status != 'ended'
            ORDER BY last_interaction DESC, e.enrolled_at DESC
        `,
        args: [mentorUserId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listMentoringSessions(mentorUserId: string) {
    const result = await db.execute({
        sql: `
            SELECT s.*, cy.name AS cycle_name
            FROM step_mentoring_sessions s
            JOIN step_mentors m ON m.id = s.mentor_id
            LEFT JOIN step_cycles cy ON cy.id = s.cycle_id
            WHERE m.user_id = ? AND s.status != 'cancelled'
            ORDER BY s.scheduled_at ASC
        `,
        args: [mentorUserId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

/** Upcoming sessions for a participant's cycle (attendance is per enrolment). */
export async function listUpcomingSessionsForCycle(
    cycleId: string | null,
): Promise<Record<string, unknown>[]> {
    if (!cycleId) return [];
    const result = await db.execute({
        sql: `
            SELECT s.*, u.name AS mentor_name, cy.name AS cycle_name
            FROM step_mentoring_sessions s
            JOIN step_mentors m ON m.id = s.mentor_id
            LEFT JOIN user u ON u.id = m.user_id
            LEFT JOIN step_cycles cy ON cy.id = s.cycle_id
            WHERE s.cycle_id = ?
              AND s.status != 'cancelled'
              AND s.scheduled_at IS NOT NULL
              AND s.scheduled_at >= unixepoch()
            ORDER BY s.scheduled_at ASC
        `,
        args: [cycleId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listDevelopmentActionsForEnrolment(enrolmentId: string) {
    const result = await db.execute({
        sql: `
            SELECT * FROM step_development_actions
            WHERE enrolment_id = ?
            ORDER BY (status = 'open') DESC, due_at ASC
        `,
        args: [enrolmentId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listDevelopmentActionsForMentor(mentorUserId: string) {
    const result = await db.execute({
        sql: `
            SELECT da.*, e.id AS enrolment_id, u.name AS participant_name
            FROM step_development_actions da
            JOIN step_enrolments e ON e.id = da.enrolment_id
            JOIN step_mentoring_assignments ma ON ma.enrolment_id = e.id
            JOIN step_mentors m ON m.id = ma.mentor_id
            JOIN step_participants p ON p.id = e.participant_id
            JOIN user u ON u.id = p.user_id
            WHERE m.user_id = ? AND ma.status != 'ended'
            ORDER BY (da.status = 'open') DESC, da.due_at ASC
        `,
        args: [mentorUserId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function createDevelopmentAction(input: {
    id: string;
    enrolmentId: string;
    title: string;
    dueAt: number | null;
    createdBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_development_actions (id, enrolment_id, title, due_at, status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'open', ?, unixepoch(), unixepoch())
        `,
        args: [input.id, input.enrolmentId, input.title, input.dueAt, input.createdBy],
    });
}

/** A session the mentor owns (or null when it belongs to someone else). */
export async function getSessionForMentor(
    sessionId: string,
    mentorUserId: string,
): Promise<Record<string, unknown> | null> {
    const result = await db.execute({
        sql: `
            SELECT s.*, cy.name AS cycle_name
            FROM step_mentoring_sessions s
            JOIN step_mentors m ON m.id = s.mentor_id
            LEFT JOIN step_cycles cy ON cy.id = s.cycle_id
            WHERE s.id = ? AND m.user_id = ?
        `,
        args: [sessionId, mentorUserId],
    });
    return (result.rows[0] as unknown as Record<string, unknown> | undefined) ?? null;
}

/**
 * The mentor's assigned enrolments with their attendance for a session.
 * Only enrolments assigned to this mentor are ever visible.
 */
export async function listSessionAttendance(
    sessionId: string,
    mentorUserId: string,
): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT
                e.id AS enrolment_id,
                p.id AS participant_id,
                u.name AS participant_name,
                cy.name AS cycle_name,
                c.name AS cohort_name,
                a.id AS attendance_id,
                a.attended,
                a.feedback
            FROM step_mentoring_assignments ma
            JOIN step_mentors m ON m.id = ma.mentor_id
            JOIN step_enrolments e ON e.id = ma.enrolment_id
            JOIN step_participants p ON p.id = e.participant_id
            JOIN user u ON u.id = p.user_id
            LEFT JOIN step_cycles cy ON cy.id = e.cycle_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            LEFT JOIN step_cohorts c ON c.id = cc.cohort_id
            LEFT JOIN step_mentoring_attendance a
                ON a.session_id = ? AND a.enrolment_id = e.id
            WHERE m.user_id = ? AND ma.status != 'ended'
            ORDER BY u.name ASC
        `,
        args: [sessionId, mentorUserId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

/** Upsert attendance for a mentor's own session and assigned enrolment. */
export async function recordAttendance(input: {
    id: string;
    sessionId: string;
    enrolmentId: string;
    attended: boolean;
    feedback: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_mentoring_attendance (id, session_id, enrolment_id, attended, feedback, created_at)
            VALUES (?, ?, ?, ?, ?, unixepoch())
            ON CONFLICT(session_id, enrolment_id) DO UPDATE SET
                attended = excluded.attended,
                feedback = excluded.feedback
        `,
        args: [input.id, input.sessionId, input.enrolmentId, input.attended ? 1 : 0, input.feedback],
    });
}
