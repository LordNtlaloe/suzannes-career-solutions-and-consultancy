// lib/step/validation.ts
import Joi from "joi";

export const applicationSchema = Joi.object({
    cycleId: Joi.string().allow("", null),
    cohortId: Joi.string().allow("", null),
    pathway: Joi.string()
        .valid("employment", "entrepreneurship", "creator", "leadership")
        .required(),
    participantGroup: Joi.string()
        .valid("student", "entry", "mid_career", "experienced", "entrepreneur", "creator")
        .required(),
    goals: Joi.string().allow("").max(2000),
    baseline: Joi.string().allow("").max(2000),
    consentContact: Joi.boolean().default(false),
    consentData: Joi.boolean().default(false),
    consentProgramme: Joi.boolean().default(false),
});

export const applicationReviewSchema = Joi.object({
    applicationId: Joi.string().required(),
    status: Joi.string().valid("under_review", "admitted", "rejected").required(),
    reviewNote: Joi.string().allow("").max(2000),
    feedback: Joi.string().allow("").max(2000),
});

export const evidenceSchema = Joi.object({
    assignmentId: Joi.string().required(),
    kind: Joi.string().valid("file", "link", "text").default("text"),
    title: Joi.string().required().min(1).max(255),
    body: Joi.string().allow("").max(20000),
});

export const evidenceReviewSchema = Joi.object({
    evidenceId: Joi.string().required(),
    decision: Joi.string().valid("accepted", "rejected", "changes_requested").required(),
    feedback: Joi.string().allow("").max(4000),
});

export const assessmentSchema = Joi.object({
    assessmentId: Joi.string().required(),
    enrolmentId: Joi.string().required(),
    rubricVersion: Joi.string().allow("", null).max(255),
    status: Joi.string().valid("pending", "passed", "failed").required(),
    score: Joi.number().allow(null).min(0).max(100),
    feedback: Joi.string().allow("").max(4000),
});

export const progressionSchema = Joi.object({
    enrolmentId: Joi.string().required(),
    toLevel: Joi.string()
        .valid("registered", "foundation_ready", "pathway_ready", "opportunity_ready", "graduate")
        .required(),
    decision: Joi.string().valid("approved", "denied", "override").required(),
    overrideReason: Joi.string().allow("").max(2000),
});

export const staffAssignmentSchema = Joi.object({
    userId: Joi.string().required(),
    role: Joi.string()
        .valid("programme_admin", "coordinator", "reviewer", "mentor", "partner_liaison")
        .required(),
    cycleId: Joi.string().allow("", null),
    cycleCohortId: Joi.string().allow("", null),
});

export const cycleSchema = Joi.object({
    slug: Joi.string().required().min(1).max(120),
    name: Joi.string().required().min(1).max(255),
    cohortSize: Joi.number().integer().allow(null),
    startsAt: Joi.number().integer().allow(null),
    endsAt: Joi.number().integer().allow(null),
});

export const developmentActionSchema = Joi.object({
    enrolmentId: Joi.string().required(),
    title: Joi.string().required().min(1).max(255),
    dueAt: Joi.number().integer().allow(null),
});

export const attendanceSchema = Joi.object({
    sessionId: Joi.string().required(),
    enrolmentId: Joi.string().required(),
    attended: Joi.boolean().required(),
    feedback: Joi.string().allow("").max(4000),
});

export const passportShareSchema = Joi.object({
    passportId: Joi.string().required(),
    scope: Joi.string().valid("full", "limited").default("limited"),
    fields: Joi.array().items(Joi.string().max(255)).max(20).allow(null),
    expiresAt: Joi.number().integer().allow(null).min(1),
});

export const bulkApplicationIdsSchema = Joi.object({
    applicationIds: Joi.array().items(Joi.string().required()).min(1).max(200).required(),
});

export const bulkAssignReviewerSchema = bulkApplicationIdsSchema.keys({
    reviewerUserId: Joi.string().required(),
});

export const partnerSchema = Joi.object({
    name: Joi.string().required().min(1).max(255),
    slug: Joi.string().allow("", null).max(120),
    contactEmail: Joi.string().allow("", null).email(),
    website: Joi.string().allow("", null).max(255),
    contributionAreas: Joi.array().items(Joi.string().max(120)).allow(null),
});

export const agreementSchema = Joi.object({
    partnerId: Joi.string().required(),
    title: Joi.string().required().min(1).max(255),
});

export const contributionSchema = Joi.object({
    partnerId: Joi.string().required(),
    area: Joi.string()
        .valid("learning", "mentoring", "placement", "funding", "assessment", "other")
        .required(),
    description: Joi.string().allow("").max(2000),
});

export const providerSchema = Joi.object({
    name: Joi.string().required().min(1).max(255),
    contactEmail: Joi.string().allow("", null).email(),
    partnerId: Joi.string().allow("", null),
});

export const introductionSchema = Joi.object({
    participantId: Joi.string().required(),
    providerId: Joi.string().required(),
});

export const introductionOutcomeSchema = Joi.object({
    introductionId: Joi.string().required(),
    outcomeStatus: Joi.string()
        .valid("pending", "interview", "hired", "declined", "other")
        .required(),
    outcome: Joi.string().allow("").max(4000),
});

export const complaintSchema = Joi.object({
    subject: Joi.string().required().min(1).max(255),
    body: Joi.string().allow("").max(8000),
});

export const safeguardingReportSchema = Joi.object({
    subject: Joi.string().required().min(1).max(255),
    body: Joi.string().allow("").max(8000),
    riskLevel: Joi.string().valid("low", "medium", "high", "critical").default("medium"),
});

export const conflictDeclarationSchema = Joi.object({
    relatedParty: Joi.string().required().min(1).max(255),
    relationship: Joi.string().allow("").max(255),
    interestType: Joi.string()
        .valid("financial", "personal", "employment", "other")
        .default("other"),
    details: Joi.string().allow("").max(4000),
});

export const complaintResolutionSchema = Joi.object({
    complaintId: Joi.string().required(),
    status: Joi.string().valid("open", "in_review", "resolved", "dismissed").required(),
    resolution: Joi.string().allow("").max(4000),
});

export const safeguardingResolutionSchema = Joi.object({
    reportId: Joi.string().required(),
    status: Joi.string().valid("open", "investigating", "resolved").required(),
    outcome: Joi.string().allow("").max(4000),
});
