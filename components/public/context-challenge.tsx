export function ContextChallenge() {
    return (
        <section className="container-x py-10 sm:py-20">
            <div className="mx-auto max-w-full text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    Context &amp; challenge
                </span>
                <h2 className="mt-3 text-[clamp(32px,4vw,48px)] font-semibold leading-tight text-ink">
                    The development{" "}
                    <span className="text-blue dark:text-blue-light">challenge.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                    Lesotho faces a significant employment and labour-market
                    inclusion challenge.
                </p>
            </div>

            {/* Stat circles */}
            <div className="mx-auto mt-14 grid max-w-full grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                    { value: "30.1%", label: "Unemployment rate" },
                    { value: "145,087", label: "Unemployed youth (15–35)" },
                    { value: "204,747", label: "NEET youth (15–24)" },
                    { value: "84%", label: "Informal employment" },
                ].map((stat) => (
                    <div
                        key={stat.value}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="grid size-40 place-items-center rounded-b-full rounded-t-full border-5 border-blue bg-white dark:bg-[#242527] sm:size-44">
                            <div className="flex flex-col items-center px-3">
                                <strong className="text-[22px] font-bold leading-none text-ink dark:text-white sm:text-[24px]">
                                    {stat.value}
                                </strong>
                                <span className="mt-3 text-[9px] font-semibold uppercase leading-[1.5] tracking-[1px] text-ink/70 dark:text-white/70">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-14 flex max-w-full flex-col gap-4 text-[14px] leading-[1.9] text-black/70 dark:text-white/70">
                <p>
                    The same survey estimates that 84.0% of employment is informal,
                    underscoring the need for STEP to support both wage employment
                    and viable self-employment. Employers may require evidence of
                    practical skills, communication, digital fluency and workplace
                    experience beyond academic qualifications.
                </p>
                <p>
                    Many young Basotho struggle to convert education, creative talent
                    or business ideas into sustainable economic participation because
                    access to relevant skills, mentoring, professional networks,
                    experience, finance and markets is uneven. Geographic, digital,
                    disability-related and household-income barriers can compound
                    these gaps.
                </p>
                <p>
                    Lesotho already has youth-focused initiatives — the Sebabatso and
                    STEAM programmes and the Basotho Enterprise Development
                    Corporation. STEP is designed to complement, not duplicate, these
                    efforts through a continuous, cross-sector pathway linking
                    learning, mentorship, verified capabilities, supervised
                    experience and market or employer access.
                </p>
            </div>
        </section>
    );
}
