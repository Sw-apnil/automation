-- Make API-Football optional
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS api_football_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN accounts.api_football_enabled IS 'Controls whether API-Football collection is active for this account.';
