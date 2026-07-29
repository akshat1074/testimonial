import { motion } from "framer-motion";

interface WaveformRatingProps {
  rating: number; // 1-5
  accentColor?: string;
  size?: "sm" | "md";
}

// Fixed relative heights so the shape reads as a waveform, not a bar chart.
const BAR_HEIGHTS = [0.5, 0.85, 1, 0.7, 0.4];

/**
 * Displays a rating as five waveform bars instead of star glyphs — a
 * small, deliberate choice that ties back to the product's subject
 * (recorded customer *voices*) instead of reaching for a generic star icon.
 */
export function WaveformRating({ rating, accentColor = "#C08A2E", size = "md" }: WaveformRatingProps) {
  const height = size === "sm" ? 16 : 22;
  const width = size === "sm" ? 3 : 4;
  const gap = size === "sm" ? 3 : 4;

  return (
    <div
      className="flex items-end"
      style={{ gap, height }}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {BAR_HEIGHTS.map((h, i) => {
        const filled = i < rating;
        return (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
            style={{
              width,
              height: height * h,
              backgroundColor: filled ? accentColor : "currentColor",
              opacity: filled ? 1 : 0.18,
              transformOrigin: "bottom",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        );
      })}
    </div>
  );
}
