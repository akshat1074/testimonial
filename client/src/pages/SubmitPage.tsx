import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { supabase, uploadTestimonialPhoto } from "@/lib/supabase";
import Aurora from "@/components/reactbits/Aurora";
import StarBorder from "@/components/reactbits/StarBorder";
import ShinyText from "@/components/reactbits/ShinyText";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RatingInput } from "@/components/RatingInput";
import { TextReveal } from "@/components/TextReveal";
import type { Testimonial } from "@/types/testimonial";

type FormState = {
  name: string;
  email: string;
  company: string;
  content: string;
  rating: number;
};

const EMPTY_FORM: FormState = { name: "", email: "", company: "", content: "", rating: 0 };

export function SubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.rating === 0) {
      setError("Please choose a star rating.");
      return;
    }

    setStatus("submitting");
    try {
      let photo_url: string | undefined;
      if (photo) {
        photo_url = await uploadTestimonialPhoto(photo);
      }

      await api.post<{ data: Testimonial }>("/api/testimonials", {
        ...form,
        photo_url,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* ReactBits Aurora — WebGL ambient background (Backgrounds category) */}
        <div className="absolute inset-0">
          <Aurora colorStops={["#C08A2E", "#2F8F82", "#C08A2E"]} amplitude={0.8} blend={0.4} />
        </div>
        <div className="absolute inset-0 bg-ink-900/50" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md rounded-2xl border border-ink-700 bg-ink-800/80 p-8 text-center backdrop-blur"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-seal-500/15">
            <svg className="h-6 w-6 text-seal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-paper-100">Thank you</h1>
          <p className="mt-2 text-sm text-paper-400">
            Your testimonial is in review. Once it's approved, it'll appear on our wall of feedback.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setForm(EMPTY_FORM);
              setPhoto(null);
              setStatus("idle");
            }}
          >
            Submit another
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-16">
      <div className="absolute inset-0 opacity-70">
        <Aurora colorStops={["#C08A2E", "#2F8F82", "#C08A2E"]} amplitude={0.7} blend={0.45} />
      </div>
      <div className="absolute inset-0 bg-ink-900/55" />

      <div className="relative z-10 mx-auto max-w-lg">
        <ShinyText
          text="SHARE YOUR EXPERIENCE"
          color="#8b7a5e"
          shineColor="#E0B564"
          speed={3}
          className="font-mono text-xs uppercase tracking-[0.2em]"
        />
        <h1 className="mt-3 font-display text-4xl leading-tight text-paper-100 sm:text-5xl">
          <TextReveal text="Tell us how it went." />
        </h1>
        <p className="mt-4 text-paper-400">
          Two minutes of your time helps other people decide with confidence. We review every
          submission before it's shown publicly.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <Field label="Your name">
            <Input
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jamie Rivera"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jamie@company.com"
              />
            </Field>
            <Field label="Company (optional)">
              <Input
                maxLength={120}
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
              />
            </Field>
          </div>

          <Field label="Your testimonial">
            <Textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="What stood out about working with us?"
            />
            <p className="mt-1 text-right font-mono text-[11px] text-paper-400">
              {form.content.length}/2000
            </p>
          </Field>

          <Field label="Rating">
            <RatingInput value={form.rating} onChange={(v) => update("rating", v)} />
          </Field>

          <Field label="Photo (optional)">
            <input
              type="file"
              accept="image/*"
              disabled={!supabase}
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-paper-400 file:mr-3 file:rounded-md file:border-0 file:bg-ink-700 file:px-3 file:py-1.5 file:text-paper-100 file:text-xs disabled:opacity-40"
            />
            {!supabase && (
              <p className="mt-1 text-xs text-paper-400">
                Photo upload isn't configured for this deployment — text-only submissions still work.
              </p>
            )}
          </Field>

          {error && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          {/* ReactBits StarBorder — the one deliberate flourish on this page's
              single most important action (Animations category) */}
          <StarBorder
            as="button"
            type="submit"
            color="#C08A2E"
            speed="4s"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting…" : "Submit testimonial"}
          </StarBorder>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="block space-y-1.5">
      <span className="block font-mono text-[11px] uppercase tracking-wider text-paper-400">
        {label}
      </span>
      {children}
    </Label>
  );
}
