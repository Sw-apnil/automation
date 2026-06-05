# Football Social Media Automation Platform

Production-oriented Next.js 15 app for collecting football events, scoring relevance, deduplicating stories, generating fan-style posts with Groq, attaching images, and publishing through Buffer.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives
- Supabase PostgreSQL
- Groq chat completions
- API-Football and NewsAPI source adapters
- Buffer publishing for X and Threads profiles
- Vercel Cron 15-minute scheduler
- Docker support

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run the migration:

```bash
supabase db push
```

Or paste `supabase/migrations/001_initial_schema.sql` into the Supabase SQL editor.

3. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill all provider keys. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in production to protect the dashboard and non-cron API routes with Basic Auth.

4. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## 15-Minute Flow

`GET /api/cron/every-15-min` runs:

Fetch News/API-Football events every 15 minutes -> normalize events -> score relevance -> skip low-score events before AI -> dedupe by event ID, headline hash, similar headline, and article URL -> select best candidates by relevance, recency, keyword strength, image availability, similarity, and category importance -> generate Groq fan post -> clean/retry weak output -> rotate hashtags -> select image -> queue -> publish due Buffer posts -> record posts and audit logs.

If `CRON_SECRET` is set, call the cron endpoint with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/every-15-min
```

## Account Configuration

Accounts live in the `accounts` table. Add a new account by inserting a row with:

- `name`, `slug`
- `keywords`
- `hashtags`
- `style`
- `character_limit`
- `relevance_threshold`
- `max_posts_per_run`
- `buffer_profiles`
- `platforms`
- optional `team_id`, `league_id`, `logo_url`

Prompts live in `account_prompts`, so each account has its own personality without code changes. The account prompt controls voice and style; event fields such as `{title}`, `{description}`, `{category}`, and `{publishedAt}` control the substance.

Account API:

- `GET /api/accounts` lists accounts.
- `POST /api/accounts` creates a configurable account.
- `PATCH /api/accounts/:id` updates account settings and can rotate the active Groq prompt.
- `DELETE /api/accounts/:id` removes an account and cascades its related configuration.

Deployment readiness:

- `GET /api/health` reports which integrations are configured without returning secret values.

## Image Priority

1. News article image
2. API-Football event image
3. Player image from metadata
4. Team logo
5. No image

## Duplicate Protection

The `published_events` table stores:

- `source_event_id`
- `headline_hash`
- `normalized_headline`
- `source_url`

The pipeline checks exact source IDs, headline hashes, same article URLs, and recent near-duplicate token overlap before queueing a post.

## Buffer

Set `BUFFER_ACCESS_TOKEN` and add Buffer profile IDs to `accounts.buffer_profiles`. When the token is missing, publishing returns dry-run IDs so local development does not accidentally post.

## Docker

```bash
docker build -t football-social-automation .
docker run --env-file .env.local -p 3000:3000 football-social-automation
```

## Vercel

1. Import the repo into Vercel.
2. Add all environment variables from `.env.example`.
3. Deploy.
4. `vercel.json` schedules `/api/cron/every-15-min` every 15 minutes with `*/15 * * * *`.

## Operational Notes

- External API responses are cached in `api_cache` to reduce API spend. Fast-moving news and fixtures use shorter 15-minute cache windows; standings and transfers use longer windows.
- AI is only called after relevance and duplicate checks pass.
- Publish failures are retried with backoff using `post_queue.retry_count` and `next_attempt_at`.
- `audit_logs` records source errors, AI failures, duplicate skips, publish failures, and retry attempts.
