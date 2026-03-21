ALTER TABLE events
  ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(16),
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER,
  ADD COLUMN IF NOT EXISTS recurrence_until TIMESTAMPTZ;

UPDATE events
SET recurrence_interval = 1
WHERE recurrence_frequency IS NOT NULL
  AND recurrence_interval IS NULL;

ALTER TABLE events
  ALTER COLUMN recurrence_interval SET DEFAULT 1;

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_recurrence_frequency_check;

ALTER TABLE events
  ADD CONSTRAINT events_recurrence_frequency_check CHECK (
    recurrence_frequency IS NULL OR recurrence_frequency IN ('weekly')
  );

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_recurrence_interval_check;

ALTER TABLE events
  ADD CONSTRAINT events_recurrence_interval_check CHECK (
    recurrence_frequency IS NULL OR recurrence_interval >= 1
  );

CREATE INDEX IF NOT EXISTS events_recurrence_frequency_idx ON events (recurrence_frequency);
CREATE INDEX IF NOT EXISTS events_recurrence_until_idx ON events (recurrence_until);
