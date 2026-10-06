"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canManageEnrolments } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import { assignRequirement, listRequirements } from "@/db/queries/step/learning";

export async function assignLearningRequirementAction(data: {
    enrolmentId: string;
    requirementId: string;
    dueAt?: number | null;
}) {
    const { context } = await requireAccess();

    const enrolment = await getEnrolmentById(data.enrolmentId);
    if (!enrolment) throw new Error("Enrolment not found.");
    if (!canManageEnrolments(context, { cycleId: enrolment.cycle_id, cohortId: enrolment.cycle_cohort_id })) {
        throw new Error("You cannot manage learning for this enrolment.");
    }

    await assignRequirement({
        id: `step_assign_${randomUUID()}`,
        enrolmentId: data.enrolmentId,
        requirementId: data.requirementId,
        dueAt: data.dueAt ?? null,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}

export async function listRequirementsAction(cycleId?: string) {
    await requireAccess();
    return listRequirements(cycleId);
}
