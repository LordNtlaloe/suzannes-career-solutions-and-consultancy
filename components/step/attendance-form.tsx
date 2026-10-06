"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordAttendanceAction } from "@/actions/step/mentoring.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AttendanceRow = {
    enrolment_id: string;
    participant_name: string;
    cycle_name?: string | null;
    cohort_name?: string | null;
    attendance_id?: string | null;
    attended?: number | null;
    feedback?: string | null;
};

export function AttendanceForm({
    sessionId,
    rows,
}: {
    sessionId: string;
    rows: AttendanceRow[];
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [state, setState] = useState<Record<string, { attended: boolean; feedback: string }>>(
        () =>
            Object.fromEntries(
                rows.map((r) => [
                    String(r.enrolment_id),
                    { attended: r.attended === 1, feedback: r.feedback ?? "" },
                ]),
            ),
    );

    function record(enrolmentId: string, attended: boolean, feedback: string) {
        setError(null);
        startTransition(async () => {
            try {
                await recordAttendanceAction({
                    sessionId,
                    enrolmentId,
                    attended,
                    feedback: feedback || undefined,
                });
                setState((prev) => ({
                    ...prev,
                    [enrolmentId]: { ...(prev[enrolmentId] ?? { attended: false, feedback: "" }), attended, feedback },
                }));
                toast.success(attended ? "Marked present" : "Marked absent");
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    if (rows.length === 0) {
        return <p className="section-copy">No assigned participants for this session.</p>;
    }

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
                    {error}
                </p>
            )}

            {rows.map((r) => {
                const id = String(r.enrolment_id);
                const row = state[id];
                return (
                    <div
                        key={id}
                        className="flex flex-col gap-3 rounded-md border border-line bg-card p-4"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="text-[14px] font-semibold">{String(r.participant_name)}</p>
                            <span className="text-[12px] text-brand-muted">
                                {String(r.cycle_name ?? "—")} · {String(r.cohort_name ?? "No cohort")}
                            </span>
                            <span
                                className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                    r.attendance_id
                                        ? row.attended
                                            ? "bg-blue/12 text-blue-dark"
                                            : "bg-destructive/10 text-destructive"
                                        : "bg-light text-brand-muted"
                                }`}
                            >
                                {r.attendance_id ? (row.attended ? "Present" : "Absent") : "Not recorded"}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                disabled={pending}
                                onClick={() => record(id, true, row.feedback)}
                            >
                                Mark present
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={pending}
                                onClick={() => record(id, false, row.feedback)}
                            >
                                Mark absent
                            </Button>
                        </div>

                        <Textarea
                            rows={2}
                            value={row.feedback}
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    [id]: { ...(prev[id] ?? { attended: false, feedback: "" }), feedback: e.target.value },
                                }))
                            }
                            placeholder="Session feedback (optional)"
                            className="rounded-md border border-input bg-input/20 px-2 py-1.5 text-[12px] outline-none"
                        />

                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="self-end"
                            disabled={pending || !row.feedback.trim()}
                            onClick={() => record(id, row.attended, row.feedback)}
                        >
                            Save feedback
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
