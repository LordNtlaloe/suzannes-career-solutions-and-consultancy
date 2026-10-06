"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canRecordProgression } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { progressionSchema } from "@/lib/step/validation";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import {
    countIncompleteRequirements,
    recordProgressionDecision,
} from "@/db/queries/step/progression";
import { PARTICIPANT_LEVELS } from "@/lib/step/constants";

const LEVEL_ORDER: string[] = PARTICIPANT_LEVELS.map((l) => l.value);

export async function recordProgressionAction(data: {
    enrolmentId: string;
    toLevel: string;
    decision: "approved" | "denied" | "override";
    overrideReason?: string;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = progressionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const enrolment = await getEnrolmentById(value.enrolmentId);
    if (!enrolment) throw new Error("Enrolment not found.");

    if (!canRecordProgression(context, { cycleId: enrolment.cycle_id, cohortId: enrolment.cycle_cohort_id })) {
        throw new Error("You cannot record progression for this enrolment.");
    }

    const fromLevel: string = enrolment.level;
    const fromIndex = LEVEL_ORDER.indexOf(fromLevel);
    const toIndex = LEVEL_ORDER.indexOf(value.toLevel);
    if (toIndex <= fromIndex) throw new Error("Cannot move to the same or an earlier level.");

    const unmet = await countIncompleteRequirements(enrolment.id, value.toLevel);
    if (unmet > 0 && value.decision !== "override") {
        throw new Error("Required learning or assessments are not yet verified. Record an override with a reason to advance anyway.");
    }
    if (value.decision === "override" && !value.overrideReason?.trim()) {
        throw new Error("An override requires a recorded reason.");
    }

    await recordProgressionDecision({
        id: `step_prog_${randomUUID()}`,
        participantId: enrolment.participant_id,
        enrolmentId: enrolment.id,
        fromLevel,
        toLevel: value.toLevel,
        decision: value.decision,
        overrideReason: value.overrideReason || null,
        decidedBy: userId,
        advance: value.decision === "approved" || value.decision === "override",
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}
