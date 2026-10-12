import { ArrowRight, TriangleAlert } from "lucide-react";

const RISKS = [
    { risk: "Funding delays", response: "Stage programme rollout; secure minimum delivery budget before enrolment" },
    { risk: "Limited placement hosts", response: "Do not promise placements; build a host pipeline and use readiness-based matching" },
    { risk: "Volunteer drop-off", response: "Written role descriptions, backups and attendance tracking" },
    { risk: "Digital exclusion", response: "Offline / low-data alternatives and targeted connectivity support" },
    { risk: "Unpaid labour or unsafe placements", response: "Legal review, written learning agreements, supervision, grievance route and host screening" },
    { risk: "Safeguarding or data incidents", response: "Designated focal points, consent, incident protocols and restricted data access" },
];

export function Risks() {
    return (
        <section className="container-x py-16 sm:py-20">
            <header className="mx-auto mb-12 max-w-2xl text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    Risks &amp; mitigation
                </span>
                <h2 className="section-heading mt-3 text-ink">
                    How STEP manages risk.
                </h2>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {RISKS.map(({ risk, response }) => (
                    <div
                        key={risk}
                        className="flex flex-col gap-4 rounded-lg border border-line bg-card p-6"
                    >
                        <div className="flex items-start gap-3">
                            <TriangleAlert
                                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                                strokeWidth={1.75}
                            />
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-amber-600">
                                    Risk
                                </span>
                                <h3 className="text-[15px] font-semibold text-ink dark:text-white">
                                    {risk}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 border-t border-line pt-4">
                            <ArrowRight
                                className="mt-0.5 h-5 w-5 shrink-0 text-blue"
                                strokeWidth={1.75}
                            />
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-blue">
                                    Response
                                </span>
                                <p className="text-[13px] leading-[1.7] text-black/60 dark:text-white/60">
                                    {response}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
