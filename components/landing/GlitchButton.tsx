"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

// Retro CRT glitch CTA — adapted from the "retro glitchy navigation" study,
// recolored to AIRDeck's palette (blue #5eadff / pink #ff6ef7 on #070709)
// and rebuilt without GSAP: the chromatic displacement is a short
// requestAnimationFrame burst on hover, the scanline scroll is SMIL.
//
// This is the landing page's ONE glitch accent. Use it for primary CTAs
// only — never more than a few per page.

const BLUE = "#5eadff";
const PINK = "#ff6ef7";
const BG = "#0a0a10";
const SCANLINE = "#141826";

const SIZES = {
  md: { height: 44, fontSize: 13, padX: 26 },
  lg: { height: 56, fontSize: 16, padX: 36 },
} as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false // SSR: assume motion; the client corrects before any interaction
  );
}

export default function GlitchButton({
  href,
  label,
  size = "lg",
  external = false,
  className = "",
}: {
  href: string;
  label: string;
  size?: keyof typeof SIZES;
  external?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `gb-displace-${uid}`;
  const patternId = `gb-scan-${uid}`;

  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const rafRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotionPreference();

  const { height, fontSize, padX } = SIZES[size];
  const text = label.toUpperCase();
  // Geist Mono advance ≈ 0.6em + letter-spacing 0.14em per character.
  const width = Math.round(text.length * fontSize * 0.76) + padX * 2;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // A burst randomizes the displacement scale each frame, decaying to zero —
  // the same "rough ease" feel the GSAP original produced.
  const burst = (amplitude: number, duration: number) => {
    if (reduceMotion) return;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const tick = (now: number) => {
      const p = (now - start) / duration;
      const node = displaceRef.current;
      if (!node) return;
      if (p >= 1) {
        node.setAttribute("scale", "0");
        return;
      }
      node.setAttribute("scale", String(Math.random() * amplitude * (1 - p)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const content = (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="presentation"
      focusable="false"
    >
      <defs>
        {/* Horizontal bands whose B/R channels drive per-slice x/y shifts. */}
        <filter
          id={filterId}
          primitiveUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <feFlood
              key={i}
              floodColor={i % 2 === 0 ? "#8888FF" : "#888800"}
              y={`${i * 5}%`}
              height="5%"
              result={`s${i}`}
            />
          ))}
          <feMerge result="bands">
            {Array.from({ length: 20 }, (_, i) => (
              <feMergeNode key={i} in={`s${i}`} />
            ))}
          </feMerge>
          <feDisplacementMap
            ref={displaceRef}
            in="SourceGraphic"
            in2="bands"
            scale="0"
            xChannelSelector="B"
            yChannelSelector="R"
          />
        </filter>

        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="5"
          height="10"
        >
          <rect x="0" y="0" width="5" height="1" fill={SCANLINE} />
          <rect x="0" y="1" width="5" height="9" fill={BG} />
          {!reduceMotion && (
            <animate
              attributeName="y"
              values="0;10"
              dur="0.9s"
              repeatCount="indefinite"
            />
          )}
        </pattern>
      </defs>

      {/* CRT body */}
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />

      {/* Chromatic label pair — permanently fringed, displaced on hover */}
      <g filter={`url(#${filterId})`}>
        <text
          x={width / 2 - 1.2}
          y={height / 2 + 1}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={fontSize}
          fill={BLUE}
        >
          {text}
        </text>
        <text
          x={width / 2 + 1.2}
          y={height / 2 + 1}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={fontSize}
          fill={hovered ? PINK : "#e8e6f0"}
        >
          {text}
        </text>
      </g>

      {/* Left signal bars — fill vertically on hover via CSS */}
      <rect
        className="glitch-btn-fill"
        x="0"
        y="0"
        width="5"
        height={hovered ? height : 0}
        fill={BLUE}
      />
      <rect
        className="glitch-btn-fill"
        x="5"
        y="0"
        width="5"
        height={hovered ? height : 0}
        fill={PINK}
        style={{ transitionDelay: "0.05s" }}
      />

      {/* Frame */}
      <rect
        className="glitch-btn-frame"
        x="0.75"
        y="0.75"
        width={width - 1.5}
        height={height - 1.5}
        fill="none"
        stroke={PINK}
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
    </svg>
  );

  const handlers = {
    onMouseEnter: () => {
      setHovered(true);
      burst(0.55, 420);
    },
    onMouseLeave: () => {
      setHovered(false);
      burst(0.2, 200);
    },
    onFocus: () => {
      setHovered(true);
      burst(0.55, 420);
    },
    onBlur: () => setHovered(false),
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={`glitch-btn ${className}`}
        {...handlers}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`glitch-btn ${className}`}
      {...handlers}
    >
      {content}
    </Link>
  );
}
