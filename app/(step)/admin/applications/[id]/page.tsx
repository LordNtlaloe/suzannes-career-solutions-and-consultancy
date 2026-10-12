import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canReviewApplications } from "@/lib/step/access-rules";
import { getApplicationForReview } from "@/db/queries/step/applications";
import {
    applicationStatusLabel,
    participantGroupLabel,
    pathwayLabel,
} from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { ApplicationReviewForm } from "@/components/step/application-review-form";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/applications",
        title: "Review application",
        description: "Review a STEP application.",
    });
}

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link(`/admin/applications/${id}`))}`);

    const application = await getApplicationForReview(id);
    if (!application) notFound();

    if (!canReviewApplications(context, { cycleId: (application.cycle_id as string) ?? undefined })) {
        redirect(link("/admin/applications"));
    }

    const status = String(application.status);
    const actionable = ["submitted", "under_review"].includes(status);

    return (
        <div className="flex flex-col gap-6">
            <Link
                href={link("/admin/applications")}
                className="text-[12px] font-semibold text-blue-dark transition-opacity hover:opacity-70"
            >
                ← All applications
            </Link>

            <div className="rounded-lg border border-line bg-card p-6">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                    <h2 className="text-[16px] font-semibold">
                        {String(application.applicant_name ?? "Applicant")}
                    </h2>
                    <span className="text-[13px] text-brand-muted">
                        {String(application.applicant_email ?? "")}
                    </span>
                    <span className="ml-auto text-[13px] font-semibold text-blue-dark">
                        {applicationStatusLabel(status)}
                    </span>
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Cohort" value={String(application.cohort_name ?? "No preference")} />
                    <Field label="Pathway" value={pathwayLabel(String(application.pathway))} />
                    <Field label="Group" value={participantGroupLabel(String(application.participant_group))} />
                </dl>

                <div className="mt-6 flex flex-col gap-4">
                    <Section title="Career or enterprise goals" body={String(application.goals || "—")} />
                    <Section title="Where they are today" body={String(application.baseline || "—")} />
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-[12px] text-brand-muted">
                    <span>
                        Contact consent: {application.consent_contact ? "Yes" : "No"}
                    </span>
                    <span>Data consent: {application.consent_data ? "Yes" : "No"}</span>
                    <span>Programme consent: {application.consent_programme ? "Yes" : "No"}</span>
                </div>

                {application.review_note ? (
                    <div className="mt-6 rounded-md border border-line bg-light/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Private review note
                        </p>
                        <p className="mt-1 text-[13px]">{String(application.review_note)}</p>
                    </div>
                ) : null}
            </div>

            {actionable ? (
                <ApplicationReviewForm applicationId={application.id as string} />
            ) : (
                <p className="rounded-md border border-line bg-light/60 p-4 text-[13px] text-brand-muted">
                    This application has already been {applicationStatusLabel(status).toLowerCase()}.
                </p>
            )}
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-[10px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                {label}
            </dt>
            <dd className="text-[14px] font-semibold">{value}</dd>
        </div>
    );
}

function Section({ title, body }: { title: string; body: string }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                {title}
            </p>
            <p className="text-[14px] leading-relaxed">{body}</p>
        </div>
    );
}
