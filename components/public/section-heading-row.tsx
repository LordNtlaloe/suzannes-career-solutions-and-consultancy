import type { ReactNode } from "react";

export function SectionHeadingRow({
    heading,
    action,
}: {
    heading: ReactNode;
    action: ReactNode;
}) {
    return (
        <div className="flex items-end justify-between gap-[30px]">
            <h2 className="section-heading">{heading}</h2>
            <div className="mb-[10px]">{action}</div>
        </div>
    );
}