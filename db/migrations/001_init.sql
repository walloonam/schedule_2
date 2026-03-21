CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  calendar_id VARCHAR(64) NOT NULL,
  tag_ids TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(16) NOT NULL CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by VARCHAR(64) NOT NULL,
  updated_by VARCHAR(64) NOT NULL,
  CONSTRAINT events_valid_time_range CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS events_start_at_idx ON events (start_at);
CREATE INDEX IF NOT EXISTS events_calendar_id_idx ON events (calendar_id);
CREATE INDEX IF NOT EXISTS events_tag_ids_gin_idx ON events USING GIN (tag_ids);
CREATE INDEX IF NOT EXISTS events_search_idx ON events USING GIN (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
);

INSERT INTO events (
  id,
  title,
  description,
  start_at,
  end_at,
  calendar_id,
  tag_ids,
  status,
  created_at,
  updated_at,
  created_by,
  updated_by
)
VALUES
  (
    'evt_demo_001',
    'Sprint planning',
    'Scope the next iteration and assign owners.',
    '2026-03-23T01:00:00.000Z',
    '2026-03-23T02:00:00.000Z',
    'team',
    ARRAY['planning'],
    'confirmed',
    '2026-03-21T00:00:00.000Z',
    '2026-03-21T00:00:00.000Z',
    'demo-user',
    'demo-user'
  ),
  (
    'evt_demo_002',
    'API review',
    'Review schedule API contracts with frontend.',
    '2026-03-24T06:00:00.000Z',
    '2026-03-24T07:00:00.000Z',
    'team',
    ARRAY['review', 'backend'],
    'tentative',
    '2026-03-21T00:00:00.000Z',
    '2026-03-21T00:00:00.000Z',
    'demo-user',
    'demo-user'
  )
ON CONFLICT (id) DO NOTHING;
