import { useState } from "react";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

const LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

export function RatingInput({ value, onChange }: RatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div>
      <div className="flex items-end gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""} — ${LABELS[n - 1]}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(n)}
              className="group"
              style={{ width: 30, height: 30 }}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-full w-full transition-all duration-150 ${
                  filled ? "scale-110" : "scale-100"
                }`}
                fill={filled ? "#C08A2E" : "none"}
                stroke={filled ? "#C08A2E" : "currentColor"}
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3.5l2.6 5.35 5.9.86-4.27 4.16 1 5.88L12 17l-5.23 2.75 1-5.88L3.5 9.71l5.9-.86L12 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 h-4 font-mono text-xs uppercase tracking-wider text-paper-400">
        {display > 0 ? LABELS[display - 1] : "Tap to rate"}
      </p>
    </div>
  );
}
