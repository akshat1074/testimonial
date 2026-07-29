import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { WaveformRating } from "@/components/WaveformRating";
import { EmptyState } from "@/components/EmptyState";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Settings, Testimonial, TestimonialStatus } from "@/types/testimonial";

type Tab = "pending" | "approved" | "rejected" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_VARIANT: Record<TestimonialStatus, { label: string; className: string }> = {
  pending: { label: "Pending review", className: "border-warn/30 bg-warn/10 text-warn" },
  approved: { label: "Approved", className: "border-ok/30 bg-ok/10 text-ok" },
  rejected: { label: "Rejected", className: "border-danger/30 bg-danger/10 text-danger" },
};

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { show } = useToast();

  async function load(currentTab: Tab) {
    setItems(null);
    setLoadError(null);
    try {
      const query = currentTab === "all" ? "" : `?status=${currentTab}`;
      const res = await api.get<{ data: Testimonial[] }>(`/api/moderation/testimonials${query}`);
      setItems(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Could not load submissions.");
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await api.patch(`/api/moderation/testimonials/${id}`, { status });
      setItems((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
      show(status === "approved" ? "Approved — now live on the wall" : "Rejected");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not update this submission", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function tagSentiment(id: string) {
    setBusyId(id);
    try {
      const res = await api.post<{ data: Testimonial }>(`/api/ai/testimonials/${id}/tag-sentiment`);
      setItems((prev) => prev?.map((t) => (t.id === id ? res.data : t)) ?? prev);
      show(`Tagged as ${res.data.sentiment}`);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Sentiment tagging failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  const count = useMemo(() => items?.length ?? null, [items]);

  return (
    <div className="min-h-screen bg-ink-900 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-seal-400">Dashboard</p>
            <h1 className="mt-2 font-display text-3xl text-paper-100">Testimonials</h1>
          </div>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            Widget settings
          </Button>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-6">
          <TabsList variant="line">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loadError && (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {loadError}{" "}
            <button onClick={() => load(tab)} className="underline">
              Retry
            </button>
          </p>
        )}

        {items === null && !loadError && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {items && items.length === 0 && (
          <EmptyState
            title={tab === "pending" ? "Nothing to review" : `No ${tab} testimonials yet`}
            description={
              tab === "pending"
                ? "New submissions from your customers will show up here for review."
                : "Once you approve or reject submissions, they'll appear in this list."
            }
          />
        )}

        {items && items.length > 0 && (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ReactBits SpotlightCard — mouse-follow highlight on the
                      dashboard's dark surface (Components category) */}
                  <SpotlightCard spotlightColor="rgba(192, 138, 46, 0.18)" className="!p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-sans text-sm font-medium text-paper-100">{t.name}</p>
                          {t.company && <p className="text-xs text-paper-400">· {t.company}</p>}
                        </div>
                        <p className="mt-0.5 font-mono text-[11px] text-paper-400">{t.email}</p>
                        <p className="mt-2 text-sm leading-relaxed text-paper-200">{t.content}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <WaveformRating rating={t.rating} size="sm" />
                          <Badge variant="outline" className={STATUS_VARIANT[t.status].className}>
                            {STATUS_VARIANT[t.status].label}
                          </Badge>
                          {t.sentiment && (
                            <span className="font-mono text-[11px] uppercase tracking-wider text-voice-400">
                              {t.sentiment}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-paper-400">
                            {new Date(t.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {t.photo_url && (
                        <img
                          src={t.photo_url}
                          alt=""
                          className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex flex-wrap gap-2">
                      {t.status !== "approved" && (
                        <Button
                          size="sm"
                          disabled={busyId === t.id}
                          onClick={() => decide(t.id, "approved")}
                        >
                          Approve
                        </Button>
                      )}
                      {t.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === t.id}
                          onClick={() => decide(t.id, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                      <button
                        disabled={busyId === t.id || !!t.sentiment}
                        onClick={() => tagSentiment(t.id)}
                        className="ml-auto rounded-md border border-voice-500/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-voice-400 transition-colors hover:bg-voice-500/10 disabled:opacity-40"
                        title="P2 — AI sentiment tag"
                      >
                        {t.sentiment ? "Tagged" : "Tag sentiment (AI)"}
                      </button>
                    </div>
                  </SpotlightCard>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {count !== null && items && items.length > 0 && (
          <p className="mt-4 font-mono text-[11px] text-paper-400">{count} shown</p>
        )}
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (open && !settings) {
      api.get<{ data: Settings }>("/api/settings").then((res) => setSettings(res.data));
    }
  }, [open, settings]);

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    try {
      const res = await api.patch<{ data: Settings }>("/api/settings", patch);
      setSettings(res.data);
      show("Settings saved");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  const embedSnippet = `<iframe\n  src="${window.location.origin}/embed?accent=${encodeURIComponent(
    settings?.accent_color ?? "#C08A2E"
  )}"\n  width="100%"\n  height="480"\n  style="border:0"\n  title="Customer testimonials"\n></iframe>`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-ink-800 text-paper-100">
        <SheetHeader>
          <SheetTitle className="font-display text-xl text-paper-100">Widget settings</SheetTitle>
          <SheetDescription className="text-paper-400">
            Controls what your customers and their site visitors see.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          {!settings ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] uppercase tracking-wider text-paper-400">
                  Business name
                </Label>
                <Input
                  defaultValue={settings.business_name}
                  onBlur={(e) => save({ business_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] uppercase tracking-wider text-paper-400">
                  Accent color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={settings.accent_color}
                    onChange={(e) => save({ accent_color: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-ink-600 bg-ink-900"
                  />
                  <span className="font-mono text-sm text-paper-400">{settings.accent_color}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] uppercase tracking-wider text-paper-400">
                  Wall layout
                </Label>
                <div className="flex gap-2">
                  {(["grid", "list"] as const).map((l) => (
                    <Button
                      key={l}
                      size="sm"
                      variant={settings.layout === l ? "default" : "outline"}
                      onClick={() => save({ layout: l })}
                      className="capitalize"
                    >
                      {l}
                    </Button>
                  ))}
                </div>
              </div>

              {saving && <p className="font-mono text-[11px] text-paper-400">Saving…</p>}

              <Separator />

              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-paper-400">
                  Embed on your site
                </p>
                <pre className="overflow-x-auto rounded-lg border border-ink-600 bg-ink-900 p-3 text-xs text-voice-400">
                  {embedSnippet}
                </pre>
                <p className="mt-2 text-xs text-paper-400">
                  Paste this into any HTML page. See <code className="text-paper-200">widget-demo.html</code>{" "}
                  in the repo for a working example. API base: <code className="text-paper-200">{apiUrl}</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
