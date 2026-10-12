import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isParticipant } from "@/lib/step/access-rules";
import { participantDashboard } from "@/db/queries/step/dashboards";
import { listPassportEntries, listPassportShares } from "@/db/queries/step/passports";
import { listIntroductionsForParticipant } from "@/db/queries/step/introductions";
import { PassportShareManager } from "@/components/step/passport-share-manager";
import { IntroductionConsent } from "@/components/step/introduction-consent";
import { SafeguardingSubmit } from "@/components/step/safeguarding-submit";
import {
    JOURNEY_PHASES,
    PARTICIPANT_LEVELS,
    levelLabel,
    pathwayLabel,
} from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/participant",
        title: "Participant Dashboard",
        description: "Your STEP enrolments, readiness and submissions.",
    });
}

export default async function ParticipantDashboardPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard/participant"))}`);
    if (!isParticipant(context)) redirect(link("/dashboard"));

    const data = await participantDashboard(user.id);
    const NOW = data.now;
    const passportStatus = data.passport?.status ?? "not_issued";
    const passportEntries = data.passport
        ? await listPassportEntries(data.passport.id)
        : [];
    const passportShares = data.passport
        ? await listPassportShares(data.passport.id)
        : [];
    const introductions = data.participant
        ? await listIntroductionsForParticipant(data.participant.id)
        : [];

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Participant
                    </span>
                    <h1 className="section-heading">Your STEP journey.</h1>
                </header>

                <div className="flex flex-col gap-8">
                    {data.enrolments.map(
                        ({
                            enrolment,
                            assignments,
                            pendingFeedback,
                            overdue,
                            dueThisWeek,
                            awaitingSubmission,
                            sessions,
                            nextLevel,
                            unmetRequirements,
                            unmetAssessments,
                        }) => {
                            const monthsSince = Math.max(
                                0,
                                Math.floor((NOW - Number(enrolment.enrolled_at)) / (30 * 86400)),
                            );
                            const phaseIndex = Math.min(6, monthsSince);
                            const levelIndex = PARTICIPANT_LEVELS.findIndex(
                                (l) => l.value === String(enrolment.level),
                            );

                            return (
                                <div key={enrolment.id} className="rounded-lg border border-line bg-card p-6">
                                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                                        <h2 className="text-[15px] font-semibold">
                                            {enrolment.cycle_name}
                                        </h2>
                                        <span className="text-[13px] text-brand-muted">
                                            {enrolment.cohort_name ?? "No cohort"} · {pathwayLabel(enrolment.pathway)}
                                        </span>
                                        <span className="ml-auto rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                                            {levelLabel(String(enrolment.level))}
                                        </span>
                                    </div>

                                    {/* B1 Journey tracker */}
                                    <div className="mt-5">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                            Journey
                                        </h3>
                                        <div className="mt-2 grid grid-cols-7 gap-1">
                                            {JOURNEY_PHASES.map((phase, i) => (
                                                <div
                                                    key={phase.key}
                                                    className={`rounded-0 border px-1 py-2 text-center ${
                                                        i === phaseIndex
                                                            ? "border-blue bg-blue/10"
                                                            : i < phaseIndex
                                                              ? "border-blue/30 bg-blue/5"
                                                              : "border-line bg-light/60"
                                                    }`}
                                                    title={phase.title}
                                                >
                                                    <span
                                                        className={`block text-[10px] font-semibold ${
                                                            i === phaseIndex ? "text-blue-dark" : "text-brand-muted"
                                                        }`}
                                                    >
                                                        {i === 0 ? "Start" : `M${i}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-1.5 text-[11px] text-brand-muted">
                                            {JOURNEY_PHASES[phaseIndex].title} — {JOURNEY_PHASES[phaseIndex].focus}
                                        </p>
                                    </div>

                                    {/* B2 Level progress bar */}
                                    <div className="mt-5">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                            Level progress
                                        </h3>
                                        <div className="mt-2 flex items-center gap-1">
                                            {PARTICIPANT_LEVELS.map((level, i) => (
                                                <div
                                                    key={level.value}
                                                    className={`h-2 flex-1 rounded-full ${
                                                        i <= levelIndex ? "bg-blue" : "bg-light"
                                                    }`}
                                                    title={level.label}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-1.5 text-[11px] text-brand-muted">
                                            {levelLabel(String(enrolment.level))}
                                            {nextLevel ? ` → next: ${levelLabel(nextLevel)}` : " — graduate level"}
                                        </p>

                                        {nextLevel && unmetRequirements.length + unmetAssessments.length > 0 && (
                                            <div className="mt-3 flex flex-col gap-1.5 rounded-0 border border-line bg-light/60 p-3">
                                                <p className="text-[11px] font-semibold text-brand-muted">
                                                    To reach {levelLabel(nextLevel)} you still need:
                                                </p>
                                                {unmetRequirements.map((r) => (
                                                    <p key={String(r.id)} className="text-[12px]">
                                                        {String(r.title)}{" "}
                                                        <span className="text-brand-muted">
                                                            ({String(r.assignment_status ?? "not assigned")})
                                                        </span>
                                                    </p>
                                                ))}
                                                {unmetAssessments.map((a) => (
                                                    <p key={String(a.id)} className="text-[12px]">
                                                        {String(a.title)}{" "}
                                                        <span className="text-brand-muted">
                                                            ({String(a.latest_status ?? "not attempted")})
                                                        </span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* B3 Next actions */}
                                    <div className="mt-5">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                            Next actions
                                        </h3>
                                        <div className="mt-2 flex flex-col gap-2">
                                            {overdue.length + dueThisWeek.length + awaitingSubmission.length + sessions.length === 0 ? (
                                                <p className="section-copy">You&rsquo;re all caught up.</p>
                                            ) : (
                                                <>
                                                    {overdue.map((a) => (
                                                        <ActionLink
                                                            key={`overdue-${String(a.id)}`}
                                                            href={link(`/dashboard/participant/assignments/${a.id}`)}
                                                            label={String(a.title)}
                                                            meta={`overdue ${dueText(a.due_at)}`}
                                                            tone="overdue"
                                                        />
                                                    ))}
                                                    {dueThisWeek.map((a) => (
                                                        <ActionLink
                                                            key={`week-${String(a.id)}`}
                                                            href={link(`/dashboard/participant/assignments/${a.id}`)}
                                                            label={String(a.title)}
                                                            meta={`due ${dueText(a.due_at)}`}
                                                        />
                                                    ))}
                                                    {awaitingSubmission
                                                        .filter((a) => !overdue.includes(a) && !dueThisWeek.includes(a))
                                                        .map((a) => (
                                                            <ActionLink
                                                                key={`submit-${String(a.id)}`}
                                                                href={link(`/dashboard/participant/assignments/${a.id}`)}
                                                                label={String(a.title)}
                                                                meta="needs evidence"
                                                            />
                                                        ))}
                                                    {sessions.slice(0, 3).map((s) => (
                                                        <div
                                                            key={`session-${String(s.id)}`}
                                                            className="flex items-center justify-between rounded-0 border border-line bg-light/60 px-4 py-2.5"
                                                        >
                                                            <p className="text-[13px] font-semibold">
                                                                {String(s.title)}
                                                                {s.mentor_name ? ` · ${String(s.mentor_name)}` : ""}
                                                            </p>
                                                            <span className="text-[12px] text-brand-muted">
                                                                {new Date(Number(s.scheduled_at) * 1000).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assignments summary */}
                                    <div className="mt-5 border-t border-line pt-4">
                                        <p className="text-[12px] text-brand-muted">
                                            {assignments.length} assignments · {pendingFeedback.length} pending feedback
                                        </p>
                                        {assignments.slice(0, 5).map((a) => (
                                            <Link
                                                key={String(a.id)}
                                                href={link(`/dashboard/participant/assignments/${a.id}`)}
                                                className="mt-2 flex items-center justify-between rounded-0 border border-line bg-light/60 px-4 py-2.5 transition-colors hover:border-blue/40"
                                            >
                                                <p className="text-[13px] font-semibold">{String(a.title)}</p>
                                                <span className="text-[12px] text-brand-muted">
                                                    {String(a.status)} · level {String(a.level)}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        },
                    )}

                    {/* B4 Passport card */}
                    <div className="rounded-lg border border-line bg-light/60 p-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Skills Passport
                        </h3>

                        {!data.passport ? (
                            <p className="section-copy mt-2">
                                Your Skills Passport is issued once programme staff verify your
                                achievements. Keep completing your learning to get there.
                            </p>
                        ) : (
                            <>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                            passportStatus === "verified"
                                                ? "bg-blue/12 text-blue-dark"
                                                : "bg-light text-brand-muted"
                                        }`}
                                    >
                                        {passportStatus === "verified" ? "Verified" : passportStatus}
                                    </span>
                                    <span className="text-[12px] text-brand-muted">
                                        {passportEntries.filter((e) => e.status === "verified").length} verified
                                        achievement{passportEntries.filter((e) => e.status === "verified").length === 1 ? "" : "s"}
                                    </span>
                                </div>

                                {passportEntries.length === 0 ? (
                                    <p className="section-copy mt-3">
                                        No verified achievements yet — they&rsquo;ll appear here as staff
                                        verify your evidence, assessments and milestones.
                                    </p>
                                ) : (
                                    <div className="mt-4 flex flex-col gap-2">
                                        {passportEntries.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between rounded-0 border border-line bg-card px-4 py-2.5"
                                            >
                                                <div>
                                                    <p className="text-[13px] font-semibold">{entry.title}</p>
                                                    <p className="text-[12px] text-brand-muted">{entry.entry_type}</p>
                                                </div>
                                                <span
                                                    className={`text-[11px] font-semibold ${
                                                        entry.status === "verified" ? "text-blue-dark" : "text-destructive"
                                                    }`}
                                                >
                                                    {entry.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {passportStatus === "verified" && (
                                    <div className="mt-5 border-t border-line pt-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                            Sharing
                                        </h4>
                                        <PassportShareManager
                                            passportId={data.passport.id}
                                            shares={passportShares}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Opportunity introductions */}
                    <div className="rounded-lg border border-line bg-light/60 p-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Opportunity introductions
                        </h3>
                        <p className="section-copy mt-2">
                            Introductions to opportunity providers are only made with
                            your consent.
                        </p>
                        {introductions.length === 0 ? (
                            <p className="section-copy mt-3">No introductions yet.</p>
                        ) : (
                            <div className="mt-4 flex flex-col gap-2">
                                {introductions.map((i) => (
                                    <div
                                        key={String(i.id)}
                                        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-0 border border-line bg-card px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-[13px] font-semibold">
                                                {String(i.provider_name)}
                                            </p>
                                            {i.outcome_status ? (
                                                <p className="text-[12px] text-brand-muted">
                                                    Outcome: {String(i.outcome_status)}
                                                    {i.outcome ? ` — ${String(i.outcome)}` : ""}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="ml-auto">
                                            <IntroductionConsent
                                                introductionId={String(i.id)}
                                                status={String(i.status)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Raise a concern */}
                    <div className="rounded-lg border border-line bg-light/60 p-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Raise a concern
                        </h3>
                        <p className="section-copy mt-2">
                            Submit a complaint or safeguarding concern. Only programme
                            administrators can view it.
                        </p>
                        <div className="mt-4">
                            <SafeguardingSubmit />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function dueText(dueAt: unknown): string {
    const ts = Number(dueAt);
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleDateString();
}

function ActionLink({
    href,
    label,
    meta,
    tone,
}: {
    href: string;
    label: string;
    meta: string;
    tone?: "overdue";
}) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between rounded-0 border px-4 py-2.5 transition-colors hover:border-blue/40 ${
                tone === "overdue" ? "border-destructive/40 bg-destructive/5" : "border-line bg-light/60"
            }`}
        >
            <p className="text-[13px] font-semibold">{label}</p>
            <span className={`text-[12px] ${tone === "overdue" ? "text-destructive" : "text-brand-muted"}`}>
                {meta}
            </span>
        </Link>
    );
}
