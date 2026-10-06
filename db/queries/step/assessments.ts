// db/queries/step/assessments.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepAssessmentAttempt } from "@/types/step";

export async function listAssessments(cycleId?: string) {
    const result = await db.execute({
        sql: `
            SELECT * FROM step_assessments
            WHERE (? IS NULL OR cycle_id IS NULL OR cycle_id = ?)
            ORDER BY created_at ASC
        `,
        args: [cycleId ?? null, cycleId ?? null],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listAttempts(
    assessmentId: string,
    enrolmentId: string,
): Promise<StepAssessmentAttempt[]> {
    const result = await db.execute({
        sql: `
            SELECT * FROM step_assessment_attempts
            WHERE assessment_id = ? AND enrolment_id = ?
            ORDER BY attempt DESC
        `,
        args: [assessmentId, enrolmentId],
    });
    return result.rows as unknown as StepAssessmentAttempt[];
}

export async function recordAssessmentAttempt(input: {
    id: string;
    assessmentId: string;
    enrolmentId: string;
    attempt: number;
    rubricVersion: string | null;
    status: string;
    score: number | null;
    feedback: string | null;
    assessedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_assessment_attempts (
                id, assessment_id, enrolment_id, attempt, rubric_version,
                status, score, feedback, assessed_by, assessed_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch(), unixepoch())
        `,
        args: [
            input.id,
            input.assessmentId,
            input.enrolmentId,
            input.attempt,
            input.rubricVersion,
            input.status,
            input.score,
            input.feedback,
            input.assessedBy,
        ],
    });
}

export async function getLatestAttempt(
    assessmentId: string,
    enrolmentId: string,
): Promise<StepAssessmentAttempt | null> {
    const result = await db.execute({
        sql: `
            SELECT * FROM step_assessment_attempts
            WHERE assessment_id = ? AND enrolment_id = ?
            ORDER BY attempt DESC LIMIT 1
        `,
        args: [assessmentId, enrolmentId],
    });
    return (result.rows[0] as unknown as StepAssessmentAttempt | undefined) ?? null;
}
