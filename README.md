# MyMovies — movie discovery and mood recommendations

React/TypeScript movie discovery app with Supabase authentication, favorites, TMDB proxy and a mood-to-genre edge function.

## Run locally

Copy `.env.example` to `.env.local`; fill the public Supabase URL and publishable key. Run `npm ci`, `npm run dev`, `npm run build`, and `npm run test`. Configure your Supabase project and deploy the checked-in edge functions separately.

## Status and limits

Live functionality requires your Supabase project, migration, TMDB_API_KEY and LOVABLE_API_KEY edge-function secrets. Never place these server secrets in VITE variables. No AWS deployment is verified by the repository name. An AWS static deployment must serve dist and route SPA navigation to index.html; backend functions remain separately hosted.

See [REPOSITORY_STATUS.md](REPOSITORY_STATUS.md) for the verification scope and remaining work.
