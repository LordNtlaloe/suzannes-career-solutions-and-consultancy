import Link from "next/link";

export function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-244 overflow-hidden bg-hero-grad text-white max-md:min-h-200 pt-30"
        >
            {/* Dual-layer background (kept as CSS because of gradient + url + opacity) */}
            <div className="hero-image-bg absolute inset-0 left-[59%] opacity-[.86] max-[1100px]:left-[52%] max-md:inset-0 max-md:opacity-35" />

            {/* Hero content */}
            <div className="container-x relative z-2 pt-9.5x-md:pt-[70px]">
                <p className="mb-5.5 text-[11px] font-semibold tracking-[2.4px] text-blue-light">
                    SKILLS, TALENT &amp; EMPLOYMENT PATHWAY
                </p>

                <h1 className="text-[clamp(46px,5.1vw,72px)] font-medium leading-[1.22] tracking-[-2px] max-md:text-[47px] max-md:tracking-[-1px] max-[520px]:text-[40px]">
                    Six Months.
                    <br />
                    <span className="text-white">Real Skills.</span>
                    <br />
                    <strong className="font-medium">Verified Readiness.</strong>
                </h1>

                <p className="mt-8.5 w-142.5 max-w-full text-[14px] leading-[1.75] text-[#c4c4c4] max-md:text-[13px]">
                    STEP is a six-month industry-based incubation and opportunity
                    pathway for 600+ Basotho participants &mdash; built on learning,
                    coaching, mentoring, practical application and assessment.
                </p>

                <Link
                    href="/apply"
                    className="btn-brand mt-9 bg-btn-grad"
                >
                    Apply to STEP
                </Link>
            </div>

            {/* Hero stats */}
            <div className="container-x absolute bottom-23.75 left-1/2 z-2 -translate-x-1/2 max-md:bottom-23.75 max-[520px]:bottom-26.25">
                <div className="flex gap-13.5 max-md:gap-6.25 max-[520px]:gap-4.5">
                    <Stat value="600+" label={<>Basotho<br />Participants</>} />
                    <Stat value="8" label={<>Industry<br />Cohorts</>} />
                    <Stat
                        value="6"
                        label={<>Months to<br />Readiness</>}
                        className="max-[520px]:hidden"
                    />
                </div>
            </div>

            {/* Hero panel */}
            <div className="absolute bottom-0 right-0 z-3 min-h-41.5 w-186.25 bg-panel-grad shadow-btn max-[1100px]:w-[58%] max-md:w-full">
                <div className="flex h-41.5 items-center gap-7.5 p-[30px_32px] max-md:gap-4 max-md:p-5">
                    <div>
                        <small className="block text-[9px]">SKILLS, TALENT &amp; EMPLOYMENT</small>
                        <b className="block text-[14px]">STEP</b>
                    </div>

                    <div className="flex items-center gap-2">
                        <strong className="text-[36px] leading-none">6</strong>
                        <span className="text-[11px] leading-[1.4]">
                            Months
                            <br />
                            Pathway
                        </span>
                    </div>

                    <p className="ml-auto max-w-75 text-[11px] leading-[1.7] max-md:hidden">
                        A structured pathway linking learning to application,
                        assessment and verified opportunity.
                    </p>
                </div>
            </div>
        </section>
    );
}

function Stat({
    value,
    label,
    className = "",
}: {
    value: string;
    label: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col ${className}`}>
            <strong className="text-[28px] leading-none max-md:text-[23px]">
                {value}
            </strong>
            <span className="mt-2.25 text-[11px] leading-[1.55] text-[#c4c4c4] max-md:text-[9px]">
                {label}
            </span>
        </div>
    );
}