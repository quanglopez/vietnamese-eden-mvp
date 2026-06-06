-- ALE-185: Add nudge analytics event types
-- This is a minimal additive-only migration. No data migration, no table creation, 
-- no RLS changes, no payment/automation/secrets.
-- Safe to run multiple times (idempotent via DO block).

DO $$ BEGIN
  -- Check if values already exist to avoid errors on re-run
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'nudge_shown' AND enumtypid IN (SELECT oid FROM pg_type WHERE typname = 'analytics_event_type')) THEN
    ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'nudge_shown';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'nudge_clicked' AND enumtypid IN (SELECT oid FROM pg_type WHERE typname = 'analytics_event_type')) THEN
    ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'nudge_clicked';
  END IF;
END $$;

-- Verification queries (run after):
-- SELECT unnest(enumrange('analytics_event_type'::regtype)) as available_event_types;
