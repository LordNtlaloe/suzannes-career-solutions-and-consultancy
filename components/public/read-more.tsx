import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function ReadMore({
    href,
    children = "Read more",
}: {
    href: string;
    children?: ReactNode;
}) {
    return (
        <Link
            href={href}
            className="text-link-brand mt-[17px] text-blue-dark transition-opacity hover:opacity-70"
        >
            {children}
            <ArrowRight size={16} />
        </Link>
    );
}