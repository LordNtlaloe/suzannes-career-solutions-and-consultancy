"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canManageSafeguarding, isStaff } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import {
    complaintResolutionSchema,
    complaintSchema,
    conflictDeclarationSchema,
    safeguardingReportSchema,
    safeguardingResolutionSchema,
} from "@/lib/step/validation";
import {
    createComplaint,
    createConflictDeclaration,
    createSafeguardingReport,
    resolveComplaint,
    resolveConflictDeclaration,
    resolveSafeguardingReport,
} from "@/db/queries/step/safeguarding";

/** Any signed-in user may raise a complaint. */
export async function submitComplaintAction(data: {
    subject: string;
    body?: string | null;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = complaintSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createComplaint({
        id: `step_complaint_${randomUUID()}`,
        reporterUserId: userId,
        participantId: context.participant?.id ?? null,
        subject: value.subject,
        body: value.body || null,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}

/** Any signed-in user may raise a safeguarding concern. */
export async function submitSafeguardingReportAction(data: {
    subject: string;
    body?: string | null;
    riskLevel?: string;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = safeguardingReportSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createSafeguardingReport({
        id: `step_safeguard_${randomUUID()}`,
        reporterUserId: userId,
        participantId: context.participant?.id ?? null,
        subject: value.subject,
        body: value.body || null,
        riskLevel: value.riskLevel,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}

/** Active STEP staff declare conflicts of interest. */
export async function declareConflictAction(data: {
    relatedParty: string;
    relationship?: string | null;
    interestType?: string;
    details?: string | null;
}) {
    const { userId, context } = await requireAccess();
    if (!isStaff(context)) throw new Error("Only STEP staff can declare conflicts of interest.");

    const { error, value } = conflictDeclarationSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createConflictDeclaration({
        id: `step_conflict_${randomUUID()}`,
        userId,
        relatedParty: value.relatedParty,
        relationship: value.relationship || null,
        interestType: value.interestType,
        details: value.details || null,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}

export async function resolveComplaintAction(data: {
    complaintId: string;
    status: string;
    resolution?: string | null;
}) {
    const { userId, context } = await requireAccess();
    if (!canManageSafeguarding(context)) throw new Error("You cannot manage safeguarding records.");

    const { error, value } = complaintResolutionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await resolveComplaint({
        complaintId: value.complaintId,
        status: value.status,
        resolution: value.resolution || null,
        resolvedBy: userId,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}

export async function resolveSafeguardingReportAction(data: {
    reportId: string;
    status: string;
    outcome?: string | null;
}) {
    const { userId, context } = await requireAccess();
    if (!canManageSafeguarding(context)) throw new Error("You cannot manage safeguarding records.");

    const { error, value } = safeguardingResolutionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await resolveSafeguardingReport({
        reportId: value.reportId,
        status: value.status,
        outcome: value.outcome || null,
        resolvedBy: userId,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}

export async function resolveConflictDeclarationAction(data: {
    declarationId: string;
    status: string;
}) {
    const { userId, context } = await requireAccess();
    if (!canManageSafeguarding(context)) throw new Error("You cannot manage safeguarding records.");

    await resolveConflictDeclaration({
        declarationId: data.declarationId,
        status: data.status,
        resolvedBy: userId,
    });

    revalidatePath("/step/admin/safeguarding");
    return { ok: true };
}
