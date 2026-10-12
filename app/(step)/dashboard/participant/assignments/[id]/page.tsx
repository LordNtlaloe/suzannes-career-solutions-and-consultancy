import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { participantCanAccessEnrolment } from "@/lib/step/access-rules";
import { getAssignmentDetail } from "@/db/queries/step/learning";
import {
    listEvidenceForAssignment,
    listEvidenceReviews,
} from "@/db/queries/step/evidence";
import { levelLabel } from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { EvidenceSubmitForm } from "@/components/step/evidence-submit-form";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/participant",
        title: "Assignment",
        description: "A STEP learning assignment.",
    });
}

export default async function AssignmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard/participant"))}`);

    const assignment = await getAssignmentDetail(id);
    if (!assignment) notFound();

    const enrolmentId = String(assignment.enrolment_id);
    if (!participantCanAccessEnrolment(context, enrolmentId)) {
        redirect(link("/dashboard/participant"));
    }

    const evidence = await listEvidenceForAssignment(id);
    const withReviews = await Promise.all(
        evidence.map(async (ev) => ({
            evidence: ev,
            reviews: await listEvidenceReviews(String(ev.id)),
        })),
    );

    const status = String(assignment.status);
    const canSubmit = status !== "completed" && status !== "waived";

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-2xl">
                <Link
                    href={link("/dashboard/participant")}
                    className="text-[12px] font-semibold text-blue-dark transition-opacity hover:opacity-70"
                >
                    ← Your dashboard
                </Link>

                <div className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <h1 className="text-[16px] font-semibold">{String(assignment.title)}</h1>
                        <span className="rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                            {levelLabel(String(assignment.level))}
                        </span>
                        <span className="ml-auto text-[12px] font-semibold text-brand-muted">
                            {status}
                        </span>
                    </div>

                    {assignment.description ? (
                        <p className="text-[14px] leading-relaxed">{String(assignment.description)}</p>
                    ) : null}

                    {assignment.completion_criteria ? (
                        <div className="rounded-md border border-line bg-light/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                Completion criteria
                            </p>
                            <p className="mt-1 text-[13px]">{String(assignment.completion_criteria)}</p>
                        </div>
                    ) : null}

                    {assignment.resource_url ? (
                        <a
                            href={String(assignment.resource_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] font-semibold text-blue-dark underline underline-offset-4"
                        >
                            Open course / resource →
                        </a>
                    ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-[15px] font-semibold">
                        Submissions ({withReviews.length})
                    </h2>
                    {withReviews.length === 0 ? (
                        <p className="rounded-lg border border-line bg-light/60 p-6 text-center section-copy">
                            No submissions yet.
                        </p>
                    ) : (
                        withReviews.map(({ evidence: ev, reviews }) => {
                            const latest = reviews[reviews.length - 1];
                            return (
                                <div key={String(ev.id)} className="rounded-lg border border-line bg-card p-5">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-[14px] font-semibold">{String(ev.title)}</p>
                                        <span className="text-[12px] font-semibold text-blue-dark">
                                            {String(ev.status)}
                                        </span>
                                    </div>
                                    {ev.body ? (
                                        <p className="mt-2 text-[13px] whitespace-pre-wrap">{String(ev.body)}</p>
                                    ) : null}
                                    {latest?.feedback ? (
                                        <div className="mt-3 rounded-md border border-line bg-light/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                                {String(latest.decision).replace("_", " ")}
                                            </p>
                                            <p className="mt-1 text-[13px]">{String(latest.feedback)}</p>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>

                {canSubmit && <EvidenceSubmitForm assignmentId={id} />}
            </div>
        </section>
    );
}
