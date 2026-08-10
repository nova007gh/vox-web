"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   VOXelLogo — animated logo component
   variant="loading"  → smooth breathing pulse
   variant="nav"       → V vibrating with theme-color burst
   variant="static"    → no animation
   ───────────────────────────────────────────────────────────── */

type LogoVariant = "loading" | "nav" | "static";

interface VOXelLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

export function VOXelLogo({ variant = "static", size = 48, className = "" }: VOXelLogoProps) {
  if (variant === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: [1, 1.08, 1] }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        }}
        className={className}
        style={{ width: size, height: size }}
      >
        <LogoSVG size={size} />
      </motion.div>
    );
  }

  if (variant === "nav") {
    return (
      <motion.div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        animate={{
          filter: [
            "drop-shadow(0 0 4px rgba(124,44,255,0.4))",
            "drop-shadow(0 0 14px rgba(255,44,145,0.6))",
            "drop-shadow(0 0 4px rgba(255,138,52,0.4))",
            "drop-shadow(0 0 14px rgba(124,44,255,0.6))",
            "drop-shadow(0 0 4px rgba(124,44,255,0.4))",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Burst ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #7C2CFF, #FF2C91, #FF8A34)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Vibrate the logo */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-full h-full"
          animate={{
            x: [0, -1, 1, -1.5, 1.5, -1, 1, 0],
            y: [0, 1, -1, 1.5, -1.5, 1, -1, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <LogoSVG size={size * 0.72} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <LogoSVG size={size} />
    </div>
  );
}

/* ── Inner SVG ── */
function LogoSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="voxBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C2CFF" />
          <stop offset="50%" stopColor="#FF2C91" />
          <stop offset="100%" stopColor="#FF8A34" />
        </linearGradient>
        <linearGradient id="voxOGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C2CFF" />
          <stop offset="55%" stopColor="#FF2C91" />
          <stop offset="100%" stopColor="#FF8A34" />
        </linearGradient>
        <linearGradient id="voxTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF2C91" />
          <stop offset="100%" stopColor="#FF8A34" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="8" y="8" width="496" height="496" rx="112" ry="112" fill="#08040c" />
      <rect
        x="8"
        y="8"
        width="496"
        height="496"
        rx="112"
        ry="112"
        fill="none"
        stroke="url(#voxBorderGrad)"
        strokeWidth="8"
      />

      {/* VOXel wordmark */}
      <g transform="translate(56, 256)">
        {/* V */}
        <text
          x="0"
          y="0"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="160"
          fontWeight="800"
          fill="#ffffff"
          letterSpacing="-4"
          dominantBaseline="central"
        >
          V
        </text>

        {/* O with play triangle */}
        <g transform="translate(100, -76)">
          <circle cx="76" cy="76" r="72" fill="url(#voxOGrad)" />
          <circle cx="76" cy="76" r="72" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.25" />
          <polygon points="62,40 62,112 110,76" fill="#ffffff" />
        </g>

        {/* X */}
        <text
          x="262"
          y="0"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="160"
          fontWeight="800"
          fill="#ffffff"
          letterSpacing="-4"
          dominantBaseline="central"
        >
          X
        </text>

        {/* el */}
        <text
          x="384"
          y="0"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="160"
          fontWeight="700"
          fill="url(#voxTextGrad)"
          letterSpacing="-2"
          dominantBaseline="central"
        >
          el
        </text>
      </g>
    </svg>
  );
}
