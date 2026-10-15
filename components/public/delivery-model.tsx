"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { images } from "@/lib/data";

type DeliveryStage = {
    title: string;
    body: string;
    evidence: string;
    image: string;
};

const STAGES: DeliveryStage[] = [
    {
        title: "Outreach & access",
        body: "National digital and community mobilisation; assisted registration where needed.",
        evidence: "Application and inclusion records",
        image: images.hero,
    },
    {
        title: "Screening & onboarding",
        body: "Transparent criteria, commitment assessment, baseline and consent.",
        evidence: "Cohort lists and baseline profiles",
        image: images.service2,
    },
    {
        title: "Learning & mentorship",
        body: "Blended training, projects, peer learning and expert guidance.",
        evidence: "Attendance, assessed tasks, mentor records",
        image: images.service1,
    },
    {
        title: "Progression",
        body: "Readiness assessment; placement matching or enterprise / creative exposure.",
        evidence: "Skills Passport, placement or showcase records",
        image: images.project3,
    },
    {
        title: "Follow-up",
        body: "Employer / participant feedback and outcomes tracking.",
        evidence: "Completion, income and opportunity reports",
        image: images.story,
    },
];

export function DeliveryModel() {
    const [active, setActive] = useState(0);
    const current = STAGES[active];

    return (
        <section className="container-x py-16 sm:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left: title + menu */}
                <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Delivery model
                    </span>
                    <h2 className="mt-3 text-[clamp(32px,3.5vw,44px)] font-bold leading-[1.15] text-ink dark:text-white">
                        From outreach
                        <br />
                        to outcomes.
                    </h2>

                    <nav className="mt-9 flex flex-col">
                        {STAGES.map((stage, i) => (
                            <button
                                key={stage.title}
                                type="button"
                                onClick={() => setActive(i)}
                                aria-pressed={i === active}
                                className={`flex items-center justify-between gap-4 border-b border-line px-4 py-4 text-left transition-colors ${
                                    i === active
                                        ? "bg-blue/5 text-blue-dark dark:bg-blue/10 dark:text-blue-light"
                                        : "text-ink hover:bg-light hover:text-blue-dark dark:text-white dark:hover:bg-[#242527]"
                                }`}
                            >
                                <span className="text-[14px] font-semibold uppercase tracking-[1px]">
                                    {stage.title}
                                </span>
                                <ChevronRight
                                    className={`h-4 w-4 shrink-0 transition-transform ${
                                        i === active
                                            ? "translate-x-1 text-blue-dark dark:text-blue-light"
                                            : "text-brand-muted"
                                    }`}
                                />
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: image + overlapping card */}
                <div className="relative">
                    <img
                        src={current.image}
                        alt={current.title}
                        className="h-105 w-full object-cover sm:h-125"
                        loading="lazy"
                    />
                    <div className="absolute -bottom-8 left-4 right-4 bg-blue-dark p-7 shadow-btn sm:left-8 sm:right-auto sm:max-w-105">
                        <h3 className="text-[17px] font-semibold text-white">
                            {current.title}
                        </h3>
                        <p className="mt-3 text-[14px] leading-6.5 text-white/90">
                            {current.body}
                        </p>
                        <p className="mt-2 text-[12px] text-white/70">
                            Evidence: {current.evidence}
                        </p>
                        <Link
                            href="/apply"
                            className="group mt-5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:text-white/80"
                        >
                            Learn more
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
