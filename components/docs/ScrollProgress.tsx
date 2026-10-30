"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Reading progress for the whole document, pinned just under the sticky nav.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-16 left-0 right-0 z-40 h-[2px] origin-left bg-gradient-to-r from-[#b3ffc8] via-[#5eadff] to-[#ff6ef7]"
    />
  );
}
