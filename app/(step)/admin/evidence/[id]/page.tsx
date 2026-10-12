import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canReviewEvidence } from "@/lib/step/access-rules";
import { getEvidenceById, listEvidenceReviews } from "@/db/queries/step/evidence";
import { getAssignmentById } from "@/db/queries/step/learning";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { EvidenceReviewForm } from "@/components/step/evidence-review-form";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/evidence",
        title: "Review evidence",
        description: "Review a participant evidence submission.",
    });
}

export default async function EvidenceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link(`/admin/evidence/${id}`))}`);

    const evidence = await getEvidenceById(id);
    if (!evidence || !evidence.assignment_id) notFound();

    const [assignment, reviews] = await Promise.all([
        getAssignmentById(evidence.assignment_id),
        listEvidenceReviews(id),
    ]);
    const enrolment = assignment
        ? await getEnrolmentById(String(assignment.enrolment_id))
        : null;

    if (!enrolment || !canReviewEvidence(context, { cycleId: enrolment.cycle_id, cohortId: enrolment.cycle_cohort_id })) {
        redirect(link("/admin/evidence"));
    }

    return (
        <div className="flex flex-col gap-6">
            <Link
                href={link("/admin/evidence")}
                className="text-[12px] font-semibold text-blue-dark transition-opacity hover:opacity-70"
            >
                ← Evidence queue
            </Link>

            <div className="rounded-lg border border-line bg-card p-6">
                <h2 className="text-[16px] font-semibold">{evidence.title}</h2>
                <p className="mt-1 text-[13px] text-brand-muted">
                    {String(assignment?.title ?? "Requirement")} · {evidence.kind}
                </p>

                {evidence.body ? (
                    <div className="mt-4 rounded-0 border border-line bg-light/60 p-4">
                        <p className="text-[13px] whitespace-pre-wrap">{evidence.body}</p>
                    </div>
                ) : null}

                <p className="mt-4 text-[12px] text-brand-muted">
                    Status: {evidence.status}
                </p>
            </div>

            <div className="rounded-lg border border-line bg-card p-6">
                <h3 className="text-[15px] font-semibold">Review history ({reviews.length})</h3>
                <div className="mt-4 flex flex-col gap-3">
                    {reviews.length === 0 ? (
                        <p className="section-copy">No reviews yet.</p>
                    ) : (
                        reviews.map((r) => (
                            <div key={String(r.id)} className="rounded-0 border border-line bg-light/60 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-semibold text-blue-dark">
                                        {String(r.decision).replace("_", " ")}
                                    </span>
                                    <span className="text-[12px] text-brand-muted">
                                        {String(r.reviewer_name ?? "Reviewer")}
                                    </span>
                                </div>
                                {r.feedback ? (
                                    <p className="mt-2 text-[13px]">{String(r.feedback)}</p>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {evidence.status === "submitted" && (
                <EvidenceReviewForm evidenceId={evidence.id} />
            )}
        </div>
    );
}
