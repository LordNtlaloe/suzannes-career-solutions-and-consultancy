import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canRecordProgression, staffAssignmentsWithRole } from "@/lib/step/access-rules";
import {
    countEnrolmentsForScope,
    listEnrolmentsForScope,
} from "@/db/queries/step/enrolments";
import { getReadinessRequirements } from "@/db/queries/step/progression";
import { levelLabel } from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { ProgressionForm } from "@/components/step/progression-form";
import { PARTICIPANT_LEVELS } from "@/lib/step/constants";

const LEVEL_ORDER: string[] = PARTICIPANT_LEVELS.map((l) => l.value);

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/progression",
        title: "Progression",
        description: "Record evidence-based readiness advancement.",
    });
}

export default async function ProgressionPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !canRecordProgression(context)) redirect(link("/dashboard"));

    const progressionAssignments = staffAssignmentsWithRole(context, [
        "programme_admin",
        "coordinator",
    ]);
    const hasGlobal = progressionAssignments.some((a) => a.cycle_id === null);
    const scopedCycleIds = progressionAssignments
        .filter((a) => a.cycle_id !== null)
        .map((a) => a.cycle_id as string);
    const cycleId = hasGlobal ? null : scopedCycleIds[0] ?? null;

    const [enrolments, total] = await Promise.all([
        listEnrolmentsForScope({ cycleId, limit: 50, offset: 0 }),
        countEnrolmentsForScope({ cycleId }),
    ]);

    const rows = await Promise.all(
        enrolments.map(async (enrolment) => {
            const currentLevel = String(enrolment.level);
            const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel) + 1] ?? null;
            if (!nextLevel) return { enrolment, currentLevel, nextLevel, unmet: 0, readiness: null };
            const readiness = await getReadinessRequirements(String(enrolment.id), nextLevel);
            const unmetRequirements = readiness.requirements.filter(
                (r) => !["completed", "waived"].includes(String(r.assignment_status ?? "")),
            );
            const unmetAssessments = readiness.assessments.filter(
                (a) => String(a.latest_status ?? "") !== "passed",
            );
            return {
                enrolment,
                currentLevel,
                nextLevel,
                unmet: unmetRequirements.length + unmetAssessments.length,
                readiness: { requirements: unmetRequirements, assessments: unmetAssessments },
            };
        }),
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">
                    Enrolled participants ({total})
                </h2>
            </div>

            <div className="flex flex-col gap-4">
                {rows.length === 0 ? (
                    <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                        No enrolled participants in your scope.
                    </p>
                ) : (
                    rows.map(({ enrolment, currentLevel, nextLevel, unmet, readiness }) => (
                        <div
                            key={String(enrolment.id)}
                            className="rounded-lg border border-line bg-card p-5"
                        >
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                <p className="text-[14px] font-semibold">
                                    {String(enrolment.participant_name)}
                                </p>
                                <span className="text-[12px] text-brand-muted">
                                    {String(enrolment.cycle_name)} · {String(enrolment.cohort_name ?? "No cohort")}
                                </span>
                                <span className="ml-auto rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                                    {levelLabel(currentLevel)}
                                </span>
                            </div>

                            {nextLevel ? (
                                <p className="mt-2 text-[12px] text-brand-muted">
                                    Next: {levelLabel(nextLevel)} — {unmet} unmet requirement{unmet === 1 ? "" : "s"}
                                </p>
                            ) : (
                                <p className="mt-2 text-[12px] text-brand-muted">
                                    Graduate — no further levels.
                                </p>
                            )}

                            {nextLevel && readiness && unmet > 0 && (
                                <div className="mt-3 flex flex-col gap-2 rounded-md border border-line bg-light/60 p-3">
                                    {readiness.requirements.map((r) => (
                                        <div
                                            key={String(r.id)}
                                            className="flex items-center justify-between gap-3 text-[12px]"
                                        >
                                            <span>{String(r.title)}</span>
                                            <span className="text-brand-muted">
                                                {String(r.assignment_status ?? "not assigned")}
                                            </span>
                                        </div>
                                    ))}
                                    {readiness.assessments.map((a) => (
                                        <div
                                            key={String(a.id)}
                                            className="flex items-center justify-between gap-3 text-[12px]"
                                        >
                                            <span>{String(a.title)}</span>
                                            <span className="text-brand-muted">
                                                {String(a.latest_status ?? "not attempted")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {nextLevel && (
                                <div className="mt-3">
                                    <ProgressionForm
                                        enrolmentId={String(enrolment.id)}
                                        currentLevel={currentLevel}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
