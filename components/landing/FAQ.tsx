"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { FAQS } from "./landing-data";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading tag="FAQ" title="Questions, answered" />
      <div className="mx-auto max-w-2xl space-y-3">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <Reveal key={item.q} delay={i * 0.05}>
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="text-[15px] font-semibold text-[#e8e6f0]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[rgba(232,230,240,0.4)] transition-transform duration-300 ${
                      open ? "rotate-180 text-[#8cc5ff]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-[rgba(232,230,240,0.5)]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
