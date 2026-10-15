import Link from "next/link";
import { Clock } from "lucide-react";
import { images } from "@/lib/data";

const WORKPLAN = [
    { period: "Oct–Dec 2026", activity: "Introduce STEP at CEYS; legal review and registration; recruit founding Board; draft policies, programme outlines and partner prospectus" },
    { period: "Nov 2026–Jan 2027", activity: "Partner consultations, proposals, MoU negotiation, budget and resource mobilisation; platform and safeguarding setup; pilot curriculum design" },
    { period: "February 2027", activity: "Issue public pilot calls for the Career Academy, Talent Experience interest and Creative Economy Lab; publish Schools Bootcamp registration and fees separately" },
    { period: "March–April 2027", activity: "Screen and onboard pilot participants; baselines; commence academy and creative learning; schedule school bootcamps" },
    { period: "May–August 2027", activity: "Training, mentoring, portfolio projects, school sessions; secure placement host agreements and assess readiness" },
    { period: "Sept–Oct 2027", activity: "Complete the six-month learning cycle; match eligible participants to supervised experience; hold showcase; publish pilot review" },
];

export function WorkPlan() {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-[#202020]">
            {/* Content */}
            <div className="container-x relative z-1 py-16 sm:py-20">
                <div className="max-w-xl">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Indicative work plan
                    </span>
                    <h2 className="mt-3 text-[clamp(28px,3vw,40px)] font-bold leading-[1.15] text-ink dark:text-white">
                        From launch to pilot review.
                    </h2>
                    <p className="mt-4 text-[14px] leading-[26px] text-black/70 dark:text-white/70">
                        Timing is indicative; the February call is a planned milestone,
                        not a commitment to open applications without adequate
                        governance, funding and programme readiness.
                    </p>

                    <ol className="mt-9 flex flex-col gap-5 border-l border-blue/20 pl-6 dark:border-white/20">
                        {WORKPLAN.map((w) => (
                            <li key={w.period} className="relative">
                                <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-blue dark:bg-blue-light" />
                                <h3 className="text-[13px] font-semibold uppercase tracking-[1px] text-blue-dark dark:text-blue-light">
                                    {w.period}
                                </h3>
                                <p className="mt-1 text-[14px] leading-[24px] text-black/70 dark:text-white/75">
                                    {w.activity}
                                </p>
                            </li>
                        ))}
                    </ol>

                    <Link
                        href="/apply"
                        className="mt-10 inline-flex items-center gap-3 rounded-full bg-blue px-7 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-dark"
                    >
                        <Clock className="h-4 w-4" />
                        Apply to STEP
                    </Link>
                </div>
            </div>

            {/* Mobile image */}
            <div className="lg:hidden">
                <img
                    src={images.project2}
                    alt="Planning and delivery"
                    className="h-64 w-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Desktop image — smaller than the section, right-aligned */}
            <div className="absolute right-0 top-1/2 hidden w-[42%] -translate-y-1/2 lg:block">
                <img
                    src={images.project2}
                    alt="Planning and delivery"
                    className="h-[380px] w-full object-cover"
                    loading="lazy"
                />
            </div>
        </section>
    );
}
