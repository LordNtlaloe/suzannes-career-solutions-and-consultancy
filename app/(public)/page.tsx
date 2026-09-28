import { AboutPreview } from "@/components/public/about-preview"
import { ArticlesSection } from "@/components/public/article-section"
import { ClientStrip } from "@/components/public/client-strip"
import { ContactCta } from "@/components/public/contact-cta"
import { DifferentiatorsSection } from "@/components/public/differentiators-section"
import { FeaturedPosts } from "@/components/public/featured-posts"
import { Hero } from "@/components/public/hero"
import { HeroSection } from "@/components/public/hero-section"
import { MissionVision } from "@/components/public/mission-vision"
import { PortfolioSection } from "@/components/public/portfolio-section"
import { Process } from "@/components/public/process"
import { ServicesSection } from "@/components/public/service-section"
import { Services } from "@/components/public/services"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteNav } from "@/components/public/site-nav"
import { StorySection } from "@/components/public/story-section"
import { TeamSection } from "@/components/public/team-section"
import { TestimonialSection } from "@/components/public/testimonial-section"
import { Testimonials } from "@/components/public/testimonials"
import { TrustBar } from "@/components/public/trust-bar"
import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "Suzannes Agency — Career coaching and hiring support",
  description:
    "A career agency for people who want to build something real. Resume reviews, interview coaching, and hiring support.",
  openGraph: {
    title: "Suzannes Agency",
    description:
      "Career coaching, hiring support, and the notes we pick up along the way.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <>

      <main className="flex flex-col">
        <HeroSection />
        <ClientStrip />
        <ServicesSection />
        <DifferentiatorsSection />
        <TeamSection />
        <StorySection />
        <ArticlesSection />
        <PortfolioSection />
        <TestimonialSection />
      </main>

    </>
  )
}