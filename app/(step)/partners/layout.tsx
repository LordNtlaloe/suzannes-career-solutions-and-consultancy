import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import {
    canManageIntroductions,
    canManagePartners,
} from "@/lib/step/access-rules";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/partners",
        title: "Partners & introductions",
        description: "Partner records and consented opportunity introductions.",
    });
}

export default async function PartnersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) {
        redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/partners"))}`);
    }
    if (!canManagePartners(context) && !canManageIntroductions(context)) {
        redirect(link("/dashboard"));
    }

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="flex flex-wrap items-center gap-3 pb-4">
                <h1 className="text-[16px] font-semibold">Partners &amp; introductions</h1>
                <Link
                    href={link("/dashboard")}
                    className="ml-auto text-[12px] text-brand-muted transition-colors hover:text-brand"
                >
                    Back to dashboard
                </Link>
            </div>

            <nav aria-label="Partners" className="flex gap-1 overflow-x-auto border-b border-line pb-3">
                <Link
                    href={link("/partners")}
                    className="rounded-0 bg-blue/12 px-3 py-1.5 text-[12px] font-semibold text-blue-dark"
                >
                    Partners
                </Link>
                {canManageIntroductions(context) && (
                    <Link
                        href={link("/partners/introductions")}
                        className="rounded-0 px-3 py-1.5 text-[12px] font-semibold text-brand-muted transition-colors hover:bg-light hover:text-brand"
                    >
                        Introductions
                    </Link>
                )}
            </nav>

            <div className="pt-6">{children}</div>
        </section>
    );
}
