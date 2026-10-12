import { redirect } from "next/navigation";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canReviewApplications, staffAssignmentsWithRole } from "@/lib/step/access-rules";
import {
    countApplicationsForReview,
    listApplicationsForReview,
    listReviewers,
} from "@/db/queries/step/applications";
import { listCycles } from "@/db/queries/step/cycles";
import { getStepCohorts } from "@/db/queries/step/cycles";
import { PATHWAYS } from "@/lib/step/constants";
import { stepPageMetadata } from "@/lib/step/metadata";
import { ApplicationsBrowser } from "@/components/step/applications-browser";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/applications",
        title: "STEP Applications",
        description: "Review and manage STEP applications.",
    });
}

type SearchParams = Promise<{
    page?: string;
    status?: string;
    cycle?: string;
    cohort?: string;
    pathway?: string;
    q?: string;
    from?: string;
}>;

export default async function StepAdminApplicationsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const sp = await searchParams;
    const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
    const pageSize = 20;
    const status = sp.status ?? "all";

    const { user, context } = await getStepAccessContext();
    if (!user || !canReviewApplications(context)) redirect("/");

    // Authorised cycle scope: global staff see everything; scoped staff see
    // only their cycles. Only review-capable assignments contribute scope.
    const reviewAssignments = staffAssignmentsWithRole(context, [
        "programme_admin",
        "coordinator",
        "reviewer",
    ]);
    const scopedCycleIds = reviewAssignments
        .filter((a) => a.cycle_id !== null)
        .map((a) => a.cycle_id as string);
    const hasGlobal = reviewAssignments.some((a) => a.cycle_id === null);

    const [allCycles, cohorts, reviewers] = await Promise.all([
        listCycles(),
        getStepCohorts(),
        listReviewers(),
    ]);
    const visibleCycles = hasGlobal
        ? allCycles
        : allCycles.filter((c) => scopedCycleIds.includes(c.id));

    let cycleId: string | null = null;
    if (hasGlobal && sp.cycle && sp.cycle !== "all") {
        cycleId = sp.cycle;
    } else if (!hasGlobal && sp.cycle && scopedCycleIds.includes(sp.cycle)) {
        cycleId = sp.cycle;
    } else if (!hasGlobal && scopedCycleIds.length > 0) {
        cycleId = scopedCycleIds[0];
    }

    const cohortId = sp.cohort && sp.cohort !== "all" ? sp.cohort : null;
    const pathway = sp.pathway && sp.pathway !== "all" ? sp.pathway : undefined;
    const q = sp.q?.trim() || undefined;
    const submittedAfter = sp.from ? Math.floor(new Date(sp.from).getTime() / 1000) : null;

    const [applications, total] = await Promise.all([
        listApplicationsForReview({
            status: status === "all" ? undefined : status,
            cycleId,
            cohortId,
            pathway,
            q,
            submittedAfter,
            limit: pageSize,
            offset: (page - 1) * pageSize,
        }),
        countApplicationsForReview({
            status: status === "all" ? undefined : status,
            cycleId,
            cohortId,
            pathway,
            q,
            submittedAfter,
        }),
    ]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold">Applications</h2>
            <ApplicationsBrowser
                applications={applications}
                total={total}
                page={page}
                pageSize={pageSize}
                status={status}
                cycleId={cycleId ?? "all"}
                cohortId={cohortId ?? "all"}
                pathway={pathway ?? "all"}
                q={sp.q ?? ""}
                from={sp.from ?? ""}
                cycles={visibleCycles}
                cohorts={cohorts}
                pathways={PATHWAYS as unknown as { value: string; label: string }[]}
                reviewers={
                    reviewers as unknown as {
                        id: string;
                        name?: string | null;
                        email?: string | null;
                    }[]
                }
            />
        </div>
    );
}
