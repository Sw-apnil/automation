# Football Social Media Automation Platform

Production-oriented Next.js 15 app for collecting football events, scoring relevance, deduplicating stories, generating fan-style posts with Groq, attaching images, and publishing through Buffer.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives
- Supabase PostgreSQL
- Groq chat completions
- API-Football, GNews, and Guardian source adapters
- Buffer publishing through connected Buffer channels
- Inngest 5-minute scheduler
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

Groq, Buffer, GNews, Guardian, and API-Football values are configured per account in the `accounts` table. They are not read from `.env.local`.

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in production to protect the dashboard and non-cron API routes with Basic Auth.

4. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## 5-Minute Wakeup Flow

`GET /api/cron/every-15-min` runs:

Inngest calls the deployed `/api/inngest` endpoint every 5 minutes using the `run-football-automation-every-5-minutes` scheduled function. The app then checks each enabled account's `schedule_interval_minutes` and only processes accounts that are due. Due accounts fetch GNews/API-Football events -> normalize events -> score relevance -> skip low-score events before AI -> dedupe by event ID, headline hash, similar headline, and article URL -> select best candidates by relevance, recency, keyword strength, image availability, similarity, and category importance -> generate Groq fan post -> clean/retry weak output -> rotate hashtags -> select image -> queue -> publish due Buffer posts -> record posts and audit logs.

The existing cron endpoint is kept as a manual/fallback trigger:

If `CRON_SECRET` is set, call the cron endpoint with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/every-15-min
```

Inngest serves functions from:

```bash
https://your-app.vercel.app/api/inngest
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
- `buffer_channel_ids`
- `schedule_interval_minutes`
- optional `schedule_time_slots`
- `groq_api_key`, `groq_model`, `groq_temperature`, `groq_max_tokens`
- `buffer_access_token`
- `api_football_key`
- `gnews_api_key`, `gnews_enabled`
- `guardian_api_key`, `guardian_enabled`
- optional `team_id`, `league_id`, `logo_url`

Prompts live in `account_prompts`, so each account has its own personality without code changes. The account prompt controls voice and style; event fields such as `{title}`, `{description}`, `{category}`, and `{publishedAt}` control the substance.

### Relevance Rules

Each account controls scoring with `accounts.relevance_rules`. The JSON must be an object. Missing individual values use defaults, but player names, competitions, special terms, and phrase boosts should be configured per account instead of hardcoded in the app.

Example:

```json
{
  "categoryWeights": {
    "transfer": 10,
    "result": 10,
    "fixture": 8,
    "standing": 7,
    "injury": 8,
    "squad": 7,
    "team_news": 6,
    "quote": 7,
    "academy": 3,
    "other": 4
  },
  "keywordBoost": 1,
  "keywordBoosts": {
    "FIFA World Cup": 3,
    "World Cup 2026": 3,
    "qualifiers": 2
  },
  "terms": [
    { "term": "world cup", "score": 10 },
    { "term": "qualifier", "score": 9 }
  ],
  "phraseBoosts": [
    { "phrase": "official", "boost": 1 },
    { "phrase": "confirmed", "boost": 1 }
  ]
}
```

How scoring works:

- Starts from `categoryWeights[event.category]`.
- Adds `keywordBoost` for each matching account keyword.
- Uses `keywordBoosts` when a specific keyword needs a custom boost.
- Raises the score to a minimum value from matching `terms`.
- Adds every matching `phraseBoosts` value.
- Clamps the final score between `0` and `10`, then compares it with `relevance_threshold`.

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
3. Fill account identity, keywords, hashtags, style, prompt, Groq key/model, API-Football key, GNews key, Guardian key, Buffer token, and Buffer channel IDs.
4. Edit `Relevance rules JSON` to decide which categories, keywords, terms, and phrases matter for that account.
5. Set `Run every minutes`, for example `15`, `30`, or `60`.
6. Optionally set exact `Schedule time slots` as comma-separated `HH:MM` values, for example `09:00, 13:30, 21:00`.
7. Save. Inngest wakes the app every 5 minutes; the app checks these account-level schedule settings and only runs accounts that are due.

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

Publishing uses Buffer's GraphQL `createPost` mutation with `channelId`, `schedulingType: automatic`, and `mode: shareNow`, so new posts publish immediately instead of entering Buffer's posting queue.

When a required Buffer token or channel ID is missing, the account is treated as misconfigured and the failure is written to `audit_logs`.

## Docker

```bash
docker build -t football-social-automation .
docker run --env-file .env.local -p 3000:3000 football-social-automation
```

## Vercel + Inngest

1. Import the repo into Vercel.
2. Add all environment variables from `.env.example`.
3. Deploy.
4. Create an Inngest app and add these Vercel environment variables:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
5. In Inngest, sync the deployed endpoint:

```bash
https://your-app.vercel.app/api/inngest
```

6. Confirm the function named `Run football automation every 5 minutes` is enabled. It runs on `*/5 * * * *`.

The GitHub Actions workflow is now manual-only and can still call `/api/cron/every-15-min` as an emergency fallback if you keep `APP_URL` and `CRON_SECRET` configured in GitHub repository secrets.

## Operational Notes

- External API responses are cached in `api_cache` to reduce API spend. Fast-moving news and fixtures use shorter 15-minute cache windows; standings and transfers use longer windows.
- AI is only called after relevance and duplicate checks pass.
- Publish failures are retried with backoff using `post_queue.retry_count` and `next_attempt_at`.
- `audit_logs` records source errors, AI failures, duplicate skips, publish failures, and retry attempts.
