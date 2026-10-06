// lib/step/constants.ts
//
// Static STEP programme vocabulary. Kept in one place so routes, queries,
// validation and UI all share the same values.

export const STEP_PATH = "/step";

export const PATHWAYS = [
    { value: "employment", label: "Employment" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "creator", label: "Creator economy" },
    { value: "leadership", label: "Leadership" },
] as const;

export type Pathway = (typeof PATHWAYS)[number]["value"];

export const PARTICIPANT_GROUPS = [
    { value: "student", label: "Student or recent graduate" },
    { value: "entry", label: "Entry-level professional" },
    { value: "mid_career", label: "Mid-career professional" },
    { value: "experienced", label: "Experienced professional" },
    { value: "entrepreneur", label: "Entrepreneur or small-business owner" },
    { value: "creator", label: "Emerging creator / creative professional" },
] as const;

export type ParticipantGroup = (typeof PARTICIPANT_GROUPS)[number]["value"];

export const APPLICATION_STATUSES = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under review" },
    { value: "admitted", label: "Admitted" },
    { value: "rejected", label: "Not admitted" },
    { value: "withdrawn", label: "Withdrawn" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

export const PARTICIPANT_LEVELS = [
    { value: "registered", label: "Registered", short: "Level 1" },
    { value: "foundation_ready", label: "Foundation Ready", short: "Level 2" },
    { value: "pathway_ready", label: "Pathway Ready", short: "Level 3" },
    { value: "opportunity_ready", label: "Opportunity Ready", short: "Level 4" },
    { value: "graduate", label: "STEP Graduate", short: "Graduate" },
] as const;

export const PASSPORT_ENTRY_TYPES = [
    { value: "course", label: "Course" },
    { value: "certificate", label: "Certificate" },
    { value: "mentoring", label: "Mentoring" },
    { value: "assessment", label: "Assessment" },
    { value: "project", label: "Project" },
    { value: "milestone", label: "Milestone" },
] as const;

export type ParticipantLevel = (typeof PARTICIPANT_LEVELS)[number]["value"];

export const JOURNEY_PHASES = [
    {
        key: "baseline",
        title: "Entry and Baseline",
        focus: "Registration and pathway placement",
        evidence: "Approved development plan and baseline profile",
    },
    {
        key: "month-one",
        title: "Month One",
        focus: "Core preparedness",
        evidence: "Mandatory course completion and foundation assessment",
    },
    {
        key: "month-two",
        title: "Month Two",
        focus: "Industry learning",
        evidence: "Certificates, quizzes and learning reflections",
    },
    {
        key: "month-three",
        title: "Month Three",
        focus: "Coaching and mentoring",
        evidence: "Attendance, mentor feedback and development actions",
    },
    {
        key: "month-four",
        title: "Month Four",
        focus: "Practical application",
        evidence: "Assessed practical outputs",
    },
    {
        key: "month-five",
        title: "Month Five",
        focus: "Opportunity readiness",
        evidence: "Readiness assessment, pitch or competency test",
    },
    {
        key: "month-six",
        title: "Month Six",
        focus: "Validation and transition",
        evidence: "STEP completion status and verified Passport",
    },
] as const;

export function pathwayLabel(value: string): string {
    return PATHWAYS.find((p) => p.value === value)?.label ?? value;
}

export function participantGroupLabel(value: string): string {
    return PARTICIPANT_GROUPS.find((g) => g.value === value)?.label ?? value;
}

export function applicationStatusLabel(value: string): string {
    return APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function levelLabel(value: string): string {
    return PARTICIPANT_LEVELS.find((l) => l.value === value)?.label ?? value;
}
