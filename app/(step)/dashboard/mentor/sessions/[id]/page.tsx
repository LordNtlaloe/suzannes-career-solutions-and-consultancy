import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isMentor } from "@/lib/step/access-rules";
import {
    getSessionForMentor,
    listSessionAttendance,
} from "@/db/queries/step/mentoring";
import { AttendanceForm } from "@/components/step/attendance-form";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/mentor/sessions",
        title: "Mentoring session",
        description: "Record attendance for your assigned participants.",
    });
}

export default async function MentorSessionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link(`/dashboard/mentor/sessions/${id}`))}`);
    if (!isMentor(context)) redirect(link("/dashboard"));

    const session = await getSessionForMentor(id, user.id);
    if (!session) notFound();

    const rows = await listSessionAttendance(id, user.id);

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Session
                    </span>
                    <h1 className="section-heading">{String(session.title)}</h1>
                    {session.scheduled_at ? (
                        <p className="section-copy">
                            {new Date(Number(session.scheduled_at) * 1000).toLocaleString()}
                        </p>
                    ) : null}
                    {session.cycle_name ? (
                        <p className="section-copy">{String(session.cycle_name)}</p>
                    ) : null}
                </header>

                <AttendanceForm
                    sessionId={id}
                    rows={rows as unknown as Array<{
                        enrolment_id: string;
                        participant_name: string;
                        cycle_name?: string | null;
                        cohort_name?: string | null;
                        attendance_id?: string | null;
                        attended?: number | null;
                        feedback?: string | null;
                    }>}
                />
            </div>
        </section>
    );
}
