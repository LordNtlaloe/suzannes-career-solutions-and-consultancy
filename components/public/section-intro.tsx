import type { ReactNode } from "react";

export function SectionIntro({
    heading,
    children,
    className = "",
}: {
    heading: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`grid grid-cols-1 items-start gap-[55px] md:grid-cols-2 ${className}`}
        >
            <h2 className="section-heading">{heading}</h2>
            <p className="section-copy max-w-[550px] pt-[8px] max-md:pt-0">
                {children}
            </p>
        </div>
    );
}