import Link from "next/link";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import {
    canAccessAdminTools,
    canManageIntroductions,
    canManagePartners,
    stepRoleKeys,
} from "@/lib/step/access-rules";
import { stepBasePath } from "@/lib/step/config";
import { StepPathProvider } from "@/components/step/step-path-provider";
import { StepNav } from "@/components/step/step-nav";

export default async function StepLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const basePath = stepBasePath(host);

    const { user, context } = await getStepAccessContext();

    return (
        <StepPathProvider basePath={basePath}>
            <main className="flex min-h-full flex-col">
                <StepNav
                    signedIn={!!user}
                    userName={user?.name}
                    roles={stepRoleKeys(context)}
                    hasAdminTools={canAccessAdminTools(context)}
                    hasPartners={
                        canManagePartners(context) || canManageIntroductions(context)
                    }
                />
                <div className="flex-1">{children}</div>
                <footer className="border-t border-line bg-light py-10">
                    <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[13px] text-brand-muted">
                            STEP &mdash; Skills, Talent &amp; Employment Pathway. A
                            six-month incubation and opportunity pathway for 600
                            Basotho participants.
                        </p>
                        <Link
                            href="/contact"
                            className="text-[12px] font-semibold text-blue-dark transition-opacity hover:opacity-70"
                        >
                            Contact the programme team
                        </Link>
                    </div>
                </footer>
            </main>
        </StepPathProvider>
    );
}
