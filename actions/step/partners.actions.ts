"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canManagePartners } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import {
    agreementSchema,
    contributionSchema,
    partnerSchema,
} from "@/lib/step/validation";
import {
    approvePartner,
    createAgreement,
    createContribution,
    createPartner,
} from "@/db/queries/step/partners";

export async function createPartnerAction(data: {
    name: string;
    slug?: string | null;
    contactEmail?: string | null;
    website?: string | null;
    contributionAreas?: string[] | null;
}) {
    const { context } = await requireAccess();
    if (!canManagePartners(context)) throw new Error("You cannot manage partners.");

    const { error, value } = partnerSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createPartner({
        id: `step_partner_${randomUUID()}`,
        name: value.name,
        slug: value.slug || null,
        contactEmail: value.contactEmail || null,
        website: value.website || null,
        contributionAreas: value.contributionAreas ?? null,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}

export async function approvePartnerAction(data: { partnerId: string }) {
    const { userId, context } = await requireAccess();
    if (!canManagePartners(context)) throw new Error("You cannot manage partners.");

    await approvePartner({ partnerId: data.partnerId, approvedBy: userId });

    revalidatePath("/step/partners");
    revalidatePath("/step");
    return { ok: true };
}

export async function createAgreementAction(data: {
    partnerId: string;
    title: string;
}) {
    const { context } = await requireAccess();
    if (!canManagePartners(context)) throw new Error("You cannot manage partners.");

    const { error, value } = agreementSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createAgreement({
        id: `step_agreement_${randomUUID()}`,
        partnerId: value.partnerId,
        title: value.title,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}

export async function createContributionAction(data: {
    partnerId: string;
    area: string;
    description?: string | null;
}) {
    const { context } = await requireAccess();
    if (!canManagePartners(context)) throw new Error("You cannot manage partners.");

    const { error, value } = contributionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createContribution({
        id: `step_contribution_${randomUUID()}`,
        partnerId: value.partnerId,
        area: value.area,
        description: value.description || null,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}
