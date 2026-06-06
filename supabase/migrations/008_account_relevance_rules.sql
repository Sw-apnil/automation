alter table accounts
add column if not exists relevance_rules jsonb not null default '{
  "categoryWeights": {
    "transfer": 10,
    "result": 10,
    "fixture": 8,
    "injury": 8,
    "standing": 7,
    "squad": 7,
    "quote": 7,
    "team_news": 6,
    "other": 4,
    "academy": 3
  },
  "keywordBoost": 1,
  "keywordBoosts": {},
  "terms": [],
  "phraseBoosts": [
    { "phrase": "confirmed", "boost": 1 },
    { "phrase": "official", "boost": 1 }
  ]
}'::jsonb;

comment on column accounts.relevance_rules is 'Per-account relevance scoring rules controlled from the dashboard.';
