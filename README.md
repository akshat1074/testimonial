# Testimonial Platform

A small testimonial collection + moderation + embeddable-widget product,
built for the SDE-1 take-home. Businesses collect testimonials, review
them in a dashboard, and show approved ones on a public wall and via an
embeddable widget on their own site.

## Stack

- **Frontend:** React + TypeScript (Vite), Tailwind CSS, Framer Motion,
  real **shadcn/ui** and **ReactBits** components (pulled from their
  GitHub source — see "Design" below for exactly which ones and why),
  plus a handful of hand-written components for things neither library
  has (the verification-seal stamp, the waveform rating).
- **Backend:** Node.js + Express + TypeScript.
- **Database:** Supabase (Postgres), accessed via the service-role key
  from the server only.
- **File storage:** Supabase Storage (`testimonial-photos` bucket), for
  the optional photo upload — uploaded directly from the browser, so
  the API never handles file bytes.

## Project structure

```
server/               Express API
  src/routes/          testimonials.ts (public submit + wall)
                        moderation.ts  (dashboard: list/approve/reject)
                        widget.ts      (open-CORS embed endpoints)
                        settings.ts    (accent color, business name, layout)
                        ai.ts          (P2 — AI sentiment tagging)
  supabase/schema.sql   run this in the Supabase SQL editor first

client/                React app
  src/pages/            SubmitPage, DashboardPage, WallPage, WidgetPage
  src/components/       hand-rolled UI kit (see "Design" below)

widget-demo.html       plain HTML page proving the embed works on a
                        page the React app has no control over
```

## Running it locally

### 1. Supabase

1. Create a free project at supabase.com.
2. Open the SQL editor and run `server/supabase/schema.sql`. This creates
   the `testimonials` and `settings` tables, RLS policies, and the
   `testimonial-photos` storage bucket.
3. Grab your project URL, `service_role` key, and `anon` key from
   Project Settings → API.

### 2. Backend

```bash
cd server
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:4000
```

### 3. Frontend

```bash
cd client
cp .env.example .env   # fill in VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev             # http://localhost:5173
```

- Submission form: `/submit`
- Moderation dashboard: `/dashboard` (no login — see Non-goals in the brief)
- Public wall: `/wall`
- Embed widget (meant for an iframe): `/embed`

### 4. Widget demo

Open `widget-demo.html` directly in a browser (or serve it with any
static server) while the client dev server is running. It's a
standalone page — not part of the Vite app — that iframes `/embed` to
prove the widget renders on a page the React app has no control over.

## What's done

- **P0 — full loop, end to end:** submit → pending in dashboard → approve
  → live on wall. Rejected testimonials are never queryable from any
  public endpoint (enforced server-side, not just hidden in the UI).
- **P1:**
  - Embeddable widget as an iframe (`/embed`), with a plain-HTML demo
    page proving third-party embedding.
  - Widget customization: accent color, business name, layout (grid/list),
    editable from the dashboard's settings panel, with a copy-pasteable
    embed snippet.
  - Duplicate-submission guard (same email + same content within 5
    minutes is rejected with a clear message) and per-IP rate limiting
    on the public submit endpoint.
  - Pagination on the wall ("Load more"); the widget caps at a fixed
    recent-N instead, since an embed shouldn't paginate.
  - Empty, loading, and error states on every page that fetches data.
- **P2:**
  - AI sentiment tagging: a dashboard button sends a testimonial's text
    to the Anthropic API and stores a positive/neutral/negative label.
    Runs on demand, not automatically on submit, so the core submit
    flow has no third-party dependency and API spend is opt-in. Only
    active if `ANTHROPIC_API_KEY` is set — the rest of the app works
    without it.
  - Live deploy: not done (see below).

## What's not done / cut for time

- **Live deploy.** The app is deploy-ready (Vercel/Netlify for `client`,
  Render/Railway/Fly for `server`) but wasn't actually deployed. See
  "Deploying" below for the exact steps if you want to do it.
- **Script-tag embed.** Only the iframe variant was built. A `<script>`
  embed avoids the iframe border but needs cross-origin height messaging
  and CSS isolation from the host page — judged not worth the time
  against an iframe that already solves the actual requirement (showing
  testimonials on a third-party site).
- No automated tests. Verification was manual (see JOURNAL.md).

## Design

The visual identity ties directly to what this product actually is —
collected, verified customer *voices* — rather than a generic SaaS
template, and it's built on **real shadcn/ui and ReactBits source**,
not hand-rolled lookalikes:

- **shadcn/ui** (`client/src/components/ui/`): pulled directly from the
  `shadcn-ui/ui` GitHub repo (`new-york-v4` style) — `button`, `card`,
  `input`, `textarea`, `label`, `badge`, `tabs`, `skeleton`, `sheet`,
  `dialog`, `separator`, plus the `cn()` utility. shadcn ships as
  copy-paste source, not an npm package, so these are the actual
  registry files with one import path fixed in `dialog.tsx`. Their
  CSS-variable theme (`--background`, `--primary`, etc., in
  `index.css`) is set to **this app's** ink/paper/seal palette in HSL,
  not shadcn's default slate — so the components inherit our brand,
  not a generic look.
- **ReactBits** (`client/src/components/reactbits/`): pulled from the
  `DavidHDev/react-bits` GitHub repo, one component from each of its
  four categories — `Aurora` (Backgrounds, WebGL via `ogl`), `SpotlightCard`
  (Components), `ShinyText` (TextAnimations), `StarBorder` (Animations).
  `Aurora` is the submit page's ambient background; `StarBorder` wraps
  its primary CTA; `ShinyText` is used on eyebrow labels; `SpotlightCard`
  wraps each item in the moderation queue for a mouse-follow highlight.
  `SpotlightCard`'s hardcoded `neutral-900` base colors were adjusted to
  our `ink-800`/`ink-700` tokens — reactbits' own docs describe editing
  the source directly as the intended workflow, not a deviation from it.
- **Deliberately not used everywhere:** the embed widget (`WidgetPage.tsx`)
  stays free of both — no WebGL, no extra bundle weight — because it
  loads inside an iframe on a third party's site, where every KB and
  render cost is a liability, not a flex. That's a design decision, not
  an oversight.
- **Signature element:** an animated "verification seal" stamp on every
  approved testimonial card (`StampSeal.tsx`, hand-written — neither
  library has anything like it), instead of a plain checkmark or badge.
- **Rating display:** a waveform-bar rating (`WaveformRating.tsx`, also
  hand-written) instead of plain star icons, echoing "voices" rather
  than a generic 5-star widget.
- **Two color modes, one product:** the dashboard/app-shell uses a dark
  ink navy (a functional, internal-tool feel); the public wall and
  widget use a cool paper background (credible, "put this on our
  website" feel). Both share the same configurable accent color
  (`seal.500`, default `#C08A2E`) so it still reads as one product.
- **Type:** Fraunces (display serif, for the quote-mark personality) +
  Inter (UI) + IBM Plex Mono (timestamps, labels, embed code — reads
  "document/certified").

## API surface

See `server/src/routes/*.ts` — each file has route-level comments
explaining the reasoning (especially the CORS split between
`/api/testimonials|moderation|settings` (locked to `APP_ORIGIN`) and
`/api/widget/*` (open to any origin, since that's the point of an embed)).

## Deploying (if you want to actually run this live)

1. **Backend:** push `server/` to Render/Railway/Fly. Set
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN` (your
   deployed frontend's URL), and optionally `ANTHROPIC_API_KEY` as
   environment variables. Build command `npm run build`, start command
   `npm start`.
2. **Frontend:** push `client/` to Vercel/Netlify. Set `VITE_API_URL`
   to the deployed backend's URL, plus `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.
3. Update `widget-demo.html`'s iframe `src` to point at the deployed
   frontend's `/embed` route.
