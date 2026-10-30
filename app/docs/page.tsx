import type { Metadata } from "next";
import AuroraBackground from "@/components/AuroraBackground";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import DocsShell from "@/components/docs/DocsShell";
import DocsHero from "@/components/docs/DocsHero";
import GettingStartedDocs from "@/components/docs/content/GettingStartedDocs";
import CoreConceptsDocs from "@/components/docs/content/CoreConceptsDocs";
import ExportDocs from "@/components/docs/content/ExportDocs";
import PromptDocs from "@/components/docs/content/PromptDocs";
import ReferenceDocs from "@/components/docs/content/ReferenceDocs";
import {
  getThemeDocs,
  getComponentDocs,
  getPipelineStages,
} from "@/components/docs/registry";

const TITLE = "Documentation — AIRDeck";
const DESCRIPTION =
  "Learn how AIRDeck turns a prompt into an interactive HTML presentation: the deck pipeline, themes, slide components, export formats, and a practical guide to writing prompts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/docs",
    siteName: "AIRDeck",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function DocsPage() {
  // Documentation is generated from the live registries and the real
  // compiler on the server. Nothing about themes or components is restated
  // by hand, and every preview is a genuine compiled slide.
  const themes = getThemeDocs();
  const components = getComponentDocs();
  const pipeline = getPipelineStages();

  return (
    <div className="min-h-screen bg-[#070709]">
      <AuroraBackground />
      <div className="page-content">
        <LandingNav />
        <DocsShell>
          <DocsHero />
          <GettingStartedDocs pipeline={pipeline} />
          <CoreConceptsDocs themes={themes} components={components} />
          <ExportDocs />
          <PromptDocs />
          <ReferenceDocs />
        </DocsShell>
        <LandingFooter />
      </div>
    </div>
  );
}
