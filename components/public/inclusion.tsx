import { Accessibility, Leaf, ShieldCheck } from "lucide-react";

export function Inclusion() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <header className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Inclusion, safeguarding &amp; ESG
                    </span>
                    <h2 className="section-heading mt-3 text-ink">
                        Accessible, safe and responsibly run.
                    </h2>
                </header>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                        {
                            icon: Accessibility,
                            title: "Social inclusion & access",
                            text: "Accessible application routes, low-bandwidth learning options, flexible participation for young parents and rural participants, reasonable accommodations for persons with disabilities and transparent fee support for disadvantaged learners. Participants will not be excluded solely because they did not attend CEYS.",
                        },
                        {
                            icon: Leaf,
                            title: "Environmental responsibility",
                            text: "Blended delivery and remote mentoring will reduce unnecessary travel. Creative and enterprise training will include resource efficiency, responsible sourcing, waste reduction and awareness of sustainable production and consumption.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "Governance & ethical practice",
                            text: "Policies will cover child safeguarding, anti-harassment, fair selection, financial integrity, procurement, conflicts of interest, whistleblowing, data privacy and ethical use of participant work — with a clear legal and financial separation from SCS Consultancy.",
                        },
                    ].map(({ icon: Icon, title, text }) => (
                        <div
                            key={title}
                            className="rounded-lg border border-line border-t-4 border-t-blue bg-card p-7"
                        >
                            <span className="grid size-12 place-items-center rounded-full border border-blue/25 bg-blue/5">
                                <Icon
                                    className="h-5 w-5 text-blue-dark dark:text-blue-light"
                                    strokeWidth={1.75}
                                />
                            </span>
                            <h3 className="mt-5 text-[15px] font-semibold text-ink dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-3 text-[13px] leading-[1.8] text-black/60 dark:text-white/60">
                                {text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
