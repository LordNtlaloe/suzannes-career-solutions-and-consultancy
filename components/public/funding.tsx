import { Banknote } from "lucide-react";

export function Funding() {
    return (
        <section className="container-x py-16 sm:py-20">
            <header className="mx-auto mb-10 max-w-2xl text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    Funding &amp; resource mobilisation
                </span>
                <h2 className="section-heading mt-3 text-ink">
                    A diversified funding model.
                </h2>
            </header>

            <div className="flex flex-wrap justify-center gap-3">
                {[
                    "Unrestricted institutional grants",
                    "Restricted programme grants",
                    "Corporate social investment",
                    "Philanthropic donations",
                    "Sponsorship of cohorts, equipment & events",
                    "In-kind expert volunteering",
                    "Approved service / project income",
                ].map((stream) => (
                    <span
                        key={stream}
                        className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/5 px-5 py-2.5 text-[13px] font-semibold text-blue-dark dark:border-blue/30 dark:text-blue-light"
                    >
                        <Banknote className="h-4 w-4" strokeWidth={1.75} />
                        {stream}
                    </span>
                ))}
            </div>

            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 text-[14px] leading-[1.9] text-black/70 dark:text-white/70">
                <p>
                    Schools Bootcamp registration fees will help cover delivery
                    costs, with sponsorship sought for bursaries and access support.
                    Funds for participant stipends will be ring-fenced and disbursed
                    only under approved eligibility and accountability rules. No
                    prospective partner or funding source is presented as committed.
                </p>
            </div>
        </section>
    );
}
