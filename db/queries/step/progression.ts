// db/queries/step/progression.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepProgressionDecision } from "@/types/step";
import { getEnrolmentById } from "@/db/queries/step/enrolments";

/**
 * Detailed unmet-readiness view for an enrolment: which required requirements
 * and assessments still stand between the enrolment and `toLevel`.
 */
export async function getReadinessRequirements(enrolmentId: string, toLevel: string) {
    const enrolment = await getEnrolmentById(enrolmentId);
    if (!enrolment) return { requirements: [], assessments: [] };

    let cohortId: string | null = null;
    if (enrolment.cycle_cohort_id) {
        const cc = await db.execute({
            sql: `SELECT cohort_id FROM step_cycle_cohorts WHERE id = ?`,
            args: [enrolment.cycle_cohort_id],
        });
        cohortId = (cc.rows[0] as { cohort_id?: string } | undefined)?.cohort_id ?? null;
    }

    const requirements = await db.execute({
        sql: `
            SELECT r.*, a.id AS assignment_id, a.status AS assignment_status
            FROM step_learning_requirements r
            LEFT JOIN step_learning_assignments a
                ON a.requirement_id = r.id AND a.enrolment_id = ?
            WHERE r.required = TRUE
              AND r.level = ?
              AND (r.cycle_id IS NULL OR r.cycle_id = ?)
              AND (r.cohort_id IS NULL OR r.cohort_id IS ?)
            ORDER BY r.sort_order ASC
        `,
        args: [enrolmentId, toLevel, enrolment.cycle_id, cohortId],
    });

    const requiresAssessments = ["pathway_ready", "opportunity_ready", "graduate"].includes(toLevel);
    const assessments = requiresAssessments
        ? await db.execute({
              sql: `
                  SELECT s.*, (
                      SELECT aa.status FROM step_assessment_attempts aa
                      WHERE aa.assessment_id = s.id AND aa.enrolment_id = ?
                      ORDER BY aa.attempt DESC LIMIT 1
                  ) AS latest_status
                  FROM step_assessments s
                  WHERE s.required = TRUE
                    AND (s.cycle_id IS NULL OR s.cycle_id = ?)
                  ORDER BY s.created_at ASC
              `,
              args: [enrolmentId, enrolment.cycle_id],
          })
        : { rows: [] };

    return {
        requirements: requirements.rows as unknown as Record<string, unknown>[],
        assessments: assessments.rows as unknown as Record<string, unknown>[],
    };
}

export async function countIncompleteRequirements(
    enrolmentId: string,
    toLevel: string,
): Promise<number> {
    const { requirements, assessments } = await getReadinessRequirements(
        enrolmentId,
        toLevel,
    );

    const unmetRequirements = requirements.filter(
        (r) => !["completed", "waived"].includes(String(r.assignment_status ?? "")),
    ).length;

    const unmetAssessments = assessments.filter(
        (a) => String(a.latest_status ?? "") !== "passed",
    ).length;

    return unmetRequirements + unmetAssessments;
}

export async function listProgressionDecisions(
    participantId: string,
): Promise<StepProgressionDecision[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_progression_decisions WHERE participant_id = ? ORDER BY decided_at DESC`,
        args: [participantId],
    });
    return result.rows as unknown as StepProgressionDecision[];
}

export type ProgressionDecisionInput = {
    id: string;
    participantId: string;
    enrolmentId: string;
    fromLevel: string;
    toLevel: string;
    decision: "approved" | "denied" | "override";
    overrideReason: string | null;
    decidedBy: string;
};

/**
 * Record the audited decision and move the enrolment's readiness level in a
 * single atomic batch.
 */
export async function recordProgressionDecision(
    input: ProgressionDecisionInput & { advance: boolean },
): Promise<void> {
    await db.batch(
        [
            {
                sql: `
                    INSERT INTO step_progression_decisions (
                        id, participant_id, enrolment_id, from_level, to_level,
                        decision, override_reason, decided_by, decided_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
                `,
                args: [
                    input.id,
                    input.participantId,
                    input.enrolmentId,
                    input.fromLevel,
                    input.toLevel,
                    input.decision,
                    input.overrideReason,
                    input.decidedBy,
                ],
            },
            ...(input.advance
                ? [
                      {
                          sql: `UPDATE step_enrolments SET level = ?, updated_at = unixepoch() WHERE id = ?`,
                          args: [input.toLevel, input.enrolmentId],
                      },
                  ]
                : []),
        ],
        "write",
    );
}
