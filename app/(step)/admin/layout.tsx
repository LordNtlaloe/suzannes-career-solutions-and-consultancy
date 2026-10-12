import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import {
    canAccessAdminTools,
    isProgrammeAdmin,
    staffAssignmentsWithRole,
} from "@/lib/step/access-rules";
import { staffDashboard } from "@/db/queries/step/dashboards";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { AdminSubNav } from "@/components/step/admin-sub-nav";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin",
        title: "STEP Admin",
        description: "Programme administration for STEP.",
    });
}

export default async function StepAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();

    if (!user) {
        redirect(
            `/sign-in?callbackUrl=${encodeURIComponent(link("/admin"))}`,
        );
    }

    // STEP permissions are scoped and independent of blog roles. Mentors and
    // partner liaisons do not get the administration tools.
    if (!canAccessAdminTools(context)) {
        redirect(link("/dashboard"));
    }

    // Queue counters for the sub-nav, scoped to the caller's review roles.
    const reviewAssignments = staffAssignmentsWithRole(context, [
        "programme_admin",
        "coordinator",
        "reviewer",
    ]);
    const hasGlobal = reviewAssignments.some((a) => a.cycle_id === null);
    const scopeCycleId = hasGlobal
        ? null
        : (reviewAssignments[0]?.cycle_id ?? null);
    const counts = await staffDashboard({ cycleId: scopeCycleId, cohortId: null });

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="flex flex-wrap items-center gap-3 pb-4">
                <h1 className="text-[16px] font-semibold">Programme administration</h1>
                <Link
                    href={link("/dashboard")}
                    className="ml-auto text-[12px] text-brand-muted transition-colors hover:text-brand"
                >
                    Back to dashboard
                </Link>
            </div>

            <AdminSubNav
                counts={{
                    applications: counts.applicationQueue,
                    evidence: counts.evidenceQueue,
                    progression: counts.progressionCandidates,
                }}
                showReporting={isProgrammeAdmin(context)}
                showSafeguarding={isProgrammeAdmin(context)}
            />

            <div className="pt-6">{children}</div>
        </section>
    );
}
