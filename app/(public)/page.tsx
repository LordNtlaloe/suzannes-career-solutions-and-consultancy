import type { Metadata } from "next";
import { stepPageMetadata } from "@/lib/step/metadata";

import { HeroSection } from "@/components/public/hero-section";
import { VisionMission } from "@/components/public/vision-mission";
import { ProgrammePillars } from "@/components/public/programme-pillars";
import { AboutOrigin } from "@/components/public/about-origin";
import { ContextChallenge } from "@/components/public/context-challenge";
import { MediaBand } from "@/components/public/media-band";
import { GoalsObjectives } from "@/components/public/goals-objectives";
import { WhoStepServes } from "@/components/public/who-step-serves";
import { SuccessMeasures } from "@/components/public/success-measures";
import { DeliveryModel } from "@/components/public/delivery-model";
import { Partnerships } from "@/components/public/partnerships";
import { MonitoringEvaluationLearning } from "@/components/public/mel";
import { WorkPlan } from "@/components/public/work-plan";
import { Invitation } from "@/components/public/invitation";
import { TeamSection } from "@/components/public/team-section";

const TITLE = "STEP Lesotho — Skills, Talent & Employment Pathway";

const DESCRIPTION =
    "Discover STEP, a proposed youth-led initiative connecting Basotho talent to skills development, mentorship, practical experience and employment pathways.";

const OG_DESCRIPTION =
    "An opportunity pathway for Basotho talent — four connected programmes linking learning, mentorship, supervised experience and markets.";

export async function generateMetadata(): Promise<Metadata> {
    const base = await stepPageMetadata({
        path: "/",
        title: TITLE,
        description: DESCRIPTION,
    });

    return {
        ...base,
        openGraph: {
            ...base.openGraph,
            type: "website",
            siteName: "STEP Lesotho",
            title: TITLE,
            description: OG_DESCRIPTION,
        },
        twitter: {
            ...base.twitter,
            card: "summary",
            title: TITLE,
            description: DESCRIPTION,
        },
    };
}

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <VisionMission />
            <ProgrammePillars />
            <AboutOrigin />
            <ContextChallenge />
            <MediaBand />
            <GoalsObjectives />
            <WhoStepServes />
            <SuccessMeasures />
            <DeliveryModel />
            <Partnerships />
            <TeamSection />
            <MonitoringEvaluationLearning />
            <WorkPlan />
            <Invitation />
        </>
    );
}   