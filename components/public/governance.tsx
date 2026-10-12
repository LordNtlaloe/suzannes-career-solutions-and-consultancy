import { Landmark, UserCog } from "lucide-react";

export function Governance() {
    return (
        <section className="container-x py-16 sm:py-20">
            <header className="mx-auto mb-12 max-w-2xl text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    Institutional structure
                </span>
                <h2 className="section-heading mt-3 text-ink">
                    Governed, accountable and independent.
                </h2>
                <p className="mt-4 text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                    STEP is proposed as an independent non-profit organisation to be
                    registered in Lesotho.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-line bg-card p-8">
                    <span className="grid size-12 place-items-center rounded-full border border-blue/25 bg-blue/5">
                        <Landmark
                            className="h-5 w-5 text-blue-dark dark:text-blue-light"
                            strokeWidth={1.75}
                        />
                    </span>
                    <h3 className="mt-5 text-[18px] font-semibold text-ink dark:text-white">
                        Proposed ten-member Board
                    </h3>
                    <p className="mt-3 text-[14px] leading-[26px] text-black/60 dark:text-white/60">
                        Oversees strategy, risk, financial integrity, safeguarding
                        and performance, subject to the final governance framework.
                    </p>
                </div>
                <div className="rounded-lg border border-line bg-card p-8">
                    <span className="grid size-12 place-items-center rounded-full border border-blue/25 bg-blue/5">
                        <UserCog
                            className="h-5 w-5 text-blue-dark dark:text-blue-light"
                            strokeWidth={1.75}
                        />
                    </span>
                    <h3 className="mt-5 text-[18px] font-semibold text-ink dark:text-white">
                        Founding Executive Director
                    </h3>
                    <p className="mt-3 text-[14px] leading-[26px] text-black/60 dark:text-white/60">
                        Leads daily operations and the portfolio for partnerships,
                        proposal development, resource mobilisation and innovation.
                    </p>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-[13px] font-semibold text-ink dark:text-white">
                    Proposed governance expertise
                </h3>
                <div className="mt-4 flex flex-wrap gap-2.5">
                    {[
                        "Independent chair",
                        "Finance and audit",
                        "Legal and compliance",
                        "Human capital and employer relations",
                        "Education and curriculum",
                        "Digital innovation",
                        "Entrepreneurship and creative economy",
                        "Inclusion and safeguarding",
                        "Monitoring, evaluation and learning",
                        "Strategic partnerships / resource mobilisation",
                    ].map((area) => (
                        <span
                            key={area}
                            className="rounded-full border border-blue/25 bg-blue/5 px-4 py-2 text-[12px] font-medium text-blue-dark dark:border-blue/30 dark:text-blue-light"
                        >
                            {area}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
