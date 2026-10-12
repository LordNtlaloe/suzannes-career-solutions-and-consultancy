import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

export function MonitoringEvaluationLearning() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left: stacked images */}
                    <div className="flex flex-col gap-6">
                        <img
                            src={images.service1}
                            alt="Learning in progress"
                            className="h-64 w-full object-cover sm:h-72"
                            loading="lazy"
                        />
                        <img
                            src={images.project3}
                            alt="Reviewing progress and data"
                            className="h-64 w-full object-cover sm:h-72"
                            loading="lazy"
                        />
                    </div>

                    {/* Right: heading, paragraphs and CTA */}
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Monitoring, evaluation &amp; learning
                        </span>
                        <h2 className="mt-3 text-[clamp(32px,4vw,44px)] font-bold leading-[1.15] text-blue-dark">
                            Measured and improved every cycle.
                        </h2>
                        <p className="mt-6 text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                            A results framework will track reach, equitable access,
                            learning completion, skills gains, mentor engagement,
                            placement quality, enterprise and creative outputs, and
                            subsequent work or income outcomes.
                        </p>
                        <p className="mt-4 text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                            STEP will collect baseline and endline data, conduct periodic
                            participant surveys and host feedback reviews, and publish an
                            annual results summary. The first pilot will be used to refine
                            the model before expansion.
                        </p>
                        <Link
                            href="/apply"
                            className="mt-8 inline-flex items-center gap-3 self-start rounded-full bg-blue px-8 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-dark"
                        >
                            Apply to STEP
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
