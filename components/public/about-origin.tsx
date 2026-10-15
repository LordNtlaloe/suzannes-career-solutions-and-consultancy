import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { images } from "@/lib/data";

export function AboutOrigin() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            {" "}
                        </span>
                        <h2 className="mt-4 text-[clamp(32px,4vw,48px)] font-bold leading-tight text-blue-dark">
                            Background &amp; origin
                        </h2>
                        <p className="mt-6 max-w-140 text-[16px] leading-7 text-black/70 dark:text-white/70">
                            STEP was co-founded by Mammenyane Suzanne
                            Mots&rsquo;oane and Thabo Maibi, combining youth
                            employability and development practice with artificial
                            intelligence and technology entrepreneurship. Through
                            years of supporting job seekers, Suzanne saw that a
                            strong CV or a single coaching session could not
                            overcome missing skills, experience and networks.
                            Thabo founded Career Agent, an AI-powered career
                            platform. STEP is the independent, longer-term
                            response &mdash; a proposed non-profit institution
                            turning education and ambition into demonstrable
                            skills and opportunity.
                        </p>
                        <Link
                            href="/about"
                            className="btn-brand mt-8 inline-flex self-start"
                        >
                            Read our story
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <div className="mt-10 flex flex-col gap-3 text-[14px] font-semibold text-brand">
                            <a
                                href="tel:+26622000000"
                                className="inline-flex items-center gap-2 transition-colors hover:text-blue-dark"
                            >
                                <Phone className="h-4 w-4 text-blue" />
                                +266 2200 0000
                            </a>
                            <a
                                href="mailto:hello@step.org.ls"
                                className="inline-flex items-center gap-2 transition-colors hover:text-blue-dark"
                            >
                                <Mail className="h-4 w-4 text-blue" />
                                hello@step.org.ls
                            </a>
                        </div>
                    </div>

                    {/* Right column — image with overlapping quote card */}
                    <div className="relative">
                        <img
                            src={images.story}
                            alt="Professionals collaborating"
                            className="h-120 w-full rounded-lg border border-line object-cover bg-light shadow-soft"
                            loading="lazy"
                        />
                        <div className="absolute -bottom-6 right-6 max-w-95 rounded-lg bg-blue-dark p-6 shadow-btn">
                            <p className="text-[15px] leading-relaxed text-white">
                                STEP turns education and ambition into
                                demonstrable skills, practical experience,
                                enterprise growth and sustainable livelihoods
                                &mdash; one continuous pathway for Basotho
                                talent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
