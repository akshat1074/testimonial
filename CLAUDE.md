# CLAUDE.md

Steering notes for any coding agent (Claude Code, Cursor, etc.) working
in this repo. Read this before making changes.

## What this is

A testimonial collection app: public submit form → moderation dashboard
→ public wall → embeddable widget. Full spec is in the assignment brief;
this file is about *how to work in the codebase*, not what it does.

## Non-negotiables

- **No auth.** Don't add login, sessions, or protected routes to the
  dashboard — it's explicitly a non-goal in the brief. If you're tempted
  to "improve security" by adding auth, don't; that's scope creep on a
  take-home with a hard time budget.
- **shadcn/ui and ReactBits are the component base — use them, don't
  bypass them.** `client/src/components/ui/` (shadcn) and
  `client/src/components/reactbits/` (ReactBits) contain real source
  pulled from their GitHub repos, not npm packages — that's how both
  libraries are meant to be used. If a new UI need comes up, check
  whether shadcn or ReactBits already has it before hand-writing a
  substitute. Pull additional components the same way these were
  added: fetch the raw source from `shadcn-ui/ui` (path pattern
  `apps/v4/registry/new-york-v4/ui/<name>.tsx`) or `DavidHDev/react-bits`
  (path pattern `src/ts-tailwind/<Category>/<Name>/<Name>.tsx`), not
  from memory — component APIs drift across versions. Only write a
  hand-rolled component when it's something neither library has and is
  specific to this product (e.g. `StampSeal.tsx`, `WaveformRating.tsx`).
- **The embed widget stays lean on purpose.** `WidgetPage.tsx`
  deliberately doesn't use Aurora (WebGL) or other heavy pieces from
  either library — it loads inside an iframe on a third party's site,
  where bundle size and render cost are a liability. Don't "improve" it
  by adding visual flourishes that belong on the wall/dashboard instead.
- **shadcn's theme is our palette, not shadcn's default.** The
  CSS-variable tokens in `index.css` (`--background`, `--primary`,
  etc.) are set to this app's ink/paper/seal colors in HSL. If you add
  a new shadcn component, it should inherit these automatically — don't
  hardcode shadcn's default slate/zinc classes on top of it.
- **The server is the trust boundary.** The Supabase client in
  `server/src/lib/supabase.ts` uses the service-role key and bypasses RLS
  entirely. That means every route is personally responsible for what it
  exposes — e.g. `routes/testimonials.ts` explicitly selects columns and
  excludes `email` from public responses; it doesn't rely on RLS to hide
  it. Keep that pattern: don't `select("*")` on anything a public route
  returns.
- **CORS is split on purpose.** `/api/testimonials`, `/api/moderation`,
  `/api/settings` are locked to `APP_ORIGIN`. `/api/widget/*` is
  intentionally open (`origin: true`) because embeds run on arbitrary
  third-party domains. Don't lock down `/api/widget/*` and don't loosen
  the others — if a new public-facing read is needed for the widget, add
  it under `/api/widget`, not by opening CORS elsewhere.

## Component conventions

- Every component that fetches or mutates data owns its own loading /
  error / empty states inline — don't introduce a global data-fetching
  library (React Query, SWR) for this app's size; `src/lib/api.ts` plus
  `useState`/`useEffect` is the established pattern.
- Motion goes through Framer Motion (`framer-motion`), already a
  dependency. Keep animations purposeful and short (150–500ms); this
  app already has a signature motion moment (`StampSeal`'s stamp-in) —
  don't add competing "look at me" animations elsewhere. See
  `/mnt/skills/public/frontend-design/SKILL.md`-style thinking: spend
  boldness in one place.
- Two color modes, one design system: dashboard/app-shell = dark (`ink-*`
  Tailwind tokens), wall/widget = light (`paper-*` tokens). Both pull the
  accent color from the same source (`settings.accent_color`,
  Tailwind default `seal.500`). If you add a new public-facing surface,
  it's light-mode; if it's an internal/owner-facing surface, it's dark.
- Types are duplicated (not shared via a package) between
  `server/src/types/testimonial.ts` and `client/src/types/testimonial.ts`
  on purpose — this is a two-package repo without a shared workspace
  setup. If you change one, change the other and check both `tsc`
  outputs.

## Verifying changes

There's no test suite. Before considering a change done:

```bash
cd server && npm run typecheck
cd client && npm run typecheck && npx vite build
```

Then manually walk the P0 loop: submit at `/submit` → confirm it shows
`pending` at `/dashboard` → approve → confirm it appears at `/wall`.

## Things intentionally left out (don't "fix" these)

- No pagination on the moderation dashboard — it's a single business
  with a manageable submission volume; the wall paginates because it's
  public-facing and could see real traffic.
- No script-tag embed, only iframe. See README "What's not done" for
  why.
- AI sentiment tagging (`routes/ai.ts`) runs on-demand from a dashboard
  button, not automatically on submission. Don't wire it into the
  submit flow — that would put a third-party API call on the P0 critical
  path for a P2 stretch feature.
