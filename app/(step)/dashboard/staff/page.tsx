import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canAccessAdminTools, canReviewApplications, isStaff } from "@/lib/step/access-rules";
import { staffDashboard } from "@/db/queries/step/dashboards";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/staff",
        title: "Staff Dashboard",
        description: "STEP review queues and progression.",
    });
}

export default async function StaffDashboardPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard/staff"))}`);
    if (!isStaff(context)) redirect(link("/dashboard"));

    const hasGlobalScope = context.staffAssignments.some((a) => a.cycle_id === null);
    const scope = {
        cycleId: hasGlobalScope ? null : context.staffAssignments[0]?.cycle_id ?? null,
        cohortId: null,
    };
    const data = await staffDashboard(scope);

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Staff
                    </span>
                    <h1 className="section-heading">Review queues.</h1>
                </header>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Applications" value={data.applicationQueue} />
                    <Stat label="Evidence" value={data.evidenceQueue} />
                    <Stat label="Overdue" value={data.overdueAssignments} />
                    <Stat label="Candidates" value={data.progressionCandidates} />
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    {canReviewApplications(context) && (
                        <Link href={link("/admin/applications")} className="text-link-brand text-blue-dark">
                            Review applications →
                        </Link>
                    )}
                    {canAccessAdminTools(context) && (
                        <Link href={link("/admin")} className="text-link-brand text-blue-dark">
                            Programme administration →
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-line bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-muted">
                {label}
            </p>
            <p className="text-[22px] font-semibold">{value}</p>
        </div>
    );
}
