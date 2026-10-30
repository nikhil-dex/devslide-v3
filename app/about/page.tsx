import type { Metadata } from "next";
import AuroraBackground from "@/components/AuroraBackground";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import AboutHero from "@/components/about/AboutHero";
import Journey from "@/components/about/Journey";
import ProblemSection from "@/components/about/ProblemSection";
import WhyAirdeck from "@/components/about/WhyAirdeck";
import Different from "@/components/about/Different";
import MissionVision from "@/components/about/MissionVision";
import Principles from "@/components/about/Principles";
import OpenSource from "@/components/about/OpenSource";
import CommunityPreview from "@/components/about/CommunityPreview";
import StatsToday from "@/components/about/StatsToday";
import AboutCTA from "@/components/about/AboutCTA";

const TITLE = "About AIRDeck — Reimagining how presentations are created";
const DESCRIPTION =
  "The story behind AIRDeck: why presentations were stuck, how AI changes their creation, and where an open, interactive presentation ecosystem is heading.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
    siteName: "AIRDeck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070709]">
      <AuroraBackground />
      <div className="page-content">
        <LandingNav />
        <main>
          <AboutHero />
          <Journey />
          <ProblemSection />
          <WhyAirdeck />
          <Different />
          <MissionVision />
          <Principles />
          <OpenSource />
          <CommunityPreview />
          <StatsToday />
          <AboutCTA />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
