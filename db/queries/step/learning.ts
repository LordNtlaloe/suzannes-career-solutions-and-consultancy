// db/queries/step/learning.ts
import "server-only";

import { database as db } from "@/db/database";

export async function listRequirements(cycleId?: string) {
    const result = await db.execute({
        sql: `
            SELECT * FROM step_learning_requirements
            WHERE (? IS NULL OR cycle_id IS NULL OR cycle_id = ?)
            ORDER BY sort_order ASC
        `,
        args: [cycleId ?? null, cycleId ?? null],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function getAssignmentById(id: string) {
    const result = await db.execute({
        sql: `SELECT * FROM step_learning_assignments WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as Record<string, unknown> | undefined) ?? null;
}

export async function getAssignmentDetail(id: string) {
    const result = await db.execute({
        sql: `
            SELECT a.*, r.title, r.description, r.completion_criteria, r.resource_url,
                   r.level, r.required, r.month, a.enrolment_id
            FROM step_learning_assignments a
            JOIN step_learning_requirements r ON r.id = a.requirement_id
            WHERE a.id = ?
        `,
        args: [id],
    });
    return (result.rows[0] as unknown as Record<string, unknown> | undefined) ?? null;
}

export async function listEnrolmentAssignments(enrolmentId: string) {
    const result = await db.execute({
        sql: `
            SELECT a.*, r.title, r.level, r.required, r.completion_criteria, r.month
            FROM step_learning_assignments a
            JOIN step_learning_requirements r ON r.id = a.requirement_id
            WHERE a.enrolment_id = ?
            ORDER BY r.month ASC, r.sort_order ASC
        `,
        args: [enrolmentId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function assignRequirement(input: {
    id: string;
    enrolmentId: string;
    requirementId: string;
    dueAt: number | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_learning_assignments (id, enrolment_id, requirement_id, status, due_at, created_at, updated_at)
            VALUES (?, ?, ?, 'assigned', ?, unixepoch(), unixepoch())
            ON CONFLICT(enrolment_id, requirement_id) DO NOTHING
        `,
        args: [input.id, input.enrolmentId, input.requirementId, input.dueAt],
    });
}

export async function updateAssignmentStatus(
    id: string,
    status: string,
): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_learning_assignments
            SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN unixepoch() ELSE completed_at END,
                updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [status, status, id],
    });
}
