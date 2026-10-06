import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canAdministerStaff } from "@/lib/step/access-rules";
import { listStaffAssignments } from "@/db/queries/step/dashboards";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/staff",
        title: "Staff access",
        description: "Active STEP staff assignments.",
    });
}

export default async function StaffPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !canAdministerStaff(context)) redirect(link("/dashboard"));

    const staff = await listStaffAssignments();

    return (
        <div className="flex flex-col gap-4">
            {staff.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No active staff assignments.
                </p>
            ) : (
                staff.map((s) => (
                    <div
                        key={String(s.id)}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-card px-4 py-3"
                    >
                        <div>
                            <p className="text-[14px] font-semibold">
                                {String(s.staff_name ?? s.staff_email ?? s.user_id)}
                            </p>
                            {s.staff_email ? (
                                <p className="text-[12px] text-brand-muted">
                                    {String(s.staff_email)}
                                </p>
                            ) : null}
                        </div>
                        <span className="ml-auto rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                            {String(s.role)}
                        </span>
                        <span className="text-[11px] text-brand-muted">
                            {s.cycle_id ? `Cycle: ${String(s.cycle_id)}` : "Global scope"}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
}
