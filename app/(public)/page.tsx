import type { Metadata } from "next";
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
import { Governance } from "@/components/public/governance";
import { Resources } from "@/components/public/resources";
import { Funding } from "@/components/public/funding";
import { Inclusion } from "@/components/public/inclusion";
import { Risks } from "@/components/public/risks";
import { MonitoringEvaluationLearning } from "@/components/public/mel";
import { WorkPlan } from "@/components/public/work-plan";
import { Invitation } from "@/components/public/invitation";

export const metadata: Metadata = {
    title: "STEP — Skills, Talent & Employment Pathway",
    description:
        "An opportunity pathway for Basotho talent. STEP is a proposed youth-led, non-profit institution connecting Basotho talent to learning, mentorship, supervised experience and markets.",
    openGraph: {
        title: "STEP — Skills, Talent & Employment Pathway",
        description:
            "An opportunity pathway for Basotho talent — four connected programmes linking learning, mentorship, supervised experience and markets.",
        type: "website",
    },
};

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
            {/* <Governance /> */}
            {/* <Resources /> */}
            {/* <Funding /> */}
            {/* <Inclusion /> */}
            {/* <Risks /> */}
            <MonitoringEvaluationLearning />
            <WorkPlan />
            <Invitation />
        </>
    );
}
