-- Account configuration
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS twitter_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS twitter_username text,
ADD COLUMN IF NOT EXISTS twitter_min_confidence integer NOT NULL DEFAULT 70;

-- New Event Categories
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'contract';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'official_statement';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'tournament_news';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'engagement';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'opinion';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'meme';

-- Raw Tweet Persistence
CREATE TABLE IF NOT EXISTS raw_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tweet_id text NOT NULL,
  username text NOT NULL,
  tweet_text text NOT NULL,
  tweet_created_at timestamptz,
  collected_at timestamptz NOT NULL DEFAULT now(),
  processing_status text NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'processed', 'skipped', 'failed')),
  ai_confidence integer,
  skip_reason text,
  raw_payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, tweet_id)
);

CREATE INDEX IF NOT EXISTS raw_tweets_account_status_idx ON raw_tweets(account_id, processing_status);
CREATE INDEX IF NOT EXISTS raw_tweets_account_collected_idx ON raw_tweets(account_id, collected_at DESC);

-- Sync State & Health Monitoring
CREATE TABLE IF NOT EXISTS twitter_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  last_tweet_id text,
  last_successful_sync timestamptz,
  last_sync_attempt timestamptz,
  sync_status text NOT NULL DEFAULT 'idle'
    CHECK (sync_status IN ('idle', 'syncing', 'error')),
  last_error text,
  last_error_at timestamptz,
  tweets_processed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id)
);

DROP TRIGGER IF EXISTS twitter_sync_state_set_updated_at ON twitter_sync_state;
CREATE TRIGGER twitter_sync_state_set_updated_at
BEFORE UPDATE ON twitter_sync_state
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
