const STEPS = [
    {
        title: "Intro call",
        body: "Twenty minutes. We learn what you're after, and you learn whether we're a fit.",
    },
    {
        title: "Deep dive",
        body: "A longer session — role, team, comp, timing, and the parts that usually get left unsaid.",
    },
    {
        title: "Search or preparation",
        body: "We either run a targeted search or get you ready to run your own.",
    },
    {
        title: "Offer & follow-through",
        body: "We stay in the room through negotiation and the first ninety days.",
    },
]

export function Process() {
    return (
        <section
            id="process"
            className="scroll-mt-16 border-y border-line bg-light/82 dark:border-[#333] dark:bg-[#1a1a1a]"
        >
            <div className="container-x py-16 sm:py-20">
                <header className="flex flex-col gap-3 max-w-2xl mb-12">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Process
                    </span>
                    <h2 className="section-heading">
                        How it works
                    </h2>
                    <p className="section-copy">
                        Four steps. No black boxes, no surprise fees.
                    </p>
                </header>

                <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className="flex flex-col gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-[13px] font-semibold text-blue-dark dark:bg-[#242527] dark:border-[#333]">
                                {i + 1}
                            </span>
                            <h3 className="font-semibold text-[16px]">{step.title}</h3>
                            <p className="section-copy leading-relaxed">
                                {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}