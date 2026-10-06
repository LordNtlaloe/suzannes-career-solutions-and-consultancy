import type {
    ApplicationStatus,
    ParticipantGroup,
    ParticipantLevel,
    Pathway,
} from "@/lib/step/constants";

export type StepCohort = {
    id: string;
    slug: string;
    name: string;
    fields: string | null;
    sort_order: number;
    active: number;
    created_at: number;
};

export type StepApplication = {
    id: string;
    user_id: string;
    cycle_id: string | null;
    cohort_id: string | null;
    pathway: Pathway;
    participant_group: ParticipantGroup;
    goals: string | null;
    baseline: string | null;
    consent_contact: number;
    consent_data: number;
    consent_programme: number;
    status: ApplicationStatus;
    submitted_at: number | null;
    reviewed_by: string | null;
    assigned_reviewer: string | null;
    review_note: string | null;
    feedback: string | null;
    reviewed_at: number | null;
    district: string | null;
    gender: string | null;
    created_at: number;
    updated_at: number;
};

export type StepApplicationWithRelations = StepApplication & {
    applicant_name: string | null;
    applicant_email: string | null;
    cohort_name: string | null;
};

// Permanent identity only — intake-specific details live on enrolments.
export type StepParticipant = {
    id: string;
    user_id: string;
    created_at: number;
    updated_at: number;
};

export type StepCycle = {
    id: string;
    slug: string;
    name: string;
    cohort_size: number | null;
    starts_at: number | null;
    ends_at: number | null;
    status: string;
    created_at: number;
    updated_at: number;
};

export type StepEnrolment = {
    id: string;
    participant_id: string;
    cycle_id: string;
    cycle_cohort_id: string | null;
    application_id: string | null;
    pathway: string;
    level: ParticipantLevel;
    status: string;
    enrolled_at: number;
    admitted_at: number | null;
    exited_at: number | null;
    created_at: number;
    updated_at: number;
};

export type StepEnrolmentWithRelations = StepEnrolment & {
    cycle_name: string | null;
    cohort_name: string | null;
};

export type StepStaff = {
    id: string;
    user_id: string;
    active: number;
    created_at: number;
    updated_at: number;
};

export type StepStaffAssignment = {
    id: string;
    user_id: string;
    role: string;
    cycle_id: string | null;
    cycle_cohort_id: string | null;
    active: number;
    created_at: number;
    updated_at: number;
};

export type StepMentoringAssignment = {
    id: string;
    mentor_id: string;
    enrolment_id: string;
    status: string;
    notes: string | null;
    created_at: number;
    updated_at: number;
};

export type StepDevelopmentAction = {
    id: string;
    enrolment_id: string;
    title: string;
    due_at: number | null;
    status: string;
    created_by: string | null;
    created_at: number;
    updated_at: number;
};

export type StepMentoringSession = {
    id: string;
    cycle_id: string | null;
    mentor_id: string;
    title: string;
    scheduled_at: number | null;
    status: string;
    created_at: number;
};

export type StepMentoringAttendance = {
    id: string;
    session_id: string;
    enrolment_id: string;
    attended: number | null;
    feedback: string | null;
    created_at: number;
};

export type StepEvidence = {
    id: string;
    assignment_id: string | null;
    participant_id: string;
    kind: string;
    title: string;
    body: string | null;
    media_id: string | null;
    status: string;
    submitted_at: number;
    created_at: number;
};

export type StepAssessmentAttempt = {
    id: string;
    assessment_id: string;
    enrolment_id: string;
    attempt: number;
    rubric_version: string | null;
    status: string;
    score: number | null;
    feedback: string | null;
    assessed_by: string | null;
    assessed_at: number | null;
    created_at: number;
    updated_at: number;
};

export type StepProgressionDecision = {
    id: string;
    participant_id: string;
    enrolment_id: string | null;
    from_level: string;
    to_level: string;
    decision: string;
    override_reason: string | null;
    decided_by: string | null;
    decided_at: number;
    created_at: number;
};

export type StepPassport = {
    id: string;
    participant_id: string;
    version: number;
    status: string;
    verified_by: string | null;
    verified_at: number | null;
    created_at: number;
};

export type StepPassportEntry = {
    id: string;
    passport_id: string;
    enrolment_id: string | null;
    entry_type: string;
    title: string;
    source_type: string | null;
    source_id: string | null;
    verified_by: string | null;
    verified_at: number | null;
    status: string;
    created_at: number;
};

export type StepPassportShare = {
    id: string;
    passport_id: string;
    token: string;
    scope: string;
    fields: string | null;
    expires_at: number | null;
    revoked_at: number | null;
    created_at: number;
};

export type StepPartner = {
    id: string;
    name: string;
    slug: string | null;
    contact_email: string | null;
    website: string | null;
    contribution_areas: string | null;
    status: string;
    approved_at: number | null;
    approved_by: string | null;
    created_at: number;
    updated_at: number;
};

export type StepOpportunityProvider = {
    id: string;
    name: string;
    contact_email: string | null;
    partner_id: string | null;
    status: string;
    created_at: number;
};

export type StepIntroduction = {
    id: string;
    participant_id: string;
    provider_id: string;
    status: string;
    consented_at: number | null;
    introduced_at: number | null;
    outcome: string | null;
    outcome_status: string | null;
    outcome_at: number | null;
    created_by: string | null;
    created_at: number;
    updated_at: number;
};
