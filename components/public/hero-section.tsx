import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-244 overflow-hidden bg-hero-grad text-white max-md:min-h-200 pt-30"
        >
            {/* Dual-layer background (kept as CSS because of gradient + url + opacity) */}
            <div className="hero-image-bg absolute inset-0 left-[59%] opacity-[.86] max-[1100px]:left-[52%] max-md:inset-0 max-md:opacity-35" />

            {/* Hero content */}
            <div className="container-x relative z-2 pt-9.5 max-md:pt-17.5">
                <p className="mb-5.5 text-[11px] font-semibold tracking-[2.4px] text-blue-light">
                    SKILLS, TALENT &amp; EMPLOYMENT PATHWAY
                </p>

                <h1 className="text-[clamp(46px,5.1vw,72px)] font-medium leading-[1.22] tracking-[-2px] max-md:text-[47px] max-md:tracking-[-1px] max-[520px]:text-[40px]">
                    An opportunity pathway
                    <br />
                    <span className="text-white">for Basotho talent.</span>
                </h1>

                <p className="mt-8.5 w-142.5 max-w-full text-[14px] leading-[1.75] text-[#c4c4c4] max-md:text-[13px]">
                    STEP is a proposed youth-led, non-profit institution
                    designed to help young Basotho move from education and
                    ambition to demonstrable skills, practical experience,
                    enterprise growth and sustainable livelihoods.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-5">
                    <Link href="/apply" className="btn-brand bg-btn-grad">
                        Apply to STEP
                    </Link>
                    <Link
                        href="#partners"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/90 transition-opacity hover:opacity-70"
                    >
                        Partner with STEP
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Hero stats */}
            <div className="container-x absolute bottom-44 left-1/2 z-2 -translate-x-1/2 max-md:static max-md:mt-10 max-md:translate-x-0">
                <div className="flex gap-13.5 max-md:gap-6.25 max-[520px]:gap-4.5">
                    <Stat value="4" label={<>Connected<br />Programmes</>} />
                    <Stat value="6" label={<>Month<br />Academy</>} />
                    <Stat value="10" label={<>Districts<br />Served</>} />
                </div>
            </div>

            {/* Hero panel */}
            <div className="absolute bottom-0 right-0 z-3 min-h-41.5 w-186.25 bg-panel-grad shadow-btn max-[1100px]:w-[58%] max-md:static max-md:mt-10 max-md:w-full">
                <div className="flex min-h-41.5 items-center gap-7.5 p-[30px_32px] max-md:flex-wrap max-md:gap-4 max-md:p-5">
                    <div>
                        <small className="block text-[9px]">SKILLS, TALENT &amp; EMPLOYMENT</small>
                        <b className="block text-[14px]">STEP</b>
                    </div>

                    <div className="flex items-center gap-2">
                        <strong className="text-[36px] leading-none">4</strong>
                        <span className="text-[11px] leading-[1.4]">
                            Connected
                            <br />
                            Programmes
                        </span>
                    </div>

                    <p className="ml-auto max-w-75 text-[11px] leading-[1.7] max-md:w-full max-md:max-w-full">
                        A youth-led, non-profit pathway linking learning,
                        mentorship, experience and markets.
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