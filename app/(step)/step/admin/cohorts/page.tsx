import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canManageEnrolments } from "@/lib/step/access-rules";
import { listCycleCohorts } from "@/db/queries/step/cycles";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/cohorts",
        title: "Cohorts & capacity",
        description: "Cohort capacity and enrolment counts.",
    });
}

export default async function CohortsPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !canManageEnrolments(context)) redirect(link("/dashboard"));

    const cohorts = await listCycleCohorts();
    const totalEnrolled = cohorts.reduce(
        (sum, c) => sum + Number(c.enrolled_count ?? 0),
        0,
    );
    const totalCapacity = cohorts.reduce(
        (sum, c) => sum + Number(c.capacity ?? 0),
        0,
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-line bg-card p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-muted">
                        Enrolled
                    </p>
                    <p className="text-[22px] font-semibold">{totalEnrolled}</p>
                </div>
                <div className="rounded-lg border border-line bg-card p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-muted">
                        Cohort capacity
                    </p>
                    <p className="text-[22px] font-semibold">{totalCapacity}</p>
                </div>
                <div className="rounded-lg border border-line bg-card p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-muted">
                        Overall target
                    </p>
                    <p className="text-[22px] font-semibold">600</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-light">
                        <div
                            className="h-full rounded-full bg-blue"
                            style={{ width: `${Math.min(100, Math.round((totalEnrolled / 600) * 100))}%` }}
                        />
                    </div>
                    <p className="mt-1 text-[11px] text-brand-muted">
                        {totalEnrolled} of 600 enrolled
                    </p>
                </div>
            </div>

            {cohorts.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No cohorts configured yet.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {cohorts.map((c) => {
                        const enrolled = Number(c.enrolled_count ?? 0);
                        const capacity = Number(c.capacity ?? 0);
                        const pct = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
                        return (
                            <div
                                key={String(c.id)}
                                className="rounded-lg border border-line bg-card p-5"
                            >
                                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                    <p className="text-[14px] font-semibold">
                                        {String(c.cohort_name)}
                                    </p>
                                    <span className="text-[12px] text-brand-muted">
                                        {String(c.cycle_name)}
                                    </span>
                                    <span className="ml-auto text-[12px] font-semibold text-blue-dark">
                                        {enrolled} / {capacity || "—"}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-light">
                                    <div
                                        className="h-full rounded-full bg-blue"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
