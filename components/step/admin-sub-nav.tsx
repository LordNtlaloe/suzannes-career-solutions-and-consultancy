"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStepPath } from "@/components/step/step-path-provider";

const ITEMS = [
    { key: "overview", label: "Overview", href: "/dashboard/admin" },
    { key: "applications", label: "Applications", href: "/admin/applications" },
    { key: "evidence", label: "Evidence", href: "/admin/evidence" },
    { key: "progression", label: "Progression", href: "/admin/progression" },
    { key: "cohorts", label: "Cohorts", href: "/admin/cohorts" },
    { key: "staff", label: "Staff", href: "/admin/staff" },
    { key: "reporting", label: "Reporting", href: "/admin/reporting" },
    { key: "safeguarding", label: "Safeguarding", href: "/admin/safeguarding" },
] as const;

export type AdminSubNavCounts = {
    applications: number;
    evidence: number;
    progression: number;
};

export function AdminSubNav({
    counts,
    showReporting = true,
    showSafeguarding = false,
}: {
    counts?: AdminSubNavCounts;
    showReporting?: boolean;
    showSafeguarding?: boolean;
}) {
    const { path } = useStepPath();
    const pathname = usePathname();

    const items = ITEMS.filter(
        (i) =>
            (i.key === "reporting" ? showReporting : true) &&
            (i.key === "safeguarding" ? showSafeguarding : true),
    );

    const badgeFor = (key: string): number | null => {
        if (!counts) return null;
        if (key === "applications") return counts.applications;
        if (key === "evidence") return counts.evidence;
        if (key === "progression") return counts.progression;
        return null;
    };

    return (
        <nav
            aria-label="Programme administration"
            className="flex gap-1 overflow-x-auto border-b border-line pb-3"
        >
            {items.map((item) => {
                const href = path(item.href);
                const active = pathname === href;
                const badge = badgeFor(item.key);
                return (
                    <Link
                        key={item.key}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                            active
                                ? "bg-blue/12 text-blue-dark"
                                : "text-brand-muted hover:bg-light hover:text-brand"
                        }`}
                    >
                        {item.label}
                        {badge !== null && badge > 0 && (
                            <span className="rounded-full bg-blue/15 px-1.5 text-[10px] font-bold text-blue-dark">
                                {badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
