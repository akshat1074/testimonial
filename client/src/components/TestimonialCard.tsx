import { motion } from "framer-motion";
import { WaveformRating } from "./WaveformRating";
import { StampSeal } from "./StampSeal";
import type { PublicTestimonial } from "@/types/testimonial";

interface TestimonialCardProps {
  testimonial: PublicTestimonial;
  accentColor: string;
  index?: number;
  compact?: boolean;
}

/**
 * Light-mode card (paper background) — used on both the in-app wall and
 * the embed widget, so a testimonial looks identical wherever it's shown.
 */
export function TestimonialCard({ testimonial, accentColor, index = 0, compact = false }: TestimonialCardProps) {
  const initial = testimonial.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      className="relative flex h-full flex-col rounded-xl border border-paper-300 bg-paper-100 p-5 shadow-[0_1px_2px_rgba(18,21,28,0.04)]"
    >
      <div className="absolute right-4 top-4">
        <StampSeal accentColor={accentColor} size={compact ? 36 : 44} />
      </div>

      <span
        className="font-display text-4xl leading-none"
        style={{ color: `${accentColor}55` }}
        aria-hidden="true"
      >
        “
      </span>

      <p className={`mt-1 flex-1 text-ink-800 ${compact ? "text-sm" : "text-[15px]"} leading-relaxed`}>
        {testimonial.content}
      </p>

      <div className="mt-4 flex items-center gap-3 border-t border-paper-300 pt-4">
        {testimonial.photo_url ? (
          <img
            src={testimonial.photo_url}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-medium text-white"
            style={{ backgroundColor: accentColor }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900">{testimonial.name}</p>
          {testimonial.company && (
            <p className="truncate font-mono text-[11px] text-ink-700/60">{testimonial.company}</p>
          )}
        </div>
        <WaveformRating rating={testimonial.rating} accentColor={accentColor} size="sm" />
      </div>
    </motion.article>
  );
}
