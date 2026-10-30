"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useInView } from "framer-motion";
import { Loader2 } from "lucide-react";

// The Playground pulls the compiler and all ten themes into the client
// bundle (~390KB raw). That is fine for a tool you are using, and wasteful
// for a reader who never scrolls to it — so the chunk is code-split and only
// requested once the section approaches the viewport.

const Skeleton = () => (
  <div className="my-7 flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
    <p className="inline-flex items-center gap-2 text-xs text-[rgba(232,230,240,0.4)]">
      <Loader2 aria-hidden className="w-3.5 h-3.5 animate-spin" />
      Loading the compiler…
    </p>
  </div>
);

const Playground = dynamic(() => import("./Playground"), {
  ssr: false,
  loading: Skeleton,
});

export default function PlaygroundLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "400px 0px" });

  return <div ref={ref}>{inView ? <Playground /> : <Skeleton />}</div>;
}
