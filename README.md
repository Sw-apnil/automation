# Football Social Media Automation Platform

Production-oriented Next.js 15 app for collecting football events, scoring relevance, deduplicating stories, generating fan-style posts with Groq, attaching images, and publishing through Buffer.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives
- Supabase PostgreSQL
- Groq chat completions
- API-Football and NewsAPI source adapters
- Buffer publishing through connected Buffer channels
- GitHub Actions 5-minute scheduler
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

Fill Supabase keys first. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.

Groq, Buffer, NewsAPI, and API-Football values are required per account in the `accounts` table. They are not read from `.env.local`.

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in production to protect the dashboard and non-cron API routes with Basic Auth.

4. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## 15-Minute Flow

`GET /api/cron/every-15-min` runs:

GitHub Actions calls the deployed cron endpoint every 5 minutes. The app then checks each account's UI-configured schedule and only runs accounts that are due. Due accounts fetch News/API-Football events -> normalize events -> score relevance -> skip low-score events before AI -> dedupe by event ID, headline hash, similar headline, and article URL -> select best candidates by relevance, recency, keyword strength, image availability, similarity, and category importance -> generate Groq fan post -> clean/retry weak output -> rotate hashtags -> select image -> queue -> publish due Buffer posts -> record posts and audit logs.

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
- `relevance_rules`
- `max_posts_per_run`
- `duplicate_retention_days`
- `buffer_channel_ids`
- `schedule_interval_minutes`
- optional `schedule_time_slots`
- `groq_api_key`, `groq_model`, `groq_temperature`, `groq_max_tokens`
- `buffer_access_token`
- `news_api_key`, `api_football_key`
- optional `team_id`, `league_id`, `logo_url`

Prompts live in `account_prompts`, so each account has its own personality without code changes. The account prompt controls voice and style; event fields such as `{title}`, `{description}`, `{category}`, and `{publishedAt}` control the substance.

Relevance rules live in `accounts.relevance_rules`. Users can control:

- category weights, such as transfer/result/injury
- default keyword boost
- per-keyword boosts, such as Mbappe or Bellingham
- terms that force a minimum score
- phrase boosts, such as confirmed or official

The app no longer hardcodes star players or competition importance. Those decisions belong to each account's rules.

Account API:

- `GET /api/accounts` lists accounts.
- `POST /api/accounts` creates a configurable account.
- `PATCH /api/accounts/:id` updates account settings and can rotate the active Groq prompt.
- `DELETE /api/accounts/:id` removes an account and cascades its related configuration.

Deployment readiness:

- `GET /api/health` reports which integrations are configured without returning secret values.

Frontend account setup:

1. Open `/dashboard/accounts`.
2. Use `Create Account`.
3. Fill account identity, keywords, hashtags, style, prompt, Groq key/model, NewsAPI key, API-Football key, Buffer token, and Buffer channel IDs.
4. Set `Run every minutes`, for example `15`, `30`, or `60`.
5. Optionally set exact `Schedule time slots` as comma-separated `HH:MM` values, for example `09:00, 13:30, 21:00`.
6. Save. GitHub Actions wakes the app every 5 minutes; the app checks these account-level schedule settings and only runs accounts that are due.

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

Set each account's `buffer_access_token` and channel IDs in `accounts.buffer_channel_ids`. A Buffer channel is one connected destination inside Buffer, such as a specific X account, Threads account, Facebook page, etc. Buffer already knows the platform for each channel ID, so the app only needs the channel IDs to publish.

Publishing uses Buffer's GraphQL `createPost` mutation with `channelId`, `schedulingType: automatic`, and `mode: addToQueue`.

When a required Buffer token or channel ID is missing, the account is treated as misconfigured and the failure is written to `audit_logs`.

## Docker

```bash
docker build -t football-social-automation .
docker run --env-file .env.local -p 3000:3000 football-social-automation
```

## Vercel + GitHub Actions

1. Import the repo into Vercel.
2. Add all environment variables from `.env.example`.
3. Deploy.
4. In GitHub repository settings, add Actions secrets:
   - `APP_URL`: your deployed Vercel URL, for example `https://your-app.vercel.app`
   - `CRON_SECRET`: the same value used in Vercel env vars
5. GitHub Actions workflow `.github/workflows/every-5-min.yml` calls `/api/cron/every-15-min` every 5 minutes.

Vercel Cron is intentionally not used because the free tier may restrict high-frequency schedules.

## Operational Notes

- External API responses are cached in `api_cache` to reduce API spend. Fast-moving news and fixtures use shorter 15-minute cache windows; standings and transfers use longer windows.
- Duplicate marker rows in `published_events` are cleaned per account using `duplicate_retention_days`, default `90`.
- AI is only called after relevance and duplicate checks pass.
- Publish failures are retried with backoff using `post_queue.retry_count` and `next_attempt_at`.
- `audit_logs` records source errors, AI failures, duplicate skips, publish failures, and retry attempts.
