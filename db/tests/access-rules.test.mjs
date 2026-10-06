// db/tests/access-rules.test.mjs
//
// Pure permission-rule tests (no database or session needed). Run with:
//   node db/tests/access-rules.test.mjs
//
// Loads the real rules from lib/step/access-rules.ts via Node type stripping.

import {
    assignmentCovers,
    canAdministerStaff,
    canReviewApplications,
    canReviewEvidence,
    canManageEnrolments,
    canRecordProgression,
    canVerifyPassport,
    hasAnyStepRole,
    isParticipant,
    isStaff,
    mentorCanAccessEnrolment,
    participantCanAccessEnrolment,
} from "../../lib/step/access-rules.ts";

let passed = 0;
let failed = 0;

function assert(cond, label) {
    if (cond) {
        passed++;
    } else {
        failed++;
        console.error(`  ✗ ${label}`);
    }
}

function ctx(overrides = {}) {
    return {
        userId: "u1",
        participant: null,
        enrolments: [],
        staffAssignments: [],
        mentorAssignments: [],
        ...overrides,
    };
}

const participant = { id: "p1", user_id: "u1" };
const enrolment = { id: "e1", participant_id: "p1", cycle_id: "c1", cycle_cohort_id: "cc1", pathway: "employment", level: "registered" };

// Deny by default
assert(!isStaff(ctx()), "staff denied with no assignments");
assert(!hasAnyStepRole(ctx()), "no STEP role with empty context");
assert(!canReviewApplications(ctx()), "application review denied by default");
assert(!canVerifyPassport(ctx()), "passport verification denied by default");
assert(!canAdministerStaff(ctx()), "staff admin denied for non-admin");

// Participant identity
assert(isParticipant(ctx({ participant, enrolments: [enrolment] })), "participant with identity + enrolment");
assert(!isParticipant(ctx({ participant, enrolments: [] })), "identity without enrolment is not a participant");

// Programme admin global scope
const admin = { id: "a1", user_id: "u9", role: "programme_admin", cycle_id: null, cycle_cohort_id: null, active: 1 };
assert(isStaff(ctx({ staffAssignments: [admin] })), "admin is staff");
assert(canAdministerStaff(ctx({ staffAssignments: [admin] })), "admin can administer staff");
assert(canReviewApplications(ctx({ staffAssignments: [admin] }), { cycleId: "c1" }), "admin reviews any cycle");
assert(canReviewApplications(ctx({ staffAssignments: [admin] })), "admin reviews with no scope");

// Reviewer scoped to a cycle
const reviewer = { id: "r1", user_id: "u2", role: "reviewer", cycle_id: "c1", cycle_cohort_id: null, active: 1 };
assert(canReviewApplications(ctx({ staffAssignments: [reviewer] }), { cycleId: "c1" }), "reviewer reviews their cycle");
assert(!canReviewApplications(ctx({ staffAssignments: [reviewer] }), { cycleId: "c2" }), "reviewer denied outside cycle");
assert(!canManageEnrolments(ctx({ staffAssignments: [reviewer] }), { cycleId: "c1" }), "reviewer cannot manage enrolments");
assert(!canRecordProgression(ctx({ staffAssignments: [reviewer] }), { cycleId: "c1" }), "reviewer cannot record progression");

// Coordinator scoped to a specific cohort instance
const coordinator = { id: "c1", user_id: "u3", role: "coordinator", cycle_id: "c1", cycle_cohort_id: "cc1", active: 1 };
assert(assignmentCovers(coordinator, { cycleId: "c1", cohortId: "cc1" }), "coordinator covers own cohort");
assert(!assignmentCovers(coordinator, { cycleId: "c1", cohortId: "cc2" }), "coordinator denied other cohort");
assert(!assignmentCovers(coordinator, { cycleId: "c2", cohortId: "cc1" }), "coordinator denied other cycle");
assert(canManageEnrolments(ctx({ staffAssignments: [coordinator] }), { cycleId: "c1", cohortId: "cc1" }), "coordinator manages own cohort");

// Mentor access is assignment-based only
const mentorAssignment = { id: "m1", mentor_id: "mentor1", enrolment_id: "e1", status: "active" };
const mentorCtx = ctx({ mentorAssignments: [mentorAssignment] });
assert(mentorCanAccessEnrolment(mentorCtx, "e1"), "mentor accesses assigned enrolment");
assert(!mentorCanAccessEnrolment(mentorCtx, "e2"), "mentor denied unassigned enrolment");
assert(!isStaff(mentorCtx), "mentor is not staff");

// Participant scope
const participantCtx = ctx({ participant, enrolments: [enrolment] });
assert(participantCanAccessEnrolment(participantCtx, "e1"), "participant accesses own enrolment");
assert(!participantCanAccessEnrolment(participantCtx, "e2"), "participant denied other enrolment");

// Incomplete scope is never global
const incomplete = { id: "i1", user_id: "u4", role: "reviewer", cycle_id: "c1", cycle_cohort_id: null, active: 1 };
assert(!canReviewApplications(ctx({ staffAssignments: [incomplete] }), { cycleId: "c2" }), "cycle-scoped staff denied other cycle");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
