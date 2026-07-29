import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TestimonialCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { TextReveal } from "@/components/TextReveal";
import { Button } from "@/components/ui/button";
import type { Paginated, PublicTestimonial, Settings } from "@/types/testimonial";

const PAGE_SIZE = 9;

export function WallPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [items, setItems] = useState<PublicTestimonial[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: Settings }>("/api/settings").then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  async function loadPage(targetPage: number) {
    try {
      const res = await api.get<Paginated<PublicTestimonial>>(
        `/api/testimonials/approved?page=${targetPage}&limit=${PAGE_SIZE}`
      );
      setItems((prev) => (targetPage === 1 ? res.data : [...prev, ...res.data]));
      setHasMore(res.hasMore);
      setPage(targetPage);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load testimonials.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = settings?.accent_color ?? "#C08A2E";
  const businessName = settings?.business_name ?? "Our customers";
  const layout = settings?.layout ?? "grid";

  return (
    <div className="min-h-screen bg-paper-200">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
          Wall of feedback
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
          <TextReveal text={`What people say about ${businessName}.`} />
        </h1>
        <p className="mt-4 max-w-lg text-ink-700/70">
          Every testimonial below was submitted by a real customer and reviewed before publishing.
        </p>

        {error && (
          <p className="mt-8 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}{" "}
            <button onClick={() => loadPage(1)} className="underline">
              Retry
            </button>
          </p>
        )}

        {loading && !error && (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-12">
            <EmptyState
              title="No testimonials yet"
              description="Approved testimonials will appear here as soon as they're published."
            />
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div
              className={`mt-12 grid gap-5 ${
                layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-2xl"
              }`}
            >
              {items.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} accentColor={accent} index={i} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  disabled={loadingMore}
                  onClick={() => {
                    setLoadingMore(true);
                    loadPage(page + 1);
                  }}
                  className="border-ink-700/20 text-ink-900 hover:bg-ink-900/5"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
