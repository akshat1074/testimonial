import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TestimonialCardSkeleton } from "@/components/Skeleton";
import type { PublicTestimonial } from "@/types/testimonial";

/**
 * This page is the whole point of the widget: it's designed to be loaded
 * in an <iframe> on someone else's site (see /widget-demo.html), so it
 * deliberately has no nav, no app chrome, and minimal motion — a third
 * party's page shouldn't feel like it just imported a second website.
 *
 * `accent` in the query string lets the *embedding* page override the
 * color without a round trip, useful for previewing; otherwise it falls
 * back to whatever's saved in the dashboard settings.
 */
export function WidgetPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<PublicTestimonial[] | null>(null);
  const [accent, setAccent] = useState(params.get("accent") || "#C08A2E");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params.get("accent")) {
      api
        .get<{ data: { accent_color: string } }>("/api/widget/settings")
        .then((res) => setAccent(res.data.accent_color))
        .catch(() => {});
    }

    api
      .get<{ data: PublicTestimonial[] }>(`/api/widget/testimonials?limit=${params.get("limit") || 6}`)
      .then((res) => setItems(res.data))
      .catch(() => setError(true));
  }, [params]);

  return (
    <div className="min-h-full bg-transparent p-3">
      {error && <p className="p-4 text-center text-sm text-ink-700/60">Couldn't load testimonials.</p>}

      {!error && items === null && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TestimonialCardSkeleton key={i} />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="p-4 text-center text-sm text-ink-700/60">No testimonials to show yet.</p>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} accentColor={accent} index={i} compact />
          ))}
        </div>
      )}

      <a
        href={window.location.origin.replace("/embed", "") + "/wall"}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block text-center font-mono text-[10px] uppercase tracking-wider text-ink-700/40 hover:text-ink-700/70"
      >
        Powered by testimonials
      </a>
    </div>
  );
}
