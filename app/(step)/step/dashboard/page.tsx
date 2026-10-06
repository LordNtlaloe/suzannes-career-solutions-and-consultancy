import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { hasAnyStepRole, stepRoleKeys } from "@/lib/step/access-rules";
import { getLatestApplicationByUser } from "@/db/queries/step/applications";
import { applicationStatusLabel } from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard",
        title: "STEP Dashboard",
        description: "Your STEP programme workspace.",
    });
}

export default async function StepDashboardEntry() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();

    if (!user) {
        redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard"))}`);
    }

    // No STEP responsibility: show application status or an entry point.
    if (!hasAnyStepRole(context)) {
        const application = await getLatestApplicationByUser(user.id);
        return (
            <section className="container-x py-14 sm:py-20">
                <div className="mx-auto max-w-2xl rounded-lg border border-line bg-light/60 p-8">
                    <h1 className="section-heading text-center">Your STEP application.</h1>
                    {application ? (
                        <div className="mt-5 flex flex-col gap-3">
                            <div className="mx-auto rounded-full bg-blue/12 px-4 py-1 text-[12px] font-semibold text-blue-dark">
                                {applicationStatusLabel(application.status)}
                            </div>

                            <dl className="mx-auto flex flex-wrap justify-center gap-x-8 gap-y-1 text-[12px] text-brand-muted">
                                {application.submitted_at ? (
                                    <div>
                                        Submitted{" "}
                                        {new Date(Number(application.submitted_at) * 1000).toLocaleDateString()}
                                    </div>
                                ) : null}
                                {application.reviewed_at ? (
                                    <div>
                                        Reviewed{" "}
                                        {new Date(Number(application.reviewed_at) * 1000).toLocaleDateString()}
                                    </div>
                                ) : null}
                            </dl>

                            {application.feedback ? (
                                <div className="rounded-md border border-line bg-card p-4 text-left">
                                    <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                        Feedback from the review team
                                    </p>
                                    <p className="section-copy mt-1.5">{application.feedback}</p>
                                </div>
                            ) : null}

                            {application.status === "draft" ? (
                                <p className="section-copy text-center">
                                    You have a draft — finish it when you&rsquo;re ready.
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="section-copy mt-3 text-center">
                            You haven&rsquo;t applied to STEP yet.
                        </p>
                    )}
                    <div className="mt-6 text-center">
                        <Link href={link("/apply")} className="btn-brand inline-flex">
                            {application?.status === "draft" ? "Continue application" : application ? "Review application" : "Apply now"}
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const roleLabels: Record<string, string> = {
        participant: "Participant",
        staff: "Staff",
        mentor: "Mentor",
        admin: "Programme admin",
    };
    const roles = stepRoleKeys(context).map((key) => ({ key, label: roleLabels[key] }));

    // Single responsibility → go straight to its view.
    if (roles.length === 1) {
        redirect(link(`/dashboard/${roles[0].key}`));
    }

    return (
        <section className="container-x py-14 sm:py-20">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Dashboard
                    </span>
                    <h1 className="section-heading">Choose a workspace.</h1>
                    <p className="section-copy">
                        You hold several STEP responsibilities. Pick the view you want.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {roles.map((role) => (
                        <Link
                            key={role.key}
                            href={link(`/dashboard/${role.key}`)}
                            className="rounded-lg border border-line bg-card p-6 transition-colors hover:border-blue/40"
                        >
                            <p className="text-[15px] font-semibold">{role.label}</p>
                            <p className="section-copy mt-1">
                                Open the {role.label.toLowerCase()} workspace.
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
