import Link from "next/link";

export function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-[976px] overflow-hidden bg-hero-grad text-white max-md:min-h-[800px]"
        >
            {/* Dual-layer background (kept as CSS because of gradient + url + opacity) */}
            <div className="hero-image-bg absolute inset-0 left-[59%] opacity-[.86] max-[1100px]:left-[52%] max-md:inset-0 max-md:opacity-35" />

            {/* Hero content */}
            <div className="container-x relative z-2 pt-[38px] max-md:pt-[70px]">
                <p className="mb-[22px] text-[11px] font-semibold tracking-[2.4px] text-blue-light">
                    CAREER AGENCY
                </p>

                <h1 className="text-[clamp(46px,5.1vw,72px)] font-medium leading-[1.22] tracking-[-2px] max-md:text-[47px] max-md:tracking-[-1px] max-[520px]:text-[40px]">
                    We Provide
                    <br />
                    <span className="text-white">Career Direction</span>
                    <br />
                    <strong className="font-medium">and Opportunity</strong>
                </h1>

                <p className="mt-[34px] w-[570px] max-w-full text-[14px] leading-[1.75] text-[#c4c4c4] max-md:text-[13px]">
                    We help ambitious professionals make clearer career decisions,
                    present their experience with confidence and move toward the
                    opportunities that fit their next chapter.
                </p>

                <Link
                    href="/services"
                    className="btn-brand mt-[36px] bg-btn-grad"
                >
                    Discover More
                </Link>
            </div>

            {/* Hero stats */}
            <div className="container-x absolute bottom-[95px] left-1/2 z-2 -translate-x-1/2 max-md:bottom-[95px] max-[520px]:bottom-[105px]">
                <div className="flex gap-[54px] max-md:gap-[25px] max-[520px]:gap-[18px]">
                    <Stat value="300+" label={<>Happy<br />Clients</>} />
                    <Stat value="900+" label={<>Career<br />Placements</>} />
                    <Stat
                        value="20+"
                        label={<>Years of<br />Experience</>}
                        className="max-[520px]:hidden"
                    />
                </div>
            </div>

            {/* Hero panel */}
            <div className="absolute bottom-0 right-0 z-3 min-h-[166px] w-[745px] bg-panel-grad shadow-btn max-[1100px]:w-[58%] max-md:w-full">
                <div className="flex h-[166px] items-center gap-[30px] p-[30px_32px] max-md:gap-[16px] max-md:p-[20px]">
                    <div>
                        <small className="block text-[9px]">GENERAL</small>
                        <b className="block text-[14px]">PROJECT</b>
                    </div>

                    <div className="flex items-center gap-[8px]">
                        <strong className="text-[36px] leading-none">25</strong>
                        <span className="text-[11px] leading-[1.4]">
                            Years
                            <br />
                            Operating
                        </span>
                    </div>

                    <p className="ml-auto max-w-[300px] text-[11px] leading-[1.7] max-md:hidden">
                        A career partner focused on practical direction, professional
                        positioning and long-term opportunity.
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
            <span className="mt-[9px] text-[11px] leading-[1.55] text-[#c4c4c4] max-md:text-[9px]">
                {label}
            </span>
        </div>
    );
}