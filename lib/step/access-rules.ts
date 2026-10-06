// lib/step/access-rules.ts
//
// Pure permission rules for STEP. No database or session access here — the
// access context is loaded by lib/step/permissions.ts and passed in.
//
// Deny by default: every capability returns false unless an explicit grant is
// present. Scope semantics are deliberate:
//   - assignment with cycle_id NULL and cycle_cohort_id NULL → global
//     (programme-wide). Only meaningful for programme_admin.
//   - assignment with cycle_id set and cycle_cohort_id NULL → that cycle.
//   - assignment with both set → that cohort within that cycle.
// A missing/incomplete scope is never treated as broader than it is.

import type {
    StepEnrolmentWithRelations,
    StepMentoringAssignment,
    StepStaffAssignment,
} from "@/types/step";

export type StepParticipantIdentity = {
    id: string;
    user_id: string;
};

export type StepAccessContext = {
    userId: string;
    participant: StepParticipantIdentity | null;
    enrolments: StepEnrolmentWithRelations[];
    staffAssignments: StepStaffAssignment[];
    mentorAssignments: StepMentoringAssignment[];
};

export type StaffRole =
    | "programme_admin"
    | "coordinator"
    | "reviewer"
    | "mentor"
    | "partner_liaison";

// ---------- Responsibilities ----------

export function activeStaffAssignments(ctx: StepAccessContext): StepStaffAssignment[] {
    return ctx.staffAssignments.filter((a) => a.active);
}

/** Active assignments filtered to a specific set of roles (for scoping). */
export function staffAssignmentsWithRole(
    ctx: StepAccessContext,
    roles: StaffRole[],
): StepStaffAssignment[] {
    return activeStaffAssignments(ctx).filter((a) => roles.includes(a.role as StaffRole));
}

export function hasStaffRole(
    ctx: StepAccessContext,
    role: StaffRole,
): boolean {
    return activeStaffAssignments(ctx).some((a) => a.role === role);
}

export function isProgrammeAdmin(ctx: StepAccessContext): boolean {
    return hasStaffRole(ctx, "programme_admin");
}

export function isStaff(ctx: StepAccessContext): boolean {
    return activeStaffAssignments(ctx).length > 0;
}

export function isMentor(ctx: StepAccessContext): boolean {
    return ctx.mentorAssignments.length > 0;
}

export function isParticipant(ctx: StepAccessContext): boolean {
    return ctx.participant !== null && ctx.enrolments.length > 0;
}

export function hasAnyStepRole(ctx: StepAccessContext): boolean {
    return isParticipant(ctx) || isStaff(ctx) || isMentor(ctx);
}

export type StepRoleKey = "participant" | "staff" | "mentor" | "admin";

/** The dashboard workspaces a user may open, in a stable order. */
export function stepRoleKeys(ctx: StepAccessContext): StepRoleKey[] {
    const keys: StepRoleKey[] = [];
    if (isParticipant(ctx)) keys.push("participant");
    if (isStaff(ctx)) keys.push("staff");
    if (isMentor(ctx)) keys.push("mentor");
    if (isProgrammeAdmin(ctx)) keys.push("admin");
    return keys;
}

/**
 * Whether the user may reach the programme administration tools
 * (application/evidence review, progression, cohorts, staff). Mentors and
 * partner liaisons hold staff assignments but do not get admin tools.
 */
export function canAccessAdminTools(ctx: StepAccessContext): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            a.role === "programme_admin" ||
            a.role === "coordinator" ||
            a.role === "reviewer",
    );
}

// ---------- Scope ----------

function assignmentCoversCycle(a: StepStaffAssignment, cycleId: string): boolean {
    return a.cycle_id === null || a.cycle_id === cycleId;
}

function assignmentCoversCohort(a: StepStaffAssignment, cohortId: string): boolean {
    return a.cycle_cohort_id === null || a.cycle_cohort_id === cohortId;
}

export function assignmentCovers(
    a: StepStaffAssignment,
    opts: { cycleId?: string | null; cohortId?: string | null },
): boolean {
    if (opts.cycleId && !assignmentCoversCycle(a, opts.cycleId)) return false;
    if (opts.cohortId && !assignmentCoversCohort(a, opts.cohortId)) return false;
    return true;
}

// ---------- Capabilities ----------

export function canAdministerStaff(ctx: StepAccessContext): boolean {
    return isProgrammeAdmin(ctx);
}

export function canManageCycles(ctx: StepAccessContext): boolean {
    return isProgrammeAdmin(ctx);
}

/** Review applications within an optional cycle/cohort scope. */
export function canReviewApplications(
    ctx: StepAccessContext,
    scope: { cycleId?: string | null; cohortId?: string | null } = {},
): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            (a.role === "programme_admin" ||
                a.role === "coordinator" ||
                a.role === "reviewer") &&
            assignmentCovers(a, scope),
    );
}

/** Admit/manage enrolments within an optional cycle/cohort scope. */
export function canManageEnrolments(
    ctx: StepAccessContext,
    scope: { cycleId?: string | null; cohortId?: string | null } = {},
): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            (a.role === "programme_admin" || a.role === "coordinator") &&
            assignmentCovers(a, scope),
    );
}

/** Review submitted evidence within an optional cycle/cohort scope. */
export function canReviewEvidence(
    ctx: StepAccessContext,
    scope: { cycleId?: string | null; cohortId?: string | null } = {},
): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            (a.role === "programme_admin" ||
                a.role === "coordinator" ||
                a.role === "reviewer") &&
            assignmentCovers(a, scope),
    );
}

export function canAssess(
    ctx: StepAccessContext,
    scope: { cycleId?: string | null; cohortId?: string | null } = {},
): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            (a.role === "programme_admin" ||
                a.role === "coordinator" ||
                a.role === "reviewer") &&
            assignmentCovers(a, scope),
    );
}

export function canRecordProgression(
    ctx: StepAccessContext,
    scope: { cycleId?: string | null; cohortId?: string | null } = {},
): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            (a.role === "programme_admin" || a.role === "coordinator") &&
            assignmentCovers(a, scope),
    );
}

export function canVerifyPassport(ctx: StepAccessContext): boolean {
    return activeStaffAssignments(ctx).some(
        (a) => a.role === "programme_admin" || a.role === "coordinator",
    );
}

/** Partner records: programme admin or partner liaison only. */
export function canManagePartners(ctx: StepAccessContext): boolean {
    return activeStaffAssignments(ctx).some(
        (a) => a.role === "programme_admin" || a.role === "partner_liaison",
    );
}

/** Introductions: programme admin, coordinator or partner liaison. */
export function canManageIntroductions(ctx: StepAccessContext): boolean {
    return activeStaffAssignments(ctx).some(
        (a) =>
            a.role === "programme_admin" ||
            a.role === "coordinator" ||
            a.role === "partner_liaison",
    );
}

/** A participant may only consent to / view introductions for their own identity. */
export function participantCanAccessIntroduction(
    ctx: StepAccessContext,
    participantId: string,
): boolean {
    return ctx.participant?.id === participantId;
}

/** Safeguarding records are restricted to programme administrators. */
export function canManageSafeguarding(ctx: StepAccessContext): boolean {
    return isProgrammeAdmin(ctx);
}

export function canMentor(ctx: StepAccessContext): boolean {
    return isMentor(ctx);
}

/** A mentor may only act on enrolments assigned to them. */
export function mentorCanAccessEnrolment(
    ctx: StepAccessContext,
    enrolmentId: string,
): boolean {
    return ctx.mentorAssignments.some(
        (m) => m.enrolment_id === enrolmentId && m.status !== "ended",
    );
}

/** A participant may only act on their own enrolments. */
export function participantCanAccessEnrolment(
    ctx: StepAccessContext,
    enrolmentId: string,
): boolean {
    return ctx.enrolments.some((e) => e.id === enrolmentId);
}
