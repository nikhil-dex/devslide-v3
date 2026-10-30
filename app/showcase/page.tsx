import type { Metadata } from "next";
import AuroraBackground from "@/components/AuroraBackground";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import ShowcaseExplorer from "@/components/showcase/ShowcaseExplorer";
import ComingSoon from "@/components/showcase/ComingSoon";
import ShowcaseCTA from "@/components/showcase/ShowcaseCTA";

const TITLE = "Showcase — Presentations built with AIRDeck";
const DESCRIPTION =
  "A curated gallery of real AIRDeck presentations, running live in your browser — interactive HTML decks with animations, tabs and live behavior. Search, preview, and copy the prompts that made them.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/showcase",
    siteName: "AIRDeck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#070709]">
      <AuroraBackground />
      <div className="page-content">
        <LandingNav />
        <main>
          <ShowcaseExplorer />
          <ComingSoon />
          <ShowcaseCTA />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
