"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import {
    canManageEnrolments,
    canReviewApplications,
} from "@/lib/step/access-rules";
import {
    requireAccess,
    requireUser,
    recordApplicationConsents,
    resolveCycle,
} from "@/actions/step/helpers";
import {
    applicationReviewSchema,
    applicationSchema,
    bulkApplicationIdsSchema,
    bulkAssignReviewerSchema,
} from "@/lib/step/validation";
import {
    bulkAssignReviewer,
    bulkSetUnderReview,
    createApplication,
    getApplicationById,
    getApplicationsByIds,
    getLatestApplicationByUser,
    submitApplication as submitApplicationQuery,
    updateApplicationDraft,
    updateApplicationStatus,
} from "@/db/queries/step/applications";
import { admitApplication } from "@/db/queries/step/enrolments";

export async function saveDraftApplicationAction(data: {
    cycleId?: string | null;
    cohortId?: string | null;
    pathway: string;
    participantGroup: string;
    goals?: string;
    baseline?: string;
}) {
    const session = await requireUser();

    const { error, value } = applicationSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const cycleId = await resolveCycle(value.cycleId);

    const existing = await getLatestApplicationByUser(session.user.id);
    if (existing && ["submitted", "under_review", "admitted"].includes(existing.status)) {
        throw new Error("You already have an active application.");
    }

    if (existing && existing.status === "draft") {
        await updateApplicationDraft(existing.id, {
            cohortId: value.cohortId || null,
            pathway: value.pathway,
            participantGroup: value.participantGroup,
            goals: value.goals || null,
            baseline: value.baseline || null,
        });
        return { id: existing.id };
    }

    const id = `step_app_${randomUUID()}`;
    await createApplication({
        id,
        userId: session.user.id,
        cycleId,
        cohortId: value.cohortId || null,
        pathway: value.pathway,
        participantGroup: value.participantGroup,
        goals: value.goals || null,
        baseline: value.baseline || null,
        consentContact: false,
        consentData: false,
        consentProgramme: false,
        status: "draft",
    });
    return { id };
}

export async function submitApplicationAction(data: {
    cycleId?: string | null;
    cohortId?: string | null;
    pathway: string;
    participantGroup: string;
    goals?: string;
    baseline?: string;
    consentContact: boolean;
    consentData: boolean;
    consentProgramme: boolean;
}) {
    const session = await requireUser();

    const { error, value } = applicationSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    if (!value.consentContact || !value.consentData || !value.consentProgramme) {
        throw new Error("All consent boxes must be checked to submit your application.");
    }

    const cycleId = await resolveCycle(value.cycleId);

    const existing = await getLatestApplicationByUser(session.user.id);
    if (existing && ["submitted", "under_review", "admitted"].includes(existing.status)) {
        throw new Error("You already have an active application.");
    }

    const id = existing?.status === "draft" ? existing.id : `step_app_${randomUUID()}`;

    if (existing?.status === "draft") {
        await updateApplicationDraft(id, {
            cohortId: value.cohortId || null,
            pathway: value.pathway,
            participantGroup: value.participantGroup,
            goals: value.goals || null,
            baseline: value.baseline || null,
        });
        await submitApplicationQuery(id, {
            consentContact: value.consentContact,
            consentData: value.consentData,
            consentProgramme: value.consentProgramme,
        });
    } else {
        await createApplication({
            id,
            userId: session.user.id,
            cycleId,
            cohortId: value.cohortId || null,
            pathway: value.pathway,
            participantGroup: value.participantGroup,
            goals: value.goals || null,
            baseline: value.baseline || null,
            consentContact: value.consentContact,
            consentData: value.consentData,
            consentProgramme: value.consentProgramme,
            status: "submitted",
        });
    }

    await recordApplicationConsents(session.user.id);

    revalidatePath("/step/dashboard");
    return { id };
}

export async function reviewApplicationAction(data: {
    applicationId: string;
    status: "under_review" | "admitted" | "rejected";
    reviewNote?: string;
    feedback?: string;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = applicationReviewSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const application = await getApplicationById(value.applicationId);
    if (!application) throw new Error("Application not found.");

    if (!canReviewApplications(context, { cycleId: application.cycle_id })) {
        throw new Error("You cannot review applications in this intake.");
    }

    if (value.status === "admitted") {
        if (!canManageEnrolments(context, { cycleId: application.cycle_id })) {
            throw new Error("You do not have permission to admit applicants.");
        }
        if (!application.cycle_id) throw new Error("Application has no intake cycle.");
        if (application.status === "admitted") throw new Error("Application is already admitted.");

        await admitApplication({
            applicationId: application.id,
            userId: application.user_id,
            cycleId: application.cycle_id,
            cycleCohortId: null,
            pathway: application.pathway,
            decidedBy: userId,
        });
    } else {
        await updateApplicationStatus(application.id, {
            status: value.status,
            reviewedBy: userId,
            reviewNote: value.reviewNote || null,
            feedback: value.feedback || null,
        });
    }

    revalidatePath("/step/admin/applications");
    revalidatePath("/step/dashboard");
    return { ok: true };
}

export async function bulkAssignReviewerAction(data: {
    applicationIds: string[];
    reviewerUserId: string;
}) {
    const { userId, context } = await requireAccess();
    if (!canReviewApplications(context)) throw new Error("You cannot review applications.");

    const { error, value } = bulkAssignReviewerSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const applications = await getApplicationsByIds(value.applicationIds);
    const allowed = applications.filter((a) =>
        canReviewApplications(context, {
            cycleId: a.cycle_id,
            cohortId: a.cohort_id,
        }),
    );
    if (allowed.length === 0) throw new Error("None of the selected applications are in your scope.");

    const rows = allowed.map((a) => ({
        applicationId: a.id,
        auditId: `step_audit_${randomUUID()}`,
    }));

    await bulkAssignReviewer({
        rows,
        reviewerUserId: value.reviewerUserId,
        actorUserId: userId,
    });

    revalidatePath("/step/admin/applications");
    return { ok: true, updated: allowed.length };
}

export async function bulkSetUnderReviewAction(data: { applicationIds: string[] }) {
    const { userId, context } = await requireAccess();
    if (!canReviewApplications(context)) throw new Error("You cannot review applications.");

    const { error, value } = bulkApplicationIdsSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const applications = await getApplicationsByIds(value.applicationIds);
    const allowed = applications.filter((a) =>
        canReviewApplications(context, {
            cycleId: a.cycle_id,
            cohortId: a.cohort_id,
        }) && (a.status === "submitted" || a.status === "under_review"),
    );
    if (allowed.length === 0) throw new Error("No selected applications can be moved to under review.");

    const rows = allowed.map((a) => ({
        applicationId: a.id,
        auditId: `step_audit_${randomUUID()}`,
    }));

    await bulkSetUnderReview({ rows, actorUserId: userId });

    revalidatePath("/step/admin/applications");
    return { ok: true, updated: allowed.length };
}
