# Repository status — 22 September 2026

## Role

React/TypeScript movie discovery app with Supabase authentication, favorites, TMDB proxy and a mood-to-genre edge function.

## Reproduction

Copy `.env.example` to `.env.local`; fill the public Supabase URL and publishable key. Run `npm ci`, `npm run dev`, `npm run build`, and `npm run test`. Configure your Supabase project and deploy the checked-in edge functions separately.

## Outstanding work

Live functionality requires your Supabase project, migration, TMDB_API_KEY and LOVABLE_API_KEY edge-function secrets. Never place these server secrets in VITE variables. No AWS deployment is verified by the repository name. An AWS static deployment must serve dist and route SPA navigation to index.html; backend functions remain separately hosted.

Build or unit-test success is not evidence of a deployed service or a completed research evaluation. See the pull request for checks executed for this revision.

## Checks executed in this pass

Production build passed after fixing CSS import order and handling missing public configuration. The existing single placeholder test passes but does not validate product behavior. Supabase/TMDB live workflows remain untested.
