import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canManageSafeguarding } from "@/lib/step/access-rules";
import {
    listComplaints,
    listConflictDeclarations,
    listSafeguardingReports,
} from "@/db/queries/step/safeguarding";
import { SafeguardingManage } from "@/components/step/safeguarding-manage";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/safeguarding",
        title: "Safeguarding",
        description: "Complaints, safeguarding reports and conflict declarations.",
        noIndex: true,
    });
}

export default async function SafeguardingPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !canManageSafeguarding(context)) redirect(link("/dashboard"));

    const [complaints, reports, declarations] = await Promise.all([
        listComplaints(),
        listSafeguardingReports(),
        listConflictDeclarations(),
    ]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold">
                Safeguarding &amp; complaints
            </h2>
            <p className="text-[12px] text-brand-muted">
                Restricted access — programme administrators only.
            </p>
            <SafeguardingManage
                complaints={complaints.map((c) => ({
                    id: String(c.id),
                    subject: String(c.subject),
                    body: (c.body as string | null) ?? null,
                    status: String(c.status),
                    reporter_name: (c.reporter_name as string | null) ?? null,
                    resolution: (c.resolution as string | null) ?? null,
                }))}
                reports={reports.map((r) => ({
                    id: String(r.id),
                    subject: String(r.subject),
                    body: (r.body as string | null) ?? null,
                    risk_level: String(r.risk_level),
                    status: String(r.status),
                    reporter_name: (r.reporter_name as string | null) ?? null,
                    outcome: (r.outcome as string | null) ?? null,
                }))}
                declarations={declarations.map((d) => ({
                    id: String(d.id),
                    related_party: String(d.related_party),
                    relationship: (d.relationship as string | null) ?? null,
                    interest_type: String(d.interest_type),
                    details: (d.details as string | null) ?? null,
                    status: String(d.status),
                    staff_name: (d.staff_name as string | null) ?? null,
                }))}
            />
        </div>
    );
}
