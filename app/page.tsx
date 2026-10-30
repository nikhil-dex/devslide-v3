import type { Metadata } from "next";
import AuroraBackground from "@/components/AuroraBackground";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import LiveGallery from "@/components/landing/LiveGallery";
import TrustedBy from "@/components/landing/TrustedBy";
import Features from "@/components/landing/Features";
import ThemeShowcase, { type ThemePreview } from "@/components/landing/ThemeShowcase";
import ComponentShowcase from "@/components/landing/ComponentShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import ExampleShowcase from "@/components/landing/ExampleShowcase";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import { THEME_LIST } from "@/deck/themes";

export const metadata: Metadata = {
  title: "AIRDeck — AI presentations from a single prompt",
  description:
    "Describe your presentation in one sentence. AIRDeck generates a fully designed, themed slide deck you can edit like code, share with a link, and export anywhere.",
};

// Server component: theme previews are derived from the real deck/themes
// registry at render time, so the showcase can never drift from the product.
// Only this small serialized slice reaches the client.
function themePreviews(): ThemePreview[] {
  return THEME_LIST.map((theme) => ({
    id: theme.id,
    name: theme.name,
    mode: theme.mode,
    summary: theme.ai.summary,
    bg: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.textPrimary,
    muted: theme.colors.textMuted,
    accent: theme.colors.primary,
    border: theme.colors.border,
    fontDisplay: theme.typography.display.fontFamily,
  }));
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070709]">
      <AuroraBackground />
      <div className="page-content">
        <LandingNav />
        <main>
          <Hero />
          <LiveGallery />
          <TrustedBy />
          <Features />
          <ThemeShowcase themes={themePreviews()} />
          <ComponentShowcase />
          <HowItWorks />
          <ExampleShowcase />
          <FAQ />
          <FinalCTA />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
