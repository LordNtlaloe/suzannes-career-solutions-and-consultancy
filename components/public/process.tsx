const STEPS = [
    {
        title: "Outreach & access",
        body: "National digital and community mobilisation, with assisted registration where needed.",
    },
    {
        title: "Screening & onboarding",
        body: "Transparent criteria, commitment assessment, a skills baseline and consent.",
    },
    {
        title: "Learning & mentorship",
        body: "Blended training, projects, peer learning and expert guidance.",
    },
    {
        title: "Progression & follow-up",
        body: "Readiness assessment, placement or showcase matching, and outcomes tracking.",
    },
]

export function Process() {
    return (
        <section
            id="process"
            className="scroll-mt-16 border-y border-line bg-light/82 dark:border-[#333] dark:bg-[#202020]"
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
                        Four stages from outreach to outcomes tracking.
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