import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { images } from "@/lib/data";

const OBJECTIVES = [
    "Build foundational and occupation-relevant skills, including digital, financial, communication and professional competencies.",
    "Expand access to mentors, professional bodies, employers, clients, buyers and regional or global opportunity networks.",
    "Facilitate supervised practical experience, with clear learning outcomes, fair conditions and possible stipends when funded.",
    "Support informed school-to-career choices and early exposure to future-oriented skills.",
    "Help young entrepreneurs, artists and creators commercialise talent through incubation, portfolios, exhibitions and market access.",
    "Operate an inclusive, well-governed institution that measures outcomes and protects participants.",
];

export function GoalsObjectives() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Goal &amp; objectives
                        </span>
                        <h2 className="mt-4 max-w-[560px] text-[clamp(28px,3vw,40px)] font-bold leading-tight text-blue-dark">
                            Improve employability, enterprise readiness and
                            economic participation.
                        </h2>
                        <p className="mt-5 max-w-[560px] text-[16px] leading-[28px] text-black/70">
                            Accessible, measurable, market-linked development
                            pathways for Basotho youth.
                        </p>

                        <ul className="mt-8 flex max-w-[560px] flex-col gap-3">
                            {OBJECTIVES.map((objective) => (
                                <li
                                    key={objective}
                                    className="flex items-start gap-3 text-[15px] leading-relaxed text-brand"
                                >
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-blue-dark" />
                                    {objective}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/apply"
                            className="btn-brand mt-8 inline-flex self-start"
                        >
                            Apply to STEP
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>

                    {/* Right column — image with overlapping stat card */}
                    <div className="relative">
                        <img
                            src={images.project2}
                            alt="Skills development in action"
                            className="h-[520px] w-full rounded-lg border border-line object-cover bg-light shadow-soft"
                            loading="lazy"
                        />
                        <div className="absolute -bottom-6 left-6 flex flex-col gap-1 rounded-lg border border-line bg-white p-6 shadow-soft">
                            <span className="text-3xl font-bold text-blue-dark">75%</span>
                            <span className="max-w-[220px] text-[13px] leading-relaxed text-brand">
                                of enrolled participants complete required
                                learning &mdash; an indicative first-cycle target.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
