import { motion } from "framer-motion";

interface StampSealProps {
  accentColor?: string;
  size?: number;
}

/**
 * The signature visual element of this product: an approved testimonial
 * reads as "notarized," not just "a card that made it through a filter."
 * Rendered once per approved card, animates in with a stamp-down motion.
 */
export function StampSeal({ accentColor = "#C08A2E", size = 56 }: StampSealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.4, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="pointer-events-none select-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <circle cx="50" cy="50" r="38" fill="none" stroke={accentColor} strokeWidth="1.5" />
        <path
          id="sealTextPath"
          d="M 50,50 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
          fill="none"
        />
        <text fontSize="8" fontFamily="IBM Plex Mono, monospace" fill={accentColor} letterSpacing="2">
          <textPath href="#sealTextPath" startOffset="2%">
            VERIFIED · VOICE · VERIFIED · VOICE ·
          </textPath>
        </text>
        <path
          d="M35 51 L45 61 L67 38"
          fill="none"
          stroke={accentColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
