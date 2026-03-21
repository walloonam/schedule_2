CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT NOT NULL,
  tag_ids TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  CONSTRAINT events_valid_time_range CHECK (start_at < end_at)
);

CREATE INDEX IF NOT EXISTS events_calendar_id_idx ON events (calendar_id);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);
CREATE INDEX IF NOT EXISTS events_start_at_idx ON events (start_at);
CREATE INDEX IF NOT EXISTS events_end_at_idx ON events (end_at);
CREATE INDEX IF NOT EXISTS events_start_at_id_idx ON events (start_at, id);
CREATE INDEX IF NOT EXISTS events_tag_ids_gin_idx ON events USING GIN (tag_ids);

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
) VALUES
  (
    'evt_demo_001',
    'Sprint planning',
    'Scope the next iteration and assign owners.',
    '2026-03-23T01:00:00.000Z',
    '2026-03-23T02:00:00.000Z',
    'team',
    ARRAY['planning']::text[],
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
    ARRAY['review', 'backend']::text[],
    'tentative',
    '2026-03-21T00:00:00.000Z',
    '2026-03-21T00:00:00.000Z',
    'demo-user',
    'demo-user'
  )
ON CONFLICT (id) DO NOTHING;
