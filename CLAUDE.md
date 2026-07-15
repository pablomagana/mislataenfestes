# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static single-page web app for the "Fiestas de Mislata" Spanish town festival. It displays festival events (categories `patronales`/`populares`) with browsing, searching, filtering, and favoriting. The UI and content are in Spanish. The app is fully static with no backend.

## Commands

- `npm run dev` — Vite dev server on `0.0.0.0:3000`
- `npm run build` — production build to `dist/public` (runs `rm -rf dist` first)
- `npm run build:clean` — clears Vite cache + `dist`, reinstalls deps, rebuilds
- `npm run preview` — serve the production build locally
- `npm run check` — TypeScript type-check (`tsc`, no emit)
- `npm run db:push` — push Drizzle schema to Postgres (requires `DATABASE_URL`)

There is no test runner or linter configured.

## Architecture

React 18 + TypeScript, built with Vite. Routing via **wouter**, server-state via **TanStack Query**, UI via **shadcn/ui** (Radix + Tailwind, "new-york" style).

- **Active source is `src/`.** The alias `@` → `src` and `@shared` → `shared` (defined in both `vite.config.ts` and `tsconfig.json`). Note: a legacy `client/` directory exists but is not the app entry — the root `index.html` loads `src/main.tsx`.
- Routes (`src/App.tsx`): `/` (home), `/about`, `/evento/:eventId` (event detail), fallback NotFound.

### Data model — mostly static, no traditional backend

- Event data is **bundled static JSON**: `src/data/events.json` (imported directly, no HTTP) and `src/data/festivals.json` (festival metadata: title, start/end dates). The `useFestivalEvents` hooks in `src/hooks/use-festival-events.tsx` wrap this static data in TanStack Query and do filtering/search client-side.
- `shared/schema.ts` defines Drizzle/Zod types. The Postgres schema is legacy from a removed Express backend; its main current use is the exported `FestivalEvent` type. `drizzle.config.ts` still targets Postgres via `DATABASE_URL` but the running app does not query it.

### Event status is computed dynamically (`src/lib/festival-time.ts`)

Event `status` (`upcoming`/`ongoing`/`finished`) is **not stored** — it is recalculated on every load from the current time. Key domain rule: the "festival day" runs 08:00 to 05:00 next day. Events between 00:00–04:59 belong to the *previous* calendar day (`FESTIVAL_DAY_END_HOUR = 5`). An event's end time is inferred from the *next* event on the same day (or +2h default), so `calculateEventStatusFestival` needs the full day's events for correct results. When touching status/date logic, preserve this festival-time behavior.

### Analytics & privacy

GA4 is consent-gated: `src/lib/analytics.ts` only initializes after the user accepts analytics cookies via the `CookieBanner` / `useCookieConsent` flow. Consent is stored in localStorage.

## Environment variables

Vite `VITE_`-prefixed vars (in `.env`):
- `VITE_GA_MEASUREMENT_ID` — GA4 measurement ID

## Deployment

Static host (Cloudflare Pages). Build command `vite build`, output dir `dist/public`. SPA routing/headers configured via `public/_redirects` and `public/_headers`.
