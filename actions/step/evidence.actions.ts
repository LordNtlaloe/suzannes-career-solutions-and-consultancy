"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import {
    canReviewEvidence,
    participantCanAccessEnrolment,
} from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { evidenceReviewSchema, evidenceSchema } from "@/lib/step/validation";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import { getAssignmentById } from "@/db/queries/step/learning";
import {
    getEvidenceById,
    reviewEvidence as reviewEvidenceQuery,
    submitEvidence as submitEvidenceQuery,
} from "@/db/queries/step/evidence";

export async function submitEvidenceAction(data: {
    assignmentId: string;
    kind: string;
    title: string;
    body?: string;
}) {
    const { context } = await requireAccess();

    const { error, value } = evidenceSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    if (!context.participant) throw new Error("You are not a STEP participant.");

    const assignment = await getAssignmentById(value.assignmentId);
    if (!assignment) throw new Error("Assignment not found.");
    const enrolmentId = String(assignment.enrolment_id);

    if (!participantCanAccessEnrolment(context, enrolmentId)) {
        throw new Error("You can only submit evidence for your own assignments.");
    }

    await submitEvidenceQuery({
        id: `step_ev_${randomUUID()}`,
        assignmentId: value.assignmentId,
        participantId: context.participant.id,
        kind: value.kind,
        title: value.title,
        body: value.body || null,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}

export async function reviewEvidenceAction(data: {
    evidenceId: string;
    decision: "accepted" | "rejected" | "changes_requested";
    feedback?: string;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = evidenceReviewSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const evidence = await getEvidenceById(value.evidenceId);
    if (!evidence) throw new Error("Evidence not found.");
    if (!evidence.assignment_id) throw new Error("Evidence has no assignment.");

    const assignment = await getAssignmentById(evidence.assignment_id);
    if (!assignment) throw new Error("Assignment not found.");
    const enrolment = await getEnrolmentById(String(assignment.enrolment_id));
    if (!enrolment) throw new Error("Enrolment not found.");

    if (!canReviewEvidence(context, { cycleId: enrolment.cycle_id, cohortId: enrolment.cycle_cohort_id })) {
        throw new Error("You cannot review evidence outside your assigned scope.");
    }

    await reviewEvidenceQuery({
        reviewId: `step_evrev_${randomUUID()}`,
        evidenceId: evidence.id,
        assignmentId: evidence.assignment_id,
        reviewerId: userId,
        decision: value.decision,
        feedback: value.feedback || null,
    });

    revalidatePath("/step/dashboard");
    revalidatePath("/step/admin");
    return { ok: true };
}
