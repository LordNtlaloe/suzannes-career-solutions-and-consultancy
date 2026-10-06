"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canAssess } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { assessmentSchema } from "@/lib/step/validation";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import {
    getLatestAttempt,
    recordAssessmentAttempt,
} from "@/db/queries/step/assessments";

export async function recordAssessmentAction(data: {
    assessmentId: string;
    enrolmentId: string;
    rubricVersion?: string | null;
    status: "pending" | "passed" | "failed";
    score?: number | null;
    feedback?: string;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = assessmentSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const enrolment = await getEnrolmentById(value.enrolmentId);
    if (!enrolment) throw new Error("Enrolment not found.");
    if (!canAssess(context, { cycleId: enrolment.cycle_id, cohortId: enrolment.cycle_cohort_id })) {
        throw new Error("You cannot assess this enrolment.");
    }

    const latest = await getLatestAttempt(value.assessmentId, value.enrolmentId);
    const attempt = (latest?.attempt ?? 0) + 1;

    await recordAssessmentAttempt({
        id: `step_att_${randomUUID()}`,
        assessmentId: value.assessmentId,
        enrolmentId: value.enrolmentId,
        attempt,
        rubricVersion: value.rubricVersion ?? null,
        status: value.status,
        score: value.score ?? null,
        feedback: value.feedback ?? null,
        assessedBy: userId,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}
