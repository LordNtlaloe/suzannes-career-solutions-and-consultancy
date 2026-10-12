import { NextResponse } from "next/server";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isProgrammeAdmin } from "@/lib/step/access-rules";
import { stepReporting } from "@/db/queries/step/dashboards";

function csvCell(value: unknown): string {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(values: unknown[]): string {
    return values.map(csvCell).join(",");
}

export async function GET() {
    const { user, context } = await getStepAccessContext();
    if (!user || !isProgrammeAdmin(context)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await stepReporting();
    const reach = data.reach as Record<string, unknown>;
    const byLevel = data.byLevel as Record<string, unknown>[];
    const byCohort = data.byCohort as Record<string, unknown>[];

    const lines: string[] = [];
    lines.push(csvRow(["section", "metric", "value"]));
    lines.push(csvRow(["reach", "applications", reach.applications]));
    lines.push(csvRow(["reach", "submitted", reach.submitted]));
    lines.push(csvRow(["reach", "admitted", reach.admitted]));
    lines.push(csvRow(["reach", "rejected", reach.rejected]));
    lines.push(csvRow(["reach", "enrolled", data.enrolled]));
    lines.push(csvRow(["reach", "exits", data.exits]));
    lines.push(csvRow(["reach", "overdue_assignments", data.overdueAssignments]));

    lines.push("");
    lines.push(csvRow(["section", "level", "count"]));
    for (const row of byLevel) {
        lines.push(csvRow(["level", row.level, row.c ?? 0]));
    }

    lines.push("");
    lines.push(csvRow(["section", "cycle", "cohort", "enrolled", "graduates"]));
    for (const row of byCohort) {
        lines.push(
            csvRow([
                "cohort",
                row.cycle_name ?? "",
                row.cohort_name ?? "",
                row.enrolled ?? 0,
                row.graduates ?? 0,
            ]),
        );
    }

    const csv = lines.join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="step-reporting-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}
